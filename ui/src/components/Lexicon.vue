<template>
    <div class="p-4">
        <ToggleSwitch v-model="editMode" />
    </div>
    <div class="card flex justify-center">
        <Draggable v-if="editMode" v-model="nodeRefs" ref="tree" textKey="label" :defaultOpen="false" class="ml-4">
            <template #default="{ node, stat }">
                <span v-if="stat.children.length" @click="stat.open = !stat.open">
                    {{ stat.open ? "-" : "+" }}
                </span>
                <span :class="node.icon"></span>
                <span class="fa-light fa-chevron-down"></span>
                {{ node.label }}
            </template>
        </Draggable>
        <Tree v-else :value="nodeRefs" class="w-full md:w-[30rem]" selectionMode="single"></Tree>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { BaseTree, Draggable } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
const nodeRefs = ref();
const icons = ['crown', 'clipboard', 'warehouse', 'trophy', 'bullseye', 'briefcase', 'bell', 'envelope', 'palette', 'sun', 'car', 'building', 'gauge', 'thumbtack', 'barcode', 'face-smile'];

const editMode = ref(false);

onBeforeMount(async () => {
    // NodeService.getTreeNodes().then((data) => (nodes.value = data));
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const data = await response.json();
        // console.log(data);
        const datum = Object.entries(data).map((x, z) => ({
            key: x[0] || 'unsorted',
            label: x[0] || 'unsorted',
            // data: 'Documents Folder',
            icon: 'pi pi-fw pi-' + (icons.shift() || 'bookmark-fill'),
            children: x[1].map(y => ({
                key: y.stem || 'unnamed',
                label: y.stem || 'unnamed',
                // data: 'Documents Folder',
                icon: 'pi pi-fw pi-bookmark',
            }))
        }));
        nodeRefs.value = datum;
        // console.log(datum);
    } else {
        console.log("fetching error");
    }
});
</script>

<style>
.p-tree-node-label {
    text-transform: capitalize;
}
</style>
