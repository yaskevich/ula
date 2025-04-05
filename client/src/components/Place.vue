<template>
    <!-- {{ datum }} -->
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
const streets = ref();

const codes = { 'ul.': 'ulica', 'al.': 'aleja' } as keyable;
const renderType = (code: string) => codes?.[code] || code;

onBeforeMount(async () => {
    const data = await store.api('places', { sym: id });
    datum.value = data?.shift();
    streets.value = (await store.api('streets', { sym: id })).sort((a: any, b: any) => a.NAZWA_1.localeCompare(b.NAZWA_1)).sort((a: any, b: any) => a.CECHA.localeCompare(b.CECHA));;
    isLoaded.value = true;
});

</script>
