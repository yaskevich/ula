import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/home',
    name: 'Home',
    alias: '/',
    component: () => import('./components/Home.vue'),
  },
  {
    path: '/lexicon',
    name: 'Lexicon',
    component: () => import('./components/Lexicon.vue'),
  },
  {
    path: '/structure',
    name: 'Structure',
    component: () => import('./components/Structure.vue'),
  },
  {
    path: '/place/:id?',
    name: 'Place',
    component: () => import('./components/Place.vue'),
  },
  {
    path: '/places',
    name: 'Places',
    component: () => import('./components/Places.vue'),
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('./components/Groups.vue'),
  },
  {
    path: '/country/:id?',
    name: 'Top',
    component: () => import('./components/Top.vue'),
  },
  {
    path: '/list/:page?/:limit?',
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
