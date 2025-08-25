<template>
  <div class="max-w-sm mx-auto mt-20 p-4 bg-white rounded shadow">
    <h2 class="text-xl mb-4">Admin Login</h2>
    <form @submit.prevent="onSubmit" class="space-y-3">
      <input v-model="password" type="password" placeholder="Password"
             class="w-full border px-3 py-2 rounded" />
      <button class="w-full bg-blue-600 text-white py-2 rounded">
        Ingresar
      </button>
    </form>
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script>
import { signIn } from '@/services/auth'

export default {
  name: 'LoginView',
  data() {
    return { password: '', error: '' }
  },
  methods: {
    async onSubmit() {
      this.error = ''
      const email = 'elias.freites16@gmail.com'
      const { error } = await signIn(email, this.password)
      if (error) this.error = error.message
      else this.$router.push('/admin')
    }
  }
}
</script>