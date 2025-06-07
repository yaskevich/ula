<template>
  <!-- <h2>Analysis of the street names of Poland</h2> -->
  <n-space>
    <D3Map :street="street" />
    <div>
      <n-button @click="loadUp" :disabled="id < 2">
        <template #icon>
          <n-icon :component="ArrowUp" />
        </template>
      </n-button>

      <div v-for="(val, index) in stats">
        <n-button text :type="(val.rank === id) ? 'info' : 'default'" @click="showName(val.rank, val.name)">{{
          val.rank }}. {{ val.name }}</n-button>
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
import { onBeforeMount, ref, toRaw } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { ArrowUp, ArrowDown } from '@vicons/carbon';

import D3Map from './D3Map.vue';
import store from '../store';

const router = useRouter();
const route = useRoute();
const stats = ref();
const street = ref('');
const id = ref(Number(toRaw(route?.params?.id)) - 1 || 0);

const getId = (idx: number) => id.value > 500 ? idx + 1 + id.value - 10 : idx + 1;

const showName = (index: number, name: string) => {
  router.push(`/country/${index}`);
  id.value = index;
  street.value = name;
};

const getNames = async () => {
  const data = await store.api('names/' + id.value);
  if (id.value === -1) {
    id.value = 0;
  }
  stats.value = data;
  street.value = data.find((x: any) => x.rank === (id.value + 1))?.name;
};

const loadUp = async () => {
  id.value -= 1;
  await getNames();
};

onBeforeRouteUpdate(async (to, from) => {
  const num = Number(to.params?.id) || 1;
  street.value = stats.value?.[num > 500 ? num - stats.value[0].rank : num - 1]?.name;
  console.log('top route update', to.params, num, street.value);
});

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
