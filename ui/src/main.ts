import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import router from './router';
import Button from 'primevue/button';
import ButtonGroup from 'primevue/buttongroup';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Tree from 'primevue/tree';
import CascadeSelect from 'primevue/cascadeselect';
import Badge from 'primevue/badge';
import Card from 'primevue/card';
import ScrollTop from 'primevue/scrolltop';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import Nora from '@primevue/themes/nora';
import { definePreset } from '@primevue/themes';
import '@fontsource/open-sans'; // Defaults to weight 400 with normal variant.
import '@fontsource/open-sans/400-italic.css'; // Italic variant.
import '@fontsource/open-sans/700.css'; // Bold variant.
import '@fontsource/open-sans/700-italic.css'; // Bold italic variant.

const app = createApp(App);
app.component('Button', Button);
app.component('ButtonGroup', ButtonGroup);
app.component('Badge', Badge);
app.component('Tag', Tag);
app.component('Tree', Tree);
app.component('Card', Card);
app.component('Checkbox', Checkbox);
app.component('InputText', InputText);
app.component('CascadeSelect', CascadeSelect);
app.component('ScrollTop', ScrollTop);

const preset = definePreset(Nora, {
    semantic: {
        primary: {
            50: '{sky.50}',
            100: '{sky.100}',
            200: '{sky.200}',
            300: '{sky.300}',
            400: '{sky.400}',
            500: '{sky.500}',
            600: '{sky.600}',
            700: '{sky.700}',
            800: '{sky.800}',
            900: '{sky.900}',
            950: '{sky.950}'
        }
    }
});

app.use(PrimeVue, { theme: { preset } }).use(router).mount('#app');
