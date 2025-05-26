<template>
    <h3>Structure of street names</h3>
    <div id="graph"></div>
    <n-data-table :columns="columns" :data="stats" :row-props="rowProps" :row-class-name="rowClassName"
        style="font-weight:bold;" />
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import store from '../store';

const stats = ref<Array<IWord>>();

const rowClassName = (row: IWord) => {
    if (row.qty > 10000) {
        return 'good'
    } else if (row.qty > 1000) {
        return 'pass'
    } else if (row.qty > 100) {
        return 'bad';
    }
    return 'hell';
};

const rowProps = (row: IWord) => {
    return {
        style: 'cursor: pointer;',
        onClick: () => {
            console.info(row.words, row.qty)
        }
    }
};

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

onMounted(async () => {
    await getWords();
    if (stats.value?.length) {
        const data = stats.value.filter(x => x.words > 6).reverse();
        store.renderBar('graph', data as [], 'words', 'qty');
    }
});
</script>
<style scoped>
:deep(.bar) {
    /* fill: steelblue; */
    fill: #cc3232;
}

:deep(.good td) {
    background-color: #99c140 !important;
}

:deep(.pass td) {
    background-color: #e7b416 !important;
}

:deep(.bad td) {
    background-color: #db7b2b !important;
}

:deep(.hell td) {
    background-color: #cc3232 !important;
}
</style>