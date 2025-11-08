<template>
  <n-back-top />
  <n-config-provider :locale="store.state.locale" :date-locale="store.state.dateLocale">
    <n-modal-provider>
      <div class="container">
        <div id="main">
          <div id="nav">
            <n-button @click="
              () => {
                store.state.locale = null;
                store.state.dateLocale = null;
                store.state.loc = 0;
              }
            ">
              EN
            </n-button>
            <n-button @click="
              () => {
                store.state.loc = 1;
                store.state.locale = plPL;
                store.state.dateLocale = datePlPL
              }
            ">
              PL
            </n-button>
            <span v-for="(page, index) in pages">
              <router-link :to="'/' + page">{{ store.t('pages', page) }}</router-link><span
                v-show="index + 1 !== pages.length">|</span>
            </span>
          </div>
        </div>
        <div class="content">
          <router-view />
        </div>
        <div class="footer p-2" id="about">
          <p>
            <a href="https://yaskevich.com/" target="_blank">Alyaxey Yaskevich</a>, 2024&mdash;2025. Version: {{
              store.version }}
            <a :href="store.git" target="_blank">
              <i class="pi pi-github"></i>
            </a>
          </p>
          <p>
            <small>
              The icon «Place Marker» is from
              <a href="https://icons8.com/icon/30622/place-marker" target="_blank">Icons8</a>.
            </small>
          </p>
        </div>
      </div>
    </n-modal-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import store from './store';
import { datePlPL, plPL } from 'naive-ui';

const pages = ["home", "country", "regions", "groups", "list", "structure", "places", "lexicon"];
</script>

<style>
#app {
  font-family: 'Open Sans', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: left; */
  color: #2c3e50;
  /* margin-top: 60px; */
  padding: 2rem;
  background-color: #f1eef639;
}

#nav {
  margin-bottom: 1rem;
}

.footer {
  /* background: #f8f6f6; */
  border-radius: 5px;
  padding: 5px;
}

.router-link-active {
  font-weight: bold;
}

.content {
  min-height: calc(100vh - 220px);
}

a {
  color: gray;
  /* font-weight: bold; */
  text-decoration: none;
}

.container {
  max-width: 900px;
  margin: auto;
}
</style>
