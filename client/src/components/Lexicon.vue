<template>
    <div class="p-4">
        <n-switch v-model:value="editMode" />
    </div>

    <div class="card flex justify-center">
        <n-tree key-field="id" label-field="title" :render-prefix="renderPrefix" :data="nodeRefs" :draggable="editMode"
            @drop="handleDrop"></n-tree>
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

const renderPrefix = ({ option }: { option: TreeOption }) => {
    return h(NButton, { text: true, type: 'primary', onClick: () => { showModal.value = true; } }, { default: () => option.emoji });
}

const handleDrop = ({ node, dragNode, dropPosition }: TreeDropInfo) => {
    console.log(node, dragNode);
};

onBeforeMount(async () => {
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        nodeRefs.value = await response.json();
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
