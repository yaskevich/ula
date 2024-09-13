<template>
    <div class="p-4">
        <n-switch v-model:value="editMode" />
    </div>
    <div class="card flex justify-center">
        <n-tree :data="nodeRefs" :draggable="editMode"></n-tree>
    </div>
    <n-modal :show="showModal">
        <div>
            <n-button @click="showModal = false">Close</n-button>
            <EmojiPicker :native="true" @select="onSelectEmoji" disable-skin-tones />
        </div>
    </n-modal>

</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { NButton } from 'naive-ui';
const nodeRefs = ref();
// const icons = ['crown', 'clipboard', 'warehouse', 'trophy', 'bullseye', 'briefcase', 'bell', 'envelope', 'palette', 'sun', 'car', 'building', 'gauge', 'thumbtack', 'barcode', 'face-smile'];
// import picker compopnent
import EmojiPicker from 'vue3-emoji-picker';
// import css
import 'vue3-emoji-picker/css';

const emojis = ['🏪', '😜', ' 🌒', '⛵️', '🔮', '🎉', '🌟', '🐫', '🖐', '🐗', '🚍', '📚', '😋', '4️⃣', '🌘']

const editMode = ref(false);
const showModal = ref(false);

const onSelectEmoji = (emoji) => {
    console.log(emoji.i);
};

onBeforeMount(async () => {
    // NodeService.getTreeNodes().then((data) => (nodes.value = data));
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const data = await response.json();
        // console.log(data);
        const datum = Object.entries(data).map((x) => ({
            key: x[0] || 'unsorted',
            label: x[0] || 'unsorted',
            // data: 'Documents Folder',
            // icon: 'pi pi-fw pi-' + (icons.shift() || 'bookmark-fill'),
            prefix: () =>
                h(NButton, { text: true, type: 'primary', onClick: () => { showModal.value = true; } }, { default: () => (emojis.shift() || '🤪') }),
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
