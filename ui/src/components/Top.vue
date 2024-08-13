<template>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
    <div class="grid">
      <div class="col">
        <D3Map />
      </div>
      <div class="col">
        <div v-for="(val,index) in store.freq.streets.slice(0,500)">
          <Button text @click="$router.push(`/top/${index}`)">{{index +1}}. {{ Object.keys(val).shift() }}</Button>
          </div>
        </div>
  
    </div>
    <!--
    <div class="field mx-auto text-center">
        <InputText id="search" aria-describedby="search-help" type="text" v-model="userinput" @input="inputEvent" class="d-block mx-auto" />
        <small id="search-help">Увядзіце больш за 2 знакі. <br/>Вынік адлюстроўваецца імгненна</small>u
    </div>
    -->
  
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue';
  import store from '../store';
  import D3Map from './D3Map.vue';
  
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
  