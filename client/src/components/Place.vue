<template>
    <h3 class="place">{{ datum?.NAZWA }} {{ info?.NAZWA }} {{ info?.NAZWA_DOD }} </h3>
    <n-space vertical>
        <div id="graph"></div>
        <div id="pop"></div>
        <div v-if="isLoaded">
            <n-descriptions label-placement="left" bordered :column="1">
                <n-descriptions-item label="Extended">
                    <span style="font-weight: bolder;color:red;">{{ Math.round(extended / (streetNum || 1) * 1000) / 10
                    }}% </span><em>{{ extended }}⬝{{ streets.length }} </em>
                </n-descriptions-item>
                <n-descriptions-item label="Min Letters">
                    {{ tops.ltchars.NAZWA_1 }} ({{ tops.ltchars.CECHA }})
                </n-descriptions-item>
                <n-descriptions-item label="Max Letters">
                    {{ tops.gtchars.NAZWA_1 }} ({{ tops.gtchars.CECHA }})
                </n-descriptions-item>
                <n-descriptions-item label="Max Letters Streets">
                    {{ tops.gtchars2.NAZWA_1 }} ({{ tops.gtchars2.CECHA }})
                </n-descriptions-item>

                <n-descriptions-item label="Max Words">
                    {{ tops.gtwords.NAZWA_1 }} ({{ tops.gtwords.CECHA }})
                </n-descriptions-item>
            </n-descriptions>

            <n-space vertical>
                <n-radio-group v-model:value="showMode" name="radiogroup">
                    <n-radio :key="1" :value="1" label="Default" />
                    <n-radio :key="2" :value="2" label="Hide unique" />
                </n-radio-group>

                <n-radio-group v-model:value="sortMode" name="radiogroup" @update:value="resort">
                    <n-radio :key="1" :value="1" label="Alphabetically" />
                    <n-radio :key="2" :value="2" label="By quantity" />
                    <n-radio :key="3" :value="3" label="By popularity" />
                </n-radio-group>

                <template v-for="item in streets">
                    <n-space v-if="showMode === 1 || (item?.qty && item?.qty > 1)">
                        <n-tag :type="item.CECHA === 'ul.' ? 'info' : 'default'">
                            <div style="min-width:3rem;">{{ renderType(item.CECHA) }}</div>
                        </n-tag>
                        <n-tag type="success" @click="goTo(item)">{{ item.NAZWA_1 }}</n-tag>
                        <n-tag v-if="item?.NAZWA_2" type="warning">{{ item.NAZWA_2 }}</n-tag>
                        <n-tag v-if="catsMap?.[catsDict?.[item?.NAZWA_1]?.parent]" type="error"> {{
                            catsMap?.[catsDict?.[item?.NAZWA_1]?.parent]?.emoji }} {{
                                catsMap?.[catsDict?.[item?.NAZWA_1]?.parent]?.title }}
                        </n-tag>
                        <n-tag v-if="item?.qty && item.qty > 1"
                            :color="{ color: 'lightyellow', textColor: 'darkred', borderColor: 'silver' }">{{ item.qty
                            }}</n-tag>
                        <n-tag :title="`Rank: ${item.rank} Ttl: [${item.ttl}]`"
                            :color="{ color: 'transparent', textColor: colors[(item?.ord)] }" :bordered="false">{{
                                "■".repeat(item?.ord) }}</n-tag>
                    </n-space>
                </template>
            </n-space>
        </div>
        <div v-else>
            ...loading...
        </div>
    </n-space>
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
const catsMap = ref();
const catsDict = ref();
const info = ref();
const showMode = ref(1);
const sortMode = ref(1);
const tops = {} as keyable;
const colors = { '1': 'darkred', '2': 'red', '3': 'orange', '4': 'gold', '5': 'gray', '6': 'silver' } as keyable;
const ranks = ref({});
const extended = ref(0);
const streetNum = ref(0);
const namesStats = ref({});

const resort = (val: any) => {
    if (val === 3) {
        console.log('ord');
        streets.value = streets.value.sort((a: IStreet, b: IStreet) => (a?.ord || 0) - (b?.ord || 0));
    } else if (val === 2) {
        console.log('qty');
        streets.value = streets.value.sort((a: IStreet, b: IStreet) => (b?.qty || 0) - (a?.qty || 0));
    } else {
        streets.value = streets.value.sort((a: IStreet, b: IStreet) => a.NAZWA_1.localeCompare(b.NAZWA_1)).sort((a: IStreet, b: IStreet) => a.CECHA.localeCompare(b.CECHA));
    }
};

const goTo = async (item: IStreet) => {
    const info = await store.api('name', { name: item.NAZWA_1 });
    router.push(`/country/${info.rank}`);
};

onBeforeMount(async () => {
    info.value = await store.api('unit', { sym: id });
    const data = await store.api('places', { sym: id });
    datum.value = data?.shift();
    const list = (await store.api('streets', { sym: id })).sort((a: IStreet, b: IStreet) => a.NAZWA_1.localeCompare(b.NAZWA_1)).sort((a: IStreet, b: IStreet) => a.CECHA.localeCompare(b.CECHA));
    if (id?.length < 6) {
        const uniq = {} as keyable;
        for (const item of list) {
            const key = item.CECHA + item?.NAZWA_1 + item?.NAZWA_2;
            uniq[key] ? uniq[key].qty += 1 : uniq[key] = { ...item, qty: 1 };
        }
        streets.value = Object.values(uniq);
    } else {
        streets.value = list;
    }


    const names = {} as keyable;
    list.forEach((x: IStreet) => {
        if (x.CECHA === 'ul.') {
            streetNum.value += 1;
            if (x?.NAZWA_2) {
                extended.value += 1
                const key = x.NAZWA_2;
                names[key] ? names[key] += 1 : names[key] = 1;
            }
        }
    });

    namesStats.value = names;

    Object.entries(namesStats.value).filter((x: any) => x[1] > 10).map(x => console.log(x));

    const counter = {} as keyable;
    list.forEach((x: IStreet) => {
        const key = String(x.ord);
        counter[key] ? counter[key] += 1 : counter[key] = 1;
    });
    ranks.value = counter;


    const getName = (item: IStreet) => (item.CECHA === 'ul.' ? 'ulica ' : '') + item.NAZWA_1;

    const longestStreets = list.filter((x: IStreet) => x.CECHA === 'ul.').sort(function (a: IStreet, b: IStreet) {
        return getName(b).length - getName(a).length;
    });
    tops.gtchars2 = longestStreets[0];

    const lng = list.sort(function (a: IStreet, b: IStreet) {
        return getName(b).length - getName(a).length;
    });

    tops.gtwords = list.reduce(function (a: IStreet, b: IStreet) {
        return getName(a).split(' ').length > getName(b).split(' ').length ? a : b;
    });

    tops.ltchars = lng.pop();
    tops.gtchars = lng.shift();

    summary.value = Object.entries(streets.value.reduce((acc: any, { CECHA }) => ({ ...acc, [CECHA]: (acc[CECHA] || 0) + 1 }), {})).map(x => ({ title: x[0], qty: x[1] })).sort((a: any, b: any) => b.qty - a.qty);
    isLoaded.value = true;

    const pop = Object.entries(ranks.value).map(x => ({ key: x[0], title: 'R' + x[0], qty: x[1] }));
    store.renderBar('graph', summary.value as [], 'title', 'qty', true);
    store.renderBar('pop', pop as [], 'title', 'qty', true, colors);

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
.place {
    text-transform: lowercase;
}

.place::first-letter {
    text-transform: capitalize
}
</style>
