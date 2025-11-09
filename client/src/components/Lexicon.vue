<template>
    <n-space>
        <n-switch v-model:value="editMode" /> <n-button @click="openModal(undefined)">Add</n-button>
        <div style="max-width:100px">
            <n-input-number v-model:value="top" clearable :show-button="false" :min="0" :step="100" :max="1000"
                @update:value="getData" />
        </div>
    </n-space>

    <div class="card flex justify-center">
        <n-tree key-field="id" label-field="title" :render-prefix="renderPrefix" :render-suffix="renderSuffix"
            :data="nodeRefs" :draggable="editMode" block-line :override-default-node-click-behavior="override"
            @drop="handleDrop"></n-tree>
    </div>
    <n-modal :show="showModal">
        <div style="background-color: white; padding: .5rem; border-radius: 3px;">
            <n-space vertical>
                <n-space justify="space-between">
                    <n-button @click="save" type="success">Save</n-button>
                    <n-button @click="showModal = false" type="info">Close</n-button>
                </n-space>
                <n-input v-model:value="selected!.title"></n-input>
                <!-- {{ selected }} -->
                <EmojiPicker :native="true" @select="onSelectEmoji" disable-skin-tones />
            </n-space>
        </div>
    </n-modal>

</template>

<script setup lang="ts">
import { ref, onBeforeMount, h } from 'vue';
import { NButton, NTag } from 'naive-ui';
import type { TreeDropInfo, TreeOption } from 'naive-ui';
import type { TreeOverrideNodeClickBehavior } from 'naive-ui';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';
import store from '../store';

const editMode = ref(true);
const showModal = ref(false);
const nodesList = ref();
const nodeRefs = ref();
const selected = ref<TreeOption>();
const top = ref(0);

const save = async () => {
    showModal.value = false;
    if (selected.value) {
        const result = await store.save('topic', selected.value);
        console.log(result);
    }
};

const onSelectEmoji = async (emoji: any) => {
    if (selected.value) {
        selected.value.emoji = emoji.i;
        console.log(selected.value);
        console.log(emoji.i);
    }
};

const openModal = (option: TreeOption | undefined) => {
    showModal.value = true;
    if (option) {
        selected.value = option;
    } else {
        selected.value = { title: '', emoji: '', leaf: 0 }
    }
};

const renderPrefix = ({ option }: { option: TreeOption }) => {
    return h(NButton, { text: true, type: 'primary', onClick: () => { openModal(option) } }, { default: () => option.emoji });
};

const renderSuffix = ({ option }: { option: any /* TreeOption */ }) => {
    return h(NTag, { bordered: false }, { default: () => (option?.emoji + (option?.children?.length || 0)) });
};

const handleDrop = async ({ node, dragNode, dropPosition, event }: TreeDropInfo) => {
    console.log(node, dragNode, dropPosition, event);
    // console.log(node.leaf, dragNode.leaf);
    if (!node?.leaf && dragNode?.leaf) {
        const arr = nodeRefs.value.find((x: any) => x.id === dragNode.parent).children;
        const index = arr.findIndex((x: any) => x.id === dragNode.id);
        arr.splice(index, 1);
        const newNode = dragNode;
        newNode.parent = node.id;
        node.children?.push(newNode);
        console.log("update", node.id, dragNode.id);
        const response = await fetch('/api/topic', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json', // this needs to be defined
            },
            body: JSON.stringify(newNode),
        });
        if (response.status === 200) {
            const data = await response.json();
            console.log("move", data);
        }
    } else {
        console.log("reject");
    }
};

const override: TreeOverrideNodeClickBehavior = ({ option }) => {
    if (option.children) {
        return 'toggleExpand'
    }
    return 'default'
};

const getData = async () => {
    // console.log(top.value);
    const data = await store.api('ontology', { limit: top.value });
    if (data?.length) {
        nodesList.value = data;
        nodeRefs.value = store.toTree(data).sort((a: any, b: any) => (b?.children?.length || 0) - (a?.children?.length || 0)); // b - a for reverse sort;
    } else {
        console.log("fetching error");
    }
};

onBeforeMount(async () => await getData());
</script>

<style>
.p-tree-node-label {
    text-transform: capitalize;
}
</style>
