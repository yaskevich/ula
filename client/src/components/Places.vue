<template>
    Places
    <div v-if="isLoaded">
        <n-tree block-line :cascade="true" :data="topList" :on-load="handleLoad" />

        <div v-for="item in placesList">
            {{ item.label }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import store from '../store';
import type { TreeDropInfo, TreeOption } from 'naive-ui';

const selected = ref(null);
const topList = ref();
const isLoaded = ref(false);
const placesList = ref();

const handleLoad = async (node: TreeOption) => {
    console.log('!', node);
    let params = {};
    const type = (node.NAZWA_DOD as string).split(' ').shift();
    switch (type) {
        case "województwo":
            params = {
                woj: node.WOJ,
                gmi: ''
            };
            break;
        case 'powiat':
            params = {
                woj: node.WOJ,
                pow: node.POW,
            }
            break;
        case 'gmina':
            params = {
                woj: node.WOJ,
                pow: node.POW,
                gmi: node.GMI
            }
            break;
        default:
            console.log("ISSUE", node.NAZWA_DOD);
    }

    const data = await store.api('places', params);
    console.log(type, params, data);

    node.children = data.map((x: any) => ({ ...x, label: `${x.NAZWA} (${x.NAZWA_DOD})`, isLeaf: false }));
    if (type === 'powiat') {
        node.children = node.children?.filter(x => x.GMI);
    } else if (type === 'województwo') {
        node.children = node.children?.filter(x => x.POW);
    }
};

const getPlaces = async () => {
    const params = {
    };
    const response = await fetch('/api/places?' + new URLSearchParams(params).toString());
    if (response.status === 200) {
        const data = await response.json();
        console.log(data);
    } else {
        console.log("fetching error");
    }
};

onBeforeMount(async () => {
    const params = {
        // woj: '',
        pow: '',
        gmi: ''
    };

    const data = await store.api('places', params);
    topList.value = data.map((x: any) => ({ ...x, label: x.NAZWA, isLeaf: false }));
    console.log(data);
    isLoaded.value = true;

});

</script>
