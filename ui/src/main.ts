import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@fontsource/open-sans'; // Defaults to weight 400 with normal variant.
import '@fontsource/open-sans/400-italic.css'; // Italic variant.
import '@fontsource/open-sans/700.css'; // Bold variant.
import '@fontsource/open-sans/700-italic.css'; // Bold italic variant.

createApp(App).use(router).mount('#app');
