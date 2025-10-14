<template>
    Groups
    <div v-if="isLoaded">
        <n-cascader v-model:value="value" :options="nodes" :filterable="true" label-field="title" value-field="id"
            check-strategy="child" />
        {{ nodes }}
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import store from '../store';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';

const router = useRouter();
const isLoaded = ref(false);
const nodes = ref();
const value = ref();

onBeforeMount(async () => {
    const data = await store.api('ontology');
    nodes.value = store.toTree(data);
    isLoaded.value = true;
});

</script>
