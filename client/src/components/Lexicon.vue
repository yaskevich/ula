<template>
    <div class="p-4">
        <n-switch v-model:value="editMode" />
    </div>

    <div class="card flex justify-center">
        <n-tree key-field="id" label-field="title" :render-prefix="renderPrefix" :data="nodeRefs" :draggable="editMode"
            block-line :override-default-node-click-behavior="override" @drop="handleDrop"></n-tree>
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
import type { TreeOverrideNodeClickBehavior } from 'naive-ui';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

const editMode = ref(true);
const showModal = ref(false);
const nodesList = ref();
const nodeRefs = ref();

const selected = ref<TreeOption>();

const onSelectEmoji = async (emoji: any) => {
    if (selected.value) {
        selected.value.emoji = emoji.i;
        console.log(selected.value);
        console.log(emoji.i);
        const response = await fetch('/api/topic', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json', // this needs to be defined
            },
            body: JSON.stringify(selected.value),
        });
        if (response.status === 200) {
            const data = await response.json();
            console.log("move", data);
        }
    }
};

const openModal = (option: TreeOption) => {
    showModal.value = true;
    selected.value = option;
};

const renderPrefix = ({ option }: { option: TreeOption }) => {
    return h(NButton, { text: true, type: 'primary', onClick: () => { openModal(option) } }, { default: () => option.emoji });
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

const toTree = (arr: any) => {
    const obj = Object.create(null);
    arr.forEach((x: any) => obj[x.id] = { ...x, });
    const res: any = [];
    arr.forEach((x: any) => {
        x.parent ? (obj[x.parent]?.children ? obj[x.parent].children.push(obj[x.id]) : obj[x.parent].children = [obj[x.id]]) : res.push(obj[x.id])
    });
    return res;
};


onBeforeMount(async () => {
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const data = await response.json();
        nodesList.value = data;
        nodeRefs.value = toTree(data);
        // console.log(nodeRefs.value);
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
