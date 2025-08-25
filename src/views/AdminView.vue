<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mx-auto max-w-3xl space-y-8">
    <article class="w-full max-w-prose mx-auto space-y-6">
      <!-- Header con contador -->
      <div class="flex justify-center items-center">
        <div>
          <h1 class="text-2xl font-bold">Panel de Donaciones</h1>
        </div>
      </div>
      <section class="w-full text-center space-y-3">
        <h2 class="text-xl font-medium">Total recaudado</h2>
        <AmountCounter :amount="totalCollected" :duration="1500" class="mt-2" />
      </section>

      <!-- Formulario -->
      <form @submit.prevent="addDonation" class="flex space-x-2">
        <input v-model="donor" placeholder="Donante" class="flex-1 border px-3 py-2 rounded" />
        <input v-model.number="amount" placeholder="Monto $" class="w-24 border px-3 py-2 rounded" />
        <button class="bg-green-600 text-white px-4 rounded">Agregar</button>
      </form>

      <!-- Lista -->
      <ul class="space-y-2">
        <li v-for="d in donations" :key="d.id" class="flex justify-between items-center border px-4 py-2 rounded">
          <span>{{ d.donor_name }} — ${{ d.amount }}</span>
          <button @click="deleteDonation(d.id)" class="text-red-600 hover:underline">
            Borrar
          </button>
        </li>
      </ul>
    </article>
  </div>
</template>

<script>
import { supabase } from '@/services/supabase'
import AmountCounter from '@/components/AmountCounter.vue'

export default {
  components: { AmountCounter },

  data() {
    return {
      donations: [],
      donor: '',
      amount: null,
      subscription: null
    }
  },

  computed: {
    totalCollected() {
      return this.donations.reduce((sum, d) => sum + Number(d.amount), 0)
    }
  },

  async created() {
    // Carga inicial
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { descending: true })
    if (!error) this.donations = data

    // Suscripción realtime
    const channel = supabase
      .channel('public:donations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        this.handleChange
      )

    const { data: subscribed, error: subError } = await channel.subscribe()
    if (subError) console.error(subError)
    else this.subscription = subscribed
  },

  beforeUnmount() {
    if (this.subscription) supabase.removeChannel(this.subscription)
  },

  methods: {
    handleChange({ eventType, new: newRecord, old: oldRecord }) {
      if (eventType === 'INSERT') {
        if (!this.donations.find(d => d.id === newRecord.id)) {
          this.donations.unshift(newRecord)
        }
      }
      else if (eventType === 'DELETE') {
        this.donations = this.donations.filter(d => d.id !== oldRecord.id)
      }
    },

    async addDonation() {
      if (!this.donor || !this.amount) return

      const { data, error } = await supabase
        .from('donations')
        .insert({ donor_name: this.donor, amount: this.amount })
        .select()

      if (error) {
        console.error(error)
      } else {
        // feedback inmediato
        this.donations.unshift(data[0])
        this.donor = ''
        this.amount = null
      }
    },

    async deleteDonation(id) {
      const { error } = await supabase.from('donations').delete().eq('id', id)
      if (!error) this.donations = this.donations.filter(d => d.id !== id)
    },

    async logout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>