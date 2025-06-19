<template>
  <!-- <h2>Analysis of the street names of Poland</h2> -->
  <n-space>
    <D3Map :street="street" />
    <div>
      <n-select v-model:value="batchValue" :options="options" :consistent-menu-width="false" />
      <n-space>

        <n-button @click="loadUp" :disabled="id < batchValue">
          <template #icon>
            <n-icon :component="ArrowUp" />
          </template>
        </n-button>
      </n-space>
      <div v-for="(val, index) in stats">
        <n-button text :type="(val.rank === id) ? 'info' : 'default'" @click="showName(val.rank, val.name)">{{
          val.rank }}. {{ val.name }}</n-button>
      </div>
      <n-space>
        <n-button @click="loadDown">
          <template #icon>
            <n-icon :component="ArrowDown" />
          </template>
        </n-button>
        <!-- <n-select v-model:value="downValue" :options="options" :consistent-menu-width="false" /> -->
      </n-space>
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
const id = ref(Number(toRaw(route?.params?.id)) || 0);
const options = [25, 50, 100, 1000].map((x: number) => ({ value: x, label: x }));
const batchValue = ref(options[0].value);
const downValue = ref(options[0].value);

const showName = (index: number, name: string) => {
  router.push(`/country/${index}`);
  id.value = index;
  street.value = name;
};

const getNames = async (addon: number, offset: number) => {
  const data = await store.api('names/' + id.value + '/' + offset);
  if (id.value === -1) {
    id.value = 0;
  }
  stats.value = data;
  street.value = data.find((x: any) => x.rank === (id.value + addon))?.name;
};

const loadUp = async () => {
  id.value -= batchValue.value;
  if (id.value - batchValue.value < 1) {
    id.value = 1;
  } else {
    id.value -= batchValue.value;
  }
  router.push(`/country/${id.value}`);
};

const loadDown = async () => {
  id.value += batchValue.value;
  router.push(`/country/${id.value}`);
};

onBeforeRouteUpdate(async (to, from) => {
  const num = Number(to.params?.id) || 1;
  id.value = num;
  await getNames(1, batchValue.value);
  street.value = stats.value?.[num - stats.value[0].rank]?.name;
  console.log('top route update', to.params, num, street.value);
});

onBeforeMount(async () => await getNames(0, downValue.value));

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
