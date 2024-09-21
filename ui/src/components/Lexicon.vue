<template>
    <div class="p-4">
        <n-switch v-model:value="editMode" />
    </div>
    <div class="card flex justify-center">
        <n-tree :data="nodeRefs" :draggable="editMode" @drop="handleDrop"></n-tree>
    </div>
    <n-modal :show="showModal">
        <div>
            <n-button @click="showModal = false">Close</n-button>
            <EmojiPicker :native="true" @select="onSelectEmoji" disable-skin-tones />
        </div>
    </n-modal>

</template>

<script setup lang="ts">
import { ref, onBeforeMount, h } from 'vue';
import { NButton } from 'naive-ui';
import type { TreeDropInfo, TreeOption } from 'naive-ui';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

const editMode = ref(false);
const showModal = ref(false);
const nodeRefs = ref();

const onSelectEmoji = (emoji: any) => {
    console.log(emoji.i);
};

const handleDrop = ({ node, dragNode, dropPosition }: TreeDropInfo) => {
    console.log(node, dragNode);
}

onBeforeMount(async () => {
    // NodeService.getTreeNodes().then((data) => (nodes.value = data));
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const data = await response.json();
        const datum = Object.entries(data).map((x: any) => ({
            key: x[0] || 'unsorted',
            label: x[0] || 'unsorted',
            // data: 'Documents Folder',
            prefix: () =>
                h(NButton, { text: true, type: 'primary', onClick: () => { showModal.value = true; } }, { default: () => x[1].emoji }),
            children: Object.entries(x[1].children).map(y => ({
                key: y[0] || 'unnamed',
                label: y[0] ? `${y[0]}` : 'unnamed',
                // data: 'Documents Folder',
                prefix: () =>
                    h(NButton, { text: true, type: 'primary', onClick: () => { showModal.value = true; } }, { default: () => y[1] }),
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
