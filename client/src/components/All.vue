<template>
    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="Enter the stem" :bordered="false" size="huge" role="dialog"
            aria-modal="true">
            <template #header-extra>
                <!-- Oops! -->
            </template>
            <n-input-group>
                <n-input @keyup.enter="saveStem" v-model:value="stem.title" type="text" placeholder="stem" />
                <n-button @click="saveStem">
                    Save
                </n-button>
            </n-input-group>
            <!-- <n-select v-model:value="multipleSelectValue" filterable tag :options="options" /> -->
            <template #footer>
                <!-- Footer -->
            </template>
        </n-card>
    </n-modal>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
    <div v-if="isLoaded">
        <n-space vertical>
            <n-switch v-model:value="editMode" />
            <n-pagination v-model:page="page" :page-count="Math.ceil(count / limit)" @update:page="paginate" />
        </n-space>
        <n-space vertical v-for="(val, index) in stats">
            <n-space justify="space-between" style="max-width:380px" v-if="(editMode && !val.cat) || !editMode">
                <n-button :text="route.fullPath !== `/country/${Number(index) + 1}`"
                    @click="router.push(`/country/${Number(index) + 1}`)">{{
                        val.rank
                    }}. {{ val.name }} </n-button>
                <div>
                    <n-tag :type="getParentProp(val.cat, 'title') === '<unsorted>' ? 'error' : 'warning'" size="small"
                        v-if="getParentProp(val.cat, 'title')">
                        {{ getParentProp(val.cat, 'emoji') }}
                        {{ getParentProp(val.cat, 'title') || '<error>' }}
                    </n-tag>
                    <n-tag type="info" size="small" v-if="val.cat">
                        {{ datum?.[val.cat]?.title }}
                    </n-tag>
                    <n-button v-else size="tiny" @click="openModal(Number(index), val.name, val.cat)">
                        Annotate
                    </n-button>
                </div>
            </n-space>
            <!-- <n-button text icon="pi pi-pencil" @click="showEditor = index"></n-button> -->
        </n-space>
    </div>
    <!--
      <div class="field mx-auto text-center">
          <InputText id="search" aria-describedby="search-help" type="text" v-model="userinput" @input="inputEvent" class="d-block mx-auto" />
          <small id="search-help">Увядзіце больш за 2 знакі. <br/>Вынік адлюстроўваецца імгненна</small>u
      </div>
      -->
</template>

<script setup lang="ts">
import { ref, onBeforeMount, reactive } from 'vue';
import store from '../store';
import { useRouter, useRoute } from 'vue-router';

const showModal = ref(false);
const router = useRouter();
const route = useRoute();
const page = ref(Number(route.params.page) || 1);
const limit = Number(route.params.limit) || 500;
const editMode = ref(true);
const stem = ref<IInfo>({ title: '', emoji: '', names: [], leaf: 1, en: '', id: null, parent: null, num: null });
const datum = reactive({} as keyable);
const stats = ref();
const isLoaded = ref(false);
const count = ref(0);

const getParentProp = (itemId: number, feature: string) => datum?.[String([datum?.[itemId]?.parent])]?.[feature] || '';

const getNames = async () => {
    stats.value = await store.api(`names/${page.value}/${limit}`);
    const ontology = await store.api('ontology');
    Object.assign(datum, ...(ontology.map((x: keyable) => ({ [x.id]: x }))));
    const data = await store.api('count');
    count.value = data?.ttl || 0;
};

const paginate = async () => {
    router.push(`/list/${page.value}/${limit}`)
    await getNames();
};

const saveStem = async () => {
    showModal.value = false;
    // console.log(stem.value);
    const data = await store.save('topic', stem.value);
    if (data.changes === 1) {
        const response = await fetch('/api/default');
        if (response.status === 200 && stem?.value?.num) {
            const parent = await response.json();
            stem.value.id = data.lastID;
            // datum[stem.value.num]["cat"] = stem.value;
            // datum[stem.value.num]["parent"] = parent;
        }
    } else {
        console.error("topic saving error!");
    }
};

const openModal = (id: number, name: string, item: IInfo) => {
    // console.log(item);
    showModal.value = true;

    if (item === undefined) {
        stem.value = { "id": null, "emoji": "", "title": "", "en": "", "names": [name], "parent": null, "leaf": 1, "num": id }
    } else {
        stem.value = item;
    }

    if (!stem.value?.title) {
        stem.value.title = name.toLowerCase();
    }
};



onBeforeMount(async () => {
    await getNames();
    // console.log(stats.value);
    isLoaded.value = true;
});

</script>

<style scoped>
.item {
    margin-bottom: 1rem;
    padding: 5px;
    /* background: darkred;
         color:white;
        */
}
</style>
