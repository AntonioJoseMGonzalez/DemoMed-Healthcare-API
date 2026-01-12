import './global'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Bootstrap
import { createBootstrap } from 'bootstrap-vue-next/plugins/createBootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createBootstrap())

app.mount('#app')
