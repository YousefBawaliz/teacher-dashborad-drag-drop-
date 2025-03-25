import { createApp } from 'vue'
// import './style.css'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles/main.css'
import router from './router'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import {aliases, mdi} from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Components
import App from './App.vue'

const pinia = createPinia()
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  }

})

createApp(App).use(vuetify).use(router).use(pinia).mount('#app')

