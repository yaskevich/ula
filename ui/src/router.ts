import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/home',
    name: 'Home',
    // component: Home,
    component: () => import('./components/Home.vue'),
  },
  {
    path: '/top/:id?',
    name: 'Top',
    component: () => import('./components/Top.vue'),
  },
  // {
  //   path: '/list',
  //   name: 'List',
  //   component: () => import('./components/List.vue'),
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
