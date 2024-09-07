<template>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
     <div v-if="isLoaded">
    <div v-for="(val, index) in store.freq.streets.slice(0, limit)">
        <Button :text="route.fullPath !== `/country/${index + 1}`" @click="router.push(`/country/${index + 1}`)">{{
        index + 1
    }}. {{ val.name }}</Button>
        <InputText v-if="showEditor === index" type="text" v-model="value" size="small" />
        <span v-else>
            <Chip v-if="val.name in dict" :label="dict[val.name]" />
            <Button text icon="pi pi-pencil" @click="showEditor = index"></Button>
        </span>
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
import { ref, onBeforeMount } from 'vue';
import store from '../store';
import { useRouter, useRoute } from 'vue-router';

const dict = ref();
const showEditor = ref();
const router = useRouter();
const route = useRoute();
const limit = Number(route.params.limit) || 500;
console.log(route.params.limit);

const value = ref('');

const isLoaded = ref(false);

onBeforeMount(async () => {
    const response = await fetch('/api/dict');
    if (response.status === 200) {
        const data = await response.json();
        // console.log(data);
        dict.value = data;
        isLoaded.value = true;
    } else {
        console.log("fetching error");
    }
});

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