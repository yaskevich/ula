<template>
    Places
    <div v-if="isLoaded">
        <n-select v-model:value="selected" :options="topList" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

const selected = ref(null);
const topList = ref();
const isLoaded = ref(false);
const placesList = ref();

const getPlaces = async() => {
    const params = {

    };
    const response = await fetch('/api/places?' + new URLSearchParams(params).toString());
    if (response.status === 200) {
        const data = await response.json();
        console.log(data);
    } else {
        console.log("fetching error");
    }

};

onBeforeMount(async () => {
    const params = {
        // woj: '',
        pow: '',
        gmi: ''
    };
    const response = await fetch('/api/places?' + new URLSearchParams(params).toString());
    if (response.status === 200) {
        const data = await response.json();
        topList.value = data.map((x: any) => ({ label: x.NAZWA, value: x.WOJ }));
        console.log(data);
        isLoaded.value = true;
    } else {
        console.log("fetching error");
    }
});

</script>
