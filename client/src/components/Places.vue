<template>
    Places
    <div v-if="isLoaded">
        <n-tree :node-props="nodeProps" block-line :cascade="true" :data="topList" :on-load="handleLoad" />

        <div v-for="item in placesList">
            {{ item.label }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import store from '../store';
import type { TreeDropInfo, TreeOption } from 'naive-ui';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';

const router = useRouter();
const route = useRoute();

const topList = ref();
const isLoaded = ref(false);
const placesList = ref();

const nodeProps = ({ option }: { option: TreeOption }) => {
    return {
        onClick() {
            console.info(`[Click] ${option.label}`);
            console.log(option);
            router.push(`/place/${option?.SYM || option.key}`);
        },
        onContextmenu(e: MouseEvent): void {
            // optionsRef.value = [option]
            // showDropdownRef.value = true
            // xRef.value = e.clientX
            // yRef.value = e.clientY
            console.log(e.clientX, e.clientY)
            e.preventDefault()
        }
    }
};

const scheme = {
    "00": "część miejscowości",
    "01": "wieś",
    "02": "kolonia",
    "03": "przysiółek",
    "04": "osada",
    "05": "osada leśna",
    "06": "osiedle",
    "07": "schronisko turystyczne",
    "95": "dzielnica m. st. Warszawy",
    "96": "miasto",
    "98": "delegatura",
    "99": "część miasta",
} as keyable;

const handleLoad = async (node: TreeOption) => {
    // console.log('!', node);
    let params = {} as keyable;
    const dod = node.NAZWA_DOD as string;
    const type = dod.includes('powiat') ? 'powiat' : dod.split(' ').shift();
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
        // case 'gmina':
        // break;
        default:
            params = {
                woj: node.WOJ,
                pow: node.POW,
                gmi: node.GMI
            }
            console.log("=", node.NAZWA_DOD);
    }

    const data = await store.api('places', params);

    if (params?.gmi) {
        console.log('SIMC', params);
        node.children = data.map((x: any) => ({ ...x, label: `${x.NAZWA} ⸱ ${scheme?.[x.RM] || '😈'}`, isLeaf: true }));
    } else {
        console.log('TERC', type, params, data);
        node.children = data.map((x: any) => ({ ...x, label: `${x.NAZWA} ${x.NAZWA_DOD === 'powiat' ? '' : '⸱ '}${x.NAZWA_DOD}`, isLeaf: false }));
        if (type === 'powiat') {
            node.children = node.children?.filter(x => x.GMI);
        } else if (type === 'województwo') {
            node.children = node.children?.filter(x => x.POW);
        }
    }
};

onBeforeMount(async () => {
    const data = await store.api('places', { pow: '', gmi: '' });
    topList.value = data.map((x: any) => ({ ...x, label: x.NAZWA, isLeaf: false }));
    // console.log(data);
    isLoaded.value = true;
});

</script>
