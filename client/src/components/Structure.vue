<template>
    <h3>Structure of street names</h3>
    <n-data-table :columns="columns" :data="stats" />
</template>


<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui'

const stats = ref();

const columns: DataTableColumns = [
    {
        title: 'Words number',
        key: 'words'
    },
    {
        title: 'Quantity',
        key: 'qty'
    },];

const getWords = async () => {
    const response = await fetch('/api/words');
    if (response.status === 200) {
        const data = await response.json();
        stats.value = data;
    }
};

onBeforeMount(async () => await getWords());

</script>
