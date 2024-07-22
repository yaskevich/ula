<script setup lang="ts">
import { ref, reactive } from 'vue';
import store from '../store';

const selectedArea = ref({} as ICascadeItem);

const showInfo = ref(false);
</script>

<template>
  <h2>Analysis of Polsih street names</h2>

  <!--
  <div class="field mx-auto text-center">
      <InputText id="search" aria-describedby="search-help" type="text" v-model="userinput" @input="inputEvent" class="d-block mx-auto" />
      <small id="search-help">Увядзіце больш за 2 знакі. <br/>Вынік адлюстроўваецца імгненна</small>u
  </div>
  -->

  <div class="mb-4" v-if="showInfo">
    <!-- <hr /> -->
  </div>

</template>

<style scoped>
.item {
  margin-bottom: 1rem;
  padding: 5px;
  /* background: darkred;
     color:white;
    */
}
</style>
