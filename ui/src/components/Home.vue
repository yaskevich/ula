<template>
  <!-- <h2>Analysis of the street names of Poland</h2> -->
  <div class="grid">
    <div class="col">
      <D3Map />
    </div>
    <div class="col">

    </div>
  </div>

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
