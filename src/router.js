import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import AdminView from './views/AdminView.vue'
import PublicView from './views/PublicView.vue'
import { supabase } from './services/supabase'

const routes = [
  { path: '/', component: PublicView },
  { path: '/login', component: LoginView },
  { 
    path: '/admin',
    component: AdminView,
    beforeEnter: async (to, from, next) => {
      const { data } = await supabase.auth.getSession()
      if (data.session) next()
      else next('/login')
    }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})