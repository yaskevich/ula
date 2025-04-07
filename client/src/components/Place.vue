<template>
    <!-- {{ datum }} -->
    <div id="graph"></div>

    <div v-if="isLoaded">
        <h3>{{ datum?.NAZWA }}</h3>
        <n-space vertical>
            <n-space v-for="item in streets">
                <n-tag :type="item.CECHA === 'ul.' ? 'info' : 'default'">
                    <div style="min-width:3rem;">{{ renderType(item.CECHA) }}</div>
                </n-tag>
                <n-tag type="success">{{ item.NAZWA_1 }}</n-tag>
                <n-tag v-if="item?.NAZWA_2" type="warning">{{ item.NAZWA_2 }}</n-tag>
                <!-- {{ item }} -->
            </n-space>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import store from '../store';


const router = useRouter();
const route = useRoute();
const isLoaded = ref(false);
const datum = ref();
const id = route.params?.id;
const streets = ref([] as Array<IStreet>);

const codes = { 'ul.': 'ulica', 'al.': 'aleja', 'pl.': 'plac' } as keyable;
const renderType = (code: string) => codes?.[code] || code;

const summary = ref({});

onBeforeMount(async () => {
    const data = await store.api('places', { sym: id });
    datum.value = data?.shift();
    streets.value = (await store.api('streets', { sym: id })).sort((a: IStreet, b: IStreet) => a.NAZWA_1.localeCompare(b.NAZWA_1)).sort((a: IStreet, b: IStreet) => a.CECHA.localeCompare(b.CECHA));
    summary.value = Object.entries(streets.value.reduce((acc: any, { CECHA }) => ({ ...acc, [CECHA]: (acc[CECHA] || 0) + 1 }), {})).map(x => ({ title: x[0], qty: x[1] })).sort((a:any, b:any) => b.qty - a.qty);
    isLoaded.value = true;
    store.renderBar(summary.value as [], 'title', 'qty', true);
});

</script>

<style scoped>
:deep(.bar) {
    fill: steelblue;
}
</style>
