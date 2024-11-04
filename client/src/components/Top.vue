<template>
  <!-- <h2>Analysis of the street names of Poland</h2> -->
  <n-space>
    <D3Map />
    <div>
      <div v-for="(val, index) in (store.freq as any).slice(0, 500) ">
        <n-button text :type="route.fullPath !== `/country/${index + 1}` ? 'default' : 'info'"
          @click="router.push(`/country/${index + 1}`)">{{
            index + 1
          }}. {{ val[0] }}</n-button>
      </div>
    </div>
  </n-space>
  <!--
    <div class="field mx-auto text-center">
        <InputText id="search" aria-describedby="search-help" type="text" v-model="userinput" @input="inputEvent" class="d-block mx-auto" />
        <small id="search-help">Увядзіце больш за 2 знакі. <br/>Вынік адлюстроўваецца імгненна</small>u
    </div>
    -->
</template>

<script setup lang="ts">
import store from '../store';
import D3Map from './D3Map.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
// console.log(route.fullPath);
</script>

<style scoped>
.item {
  margin-bottom: 1rem;
  padding: 5px;
  /* background: darkred;
       color:white;
      */
}
</style>
