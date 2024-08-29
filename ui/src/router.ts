import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/home',
    name: 'Home',
    // component: Home,
    component: () => import('./components/Home.vue'),
  },
  {
    path: '/lexicon',
    name: 'Lexicon',
    // component: Home,
    component: () => import('./components/Lexicon.vue'),
  },
  {
    path: '/country/:id?',
    name: 'Top',
    component: () => import('./components/Top.vue'),
  },
  {
    path: '/list/:limit?',
    name: 'All',
    component: () => import('./components/All.vue'),
  },
  {
    path: '/regions/:id?',
    name: 'Regions',
    component: () => import('./components/Regions.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
