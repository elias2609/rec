<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Barra de navegación opcional -->
    <nav class="bg-white shadow p-4 mb-6">
      <router-link to="/" class="mr-4 text-blue-600 hover:underline">
        Público
      </router-link>
      <router-link to="/admin" class="text-blue-600 hover:underline">
        Admin
      </router-link>
    </nav>

    <!-- Aquí se renderizará Login.vue, Public.vue o Admin.vue según la ruta -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>