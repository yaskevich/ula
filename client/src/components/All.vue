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
        <div class="p-4">
            <n-switch v-model:value="editMode" />
        </div>

        <n-space vertical v-for="(val, index) in datum">
            <n-space justify="space-between" style="max-width:380px" v-if="(editMode && !val.parent?.id) || !editMode">
                <n-button :text="route.fullPath !== `/country/${Number(index) + 1}`"
                    @click="router.push(`/country/${Number(index) + 1}`)">{{
                        Number(index) + 1
                    }}. {{ val.name }}</n-button>
                <div>
                    <n-tag :type="val.parent?.title === '<unsorted>' ? 'error' : 'warning'" size="small"
                        v-if="val?.parent?.title">
                        {{ val.parent.title || '<error>' }}
                    </n-tag>
                    <n-tag type="info" size="small" v-if="val.cat?.id">
                        {{ val.cat?.title }}
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
const limit = Number(route.params.limit) || 500;
// console.log(route.params.limit);
const editMode = ref(true);
const stem = ref<IInfo>({ title: '', emoji: '', names: [], leaf: 1, en: '', id: null, parent: null, num: null });
const datum = reactive({} as keyable);
const stats = ref();

const saveStem = async () => {
    showModal.value = false;
    // console.log(stem.value);
    const response = await fetch('/api/topic', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json', // this needs to be defined
        },
        body: JSON.stringify(stem.value),
    });
    if (response.status === 200) {
        const data = await response.json();
        if (data.changes === 1) {
            const response = await fetch('/api/default');
            if (response.status === 200 && stem?.value?.num) {
                const parent = await response.json();
                stem.value.id = data.lastID;
                datum[stem.value.num]["cat"] = stem.value;
                datum[stem.value.num]["parent"] = parent;
            }
        } else {
            console.error("topic saving error!");
        }
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

const isLoaded = ref(false);

const options = [
    {
        label: 'tag1',
        value: 'id1',
        disabled: true
    },
    {
        label: 'tag2',
        value: 'id2'
    },];

const getNames = async () => {
    const response = await fetch('/api/names');
    if (response.status === 200) {
        const data = await response.json();
        stats.value = data;
    }
};

onBeforeMount(async () => {
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const fetched = await response.json();
        fetched.forEach((x: any) => x.names = JSON.parse(x.names));
        await getNames();
        // console.log(stats.value);
        const chunk = stats.value.slice(0, limit);
        for (const index in chunk) {
            const val = chunk[index];
            const cat = fetched?.find((x: any) => x.names?.includes(val.name));
            const parent = fetched?.find((x: any) => x.id === cat?.parent);
            datum[String(index)] = { name: val.name, qty: val.qty, parent, cat, key: index };
        }

        isLoaded.value = true;
    } else {
        console.log("fetching error");
    }

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