import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/home',
    name: 'Home',
    alias: '/',
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
    path: '/structure',
    name: 'Structure',
    // component: Home,
    component: () => import('./components/Structure.vue'),
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
