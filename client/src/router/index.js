import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    children: [
      {
        path: 'task',
        name: 'Task',
        component: () => import('../views/Task.vue')
      },
      {
        path: 'create_task',
        name: 'CreateTask',
        component: () => import('../views/CreateTask.vue')
      },
      {
        path: 'task/:id',
        component: () => import('../views/TaskDetail.vue'),
        props: true
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
