import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './workers/register_service_worker.js'
const me = localStorage.me
if (!me) localStorage.me = '/+'

createApp(App).use(router).mount('body')
