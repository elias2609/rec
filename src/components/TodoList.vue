<template>
  <div class="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
    <h1 class="text-2xl font-bold mb-4">Lista de Tareas</h1>

    <!-- Formulario para nueva tarea -->
    <form @submit.prevent="addTodo" class="flex mb-4">
      <input
        v-model="newText"
        class="flex-1 border rounded-l px-3 py-2"
        placeholder="Nueva tarea…"
      />
      <button
        class="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
      >
        Agregar
      </button>
    </form>

    <!-- Lista de tareas -->
    <ul>
      <li
        v-for="t in todos"
        :key="t.id"
        class="flex items-center justify-between border-b py-2"
      >
        <!-- Modo Edición -->
        <div v-if="editingId === t.id" class="flex-1 mr-2">
          <input
            v-model="editText"
            class="w-full border px-2 py-1 rounded"
          />
        </div>

        <!-- Modo Lectura -->
        <div v-else class="flex-1">{{ t.text }}</div>

        <!-- Botones de acción -->
         <div class="flex space-x-2">
        <button
          v-if="editingId === t.id"
          @click="updateTodo"
          class="text-green-600"
        >
          Guardar
        </button>
        <button
          v-if="editingId === t.id"
          @click="cancelEdit"
          class="text-gray-600"
        >
          Cancelar
        </button>

        <button
          v-if="editingId !== t.id"
          @click="startEdit(t)"
          class="text-blue-600"
        >
          Editar
        </button>
        <button
          v-if="editingId !== t.id"
          @click="deleteTodo(t.id)"
          class="text-red-600"
        >
          Borrar
        </button>
      </div>


      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '@/services/supabase'

export default {
  data() {
    return {
      todos: [],
      newText: '',
      editingId: null,
      editText: ''
    }
  },

  async created() {
    // 1. Carga inicial
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true })
    if (error) {
      console.error('Error cargando todos:', error)
    } else {
      this.todos = data
    }

    // 2. Suscripción realtime
    this.subscription = (
      await supabase
        .channel('public:todos')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'todos' },
          payload => {
            const { eventType, new: newRec, old: oldRec } = payload
            if (eventType === 'INSERT') {
              // evita duplicados
              if (!this.todos.find(t => t.id === newRec.id)) {
                this.todos.push(newRec)
              }
            }
            if (eventType === 'UPDATE') {
              this.todos = this.todos.map(t =>
                t.id === newRec.id ? newRec : t
              )
            }
            if (eventType === 'DELETE') {
              this.todos = this.todos.filter(t => t.id !== oldRec.id)
            }
          }
        )
        .subscribe()
    )
  },

  beforeUnmount() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription)
    }
  },

  methods: {
    // Crear nueva tarea
    async addTodo() {
      if (!this.newText) return
      const { error } = await supabase
        .from('todos')
        .insert({ text: this.newText })
      if (error) console.error('Error insertando:', error)
      this.newText = ''
    },

    // Iniciar edición
    startEdit(todo) {
      this.editingId = todo.id
      this.editText = todo.text
    },

    // Cancelar edición
    cancelEdit() {
      this.editingId = null
      this.editText = ''
    },

    // Guardar cambios
    async updateTodo() {
      if (!this.editText.trim()) return

      const { data, error } = await supabase
        .from('todos')
        .update({ text: this.editText })
        .eq('id', this.editingId)
        .select()

      if (error) {
        console.error('Error actualizando:', error)
      } else if (data && data.length) {
        // opcional: feedback instantáneo
        this.todos = this.todos.map(t =>
          t.id === data[0].id ? data[0] : t
        )
      }

      this.cancelEdit()
    },

    // Borrar tarea
    async deleteTodo(id) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error borrando:', error)
      } else {
        // opcional: feedback instantáneo
        this.todos = this.todos.filter(t => t.id !== id)
      }
    }
  }
}
</script>