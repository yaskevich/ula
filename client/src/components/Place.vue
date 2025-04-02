<template>
    <!-- {{ datum }} -->
    <h3>{{ datum.NAZWA }}</h3>
    <n-space v-for="item in streets">
        <n-tag>{{ item.CECHA }}</n-tag>
        <n-tag type="success">{{ item.NAZWA_1 }}</n-tag>
        <n-tag v-if="item?.NAZWA_2" type="warning">{{ item.NAZWA_2 }}</n-tag>
        <!-- {{ item }} -->
    </n-space>
</template>

<script setup lang="ts">
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import store from '../store';

const router = useRouter();
const route = useRoute();
const isLoaded = ref(false);
const datum = ref();
const id = route.params?.id;
const streets = ref();

onBeforeMount(async () => {
    const data = await store.api('places', { sym: id });
    datum.value = data?.shift();
    streets.value = await store.api('streets', { sym: id });
    isLoaded.value = true;
});

</script>
