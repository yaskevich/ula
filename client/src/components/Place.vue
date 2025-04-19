<template>
    <h3 class="place">{{ datum?.NAZWA }} {{ info?.NAZWA }} {{ info?.NAZWA_DOD }} </h3>
    <div id="graph"></div>
    <div v-if="isLoaded">
        <n-space vertical>
            <n-space v-for="item in streets">
                <n-tag :type="item.CECHA === 'ul.' ? 'info' : 'default'">
                    <div style="min-width:3rem;">{{ renderType(item.CECHA) }}</div>
                </n-tag>
                <n-tag type="success">{{ item.NAZWA_1 }}</n-tag>
                <n-tag v-if="item?.NAZWA_2" type="warning">{{ item.NAZWA_2 }}</n-tag>
                <n-tag v-if="catsMap?.[catsDict?.[item?.NAZWA_1]?.parent]" type="error"> {{
                    catsMap?.[catsDict?.[item?.NAZWA_1]?.parent]?.emoji }} {{
                        catsMap?.[catsDict?.[item?.NAZWA_1]?.parent]?.title }}
                </n-tag>
                <n-tag v-if="item?.qty && item.qty > 1"
                    :color="{ color: 'lightyellow', textColor: 'darkred', borderColor: 'silver' }">{{ item.qty
                    }}</n-tag>
            </n-space>
        </n-space>
    </div>
    <div v-else>
        ...loading...
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import store from '../store';

// const router = useRouter();
const route = useRoute();
const isLoaded = ref(false);
const datum = ref();
const id = route.params?.id;
const streets = ref([] as Array<IStreet>);
const codes = { 'ul.': 'ulica', 'al.': 'aleja', 'pl.': 'plac' } as keyable;
const renderType = (code: string) => codes?.[code] || code;
const summary = ref({});
const catsMap = ref();
const catsDict = ref();
const info = ref();

onBeforeMount(async () => {
    info.value = await store.api('unit', { sym: id });
    const data = await store.api('places', { sym: id });
    datum.value = data?.shift();
    const list = (await store.api('streets', { sym: id })).sort((a: IStreet, b: IStreet) => a.NAZWA_1.localeCompare(b.NAZWA_1)).sort((a: IStreet, b: IStreet) => a.CECHA.localeCompare(b.CECHA));
    if (id?.length < 6) {
        const uniq = {} as keyable;
        for (const item of list) {
            uniq[item?.NAZWA_1] ? uniq[item.NAZWA_1].qty += 1 : uniq[item.NAZWA_1] = { ...item, qty: 1 };
        }
        streets.value = Object.values(uniq);
    } else {
        streets.value = list;
    }


    summary.value = Object.entries(streets.value.reduce((acc: any, { CECHA }) => ({ ...acc, [CECHA]: (acc[CECHA] || 0) + 1 }), {})).map(x => ({ title: x[0], qty: x[1] })).sort((a: any, b: any) => b.qty - a.qty);
    isLoaded.value = true;
    store.renderBar(summary.value as [], 'title', 'qty', true);

    const ontology = await store.api('ontology', {});
    const cats = {} as keyable;
    // console.log(ontology);
    const dict = {} as keyable;

    for (const item of ontology) {
        // console.log(item.names);
        cats[item.id] = item;
        if (item?.names) {
            for (const name of JSON.parse(item.names)) {
                // console.log(name, item.title, item.emoji);
                dict[name] = item;
            }
        }
    }

    catsDict.value = dict;
    catsMap.value = cats;

});

</script>

<style scoped>
:deep(.bar) {
    fill: steelblue;
}

.place {
    text-transform: lowercase;
}

.place::first-letter {
    text-transform: capitalize
}
</style>
