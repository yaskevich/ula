<template>
  <!-- <h2>Analysis of the street names of Poland</h2> -->
  <n-space>
    <D3Map :street="street" />
    <div>
      <div v-for="(val, index) in stats ">
        <n-button text :type="route.fullPath !== `/country/${index + 1}` ? 'default' : 'info'"
          @click="showName(index, val.name)">{{
            index + 1
          }}. {{ val.name }}</n-button>
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
import { onBeforeMount, ref } from 'vue';
import D3Map from './D3Map.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const stats = ref();
const street = ref('');

const showName = (index: number, name: string) => {
  router.push(`/country/${index + 1}`);
  street.value = name;
};

const getNames = async () => {
  const response = await fetch('/api/names');
  if (response.status === 200) {
    const data = await response.json();
    stats.value = data;
    street.value = data[0].name;
  }
};

onBeforeMount(async () => await getNames());

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
