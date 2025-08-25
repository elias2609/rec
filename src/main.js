import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
// Font Awesome icon component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Vue3SocialSharingPlugin from 'vue3-social-sharing'
import './assets/main.css'  // TailwindCSS
import {
  faWhatsapp,
  faFacebookF,
  faTelegram
} from '@fortawesome/free-brands-svg-icons'

// Agrégalos a la librería
library.add(faWhatsapp, faFacebookF, faTelegram)

createApp(App)
  .use(router)
  .use(Vue3SocialSharingPlugin)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app')
