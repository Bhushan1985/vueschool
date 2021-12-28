import { createWebHistory, createRouter } from 'vue-router'
import Sign_on from '@/views/Sign-on.vue'
const routes = [{ path: '/', component: Sign_on }]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
