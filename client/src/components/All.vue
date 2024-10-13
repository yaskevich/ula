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
        <n-space vertical v-for="(val, index) in (store.freq as any).streets.slice(0, limit)">
            <n-space justify="space-between" style="max-width:300px"
                v-if="(editMode && !cats?.[val.name]) || !editMode">
                <n-button :text="route.fullPath !== `/country/${index + 1}`"
                    @click="router.push(`/country/${index + 1}`)">{{
                        index + 1
                    }}. {{ val.name }}</n-button>
                <!-- <InputText v-if="showEditor === index" type="text" v-model="value" size="small" /> -->
                <div>
                    <n-tag :type="obj[cats[val.name]]?.title === '<unsorted>' ? 'error' : 'warning'" size="small"
                        v-if="val.name in cats">
                        {{ obj[cats[val.name]]?.title || '<error>' }}
                    </n-tag>
                    <n-tag type="info" size="small" v-if="val.name in dict">
                        {{ dict[val.name] }}
                    </n-tag>

                    <n-button v-else size="tiny" @click="openModal(val.name, obj[cats[val.name]])">
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
import { ref, onBeforeMount } from 'vue';
import store from '../store';
import { useRouter, useRoute } from 'vue-router';

const showModal = ref(false);
const dict = ref();
const cats = ref({} as keyable);
const obj = ref();
const router = useRouter();
const route = useRoute();
const limit = Number(route.params.limit) || 500;
// console.log(route.params.limit);
const editMode = ref(false);
const stem = ref<IInfo>({ title: '', emoji: '', names: [], leaf: 1, en: '', id: null, parent: null });

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
        console.log("change", data);
    }
};

const openModal = (name: string, item: IInfo) => {
    // console.log(item);
    showModal.value = true;

    if (item === undefined) {
        stem.value = { "id": null, "emoji": "", "title": "", "en": "", "names": [name], "parent": null, "leaf": 1 }
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

onBeforeMount(async () => {
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const fetched = await response.json();
        const hash1 = {} as keyable;
        const hash2 = {} as keyable;
        const hash3 = {} as keyable;
        fetched.forEach((x: any) => {
            JSON.parse(x.names)?.forEach((y: any) =>
                (hash1[y] = x.title) && (hash3[y] = x.parent)
            );
            hash2[x['id']] = x;
        });
        dict.value = hash1;
        obj.value = hash2;
        cats.value = hash3;
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