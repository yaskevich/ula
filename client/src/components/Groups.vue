<template>
    <div v-if="isLoaded">
        <n-space>
            <D3Map />
            <div>
                <h3>Groups</h3>
                <n-cascader v-model:value="group" :options="nodes" :filterable="true" label-field="title"
                    value-field="id" check-strategy="all" :cascade="true" :clearable="true" @update:value="update"
                    style="max-width: 300px;" />
            </div>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import store from '../store';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';

const router = useRouter();
const vuerouter = useRoute();
const isLoaded = ref(false);
const nodes = ref();
const group = ref();

const update = (value: any, option: any) => {
    console.log(option);
    router.push(`/groups/${value}`);
};

onBeforeMount(async () => {
    const data = await store.api('ontology');
    nodes.value = store.toTree(data);
    isLoaded.value = true;
    let id = vuerouter?.params?.id;
    if (!id) {
        id = nodes.value[Math.floor(Math.random() * nodes.value.length)]?.id;
        router.push(`groups/${id}`);
    }
    group.value = Number(id);
});

</script>
