<template>
    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="Select the group and enter the stem" :bordered="false" size="huge"
            role="dialog" aria-modal="true">
            <template #header-extra>
                <!-- Oops! -->
            </template>
            <n-space vertical>
                <n-radio-group v-model:value="stem.parent" name="radiogroup">
                    <n-space>
                        <n-radio v-for="value in Object.values(ontology).filter((x: any) => !x?.leaf)" :key="value.id"
                            :value="value.id" :label="value.emoji + ' ' + value.title" />
                        <n-radio key="group" :value="10000">
                            <n-select v-model:value="autoValue" filterable :options="options" :clearable="true"
                                @update:value="selectGroup" @focus="focusGroup" />
                        </n-radio>
                    </n-space>
                </n-radio-group>
                <n-input-group>
                    <n-button @click="hideModal" type="warning">
                        Cancel
                    </n-button>
                    <n-input @keyup.enter="saveStem" v-model:value="stem.title" type="text" placeholder="stem" />
                    <n-button @click="saveStem" :disabled="!stem?.parent || (stem?.parent === 10000 && !autoValue)"
                        type="info">
                        Save
                    </n-button>
                </n-input-group>
                <div>
                    <n-data-table v-if="optional?.length > 1" :columns="columns" :data="optional" size="small" />
                    <n-tag type="success" v-else>{{ optional?.[0]?.['qty'] }}</n-tag>
                </div>
            </n-space>
            <!-- <n-select v-model:value="multipleSelectValue" filterable tag :options="options" /> -->
            <template #footer>
                <!-- Footer -->
            </template>
        </n-card>
    </n-modal>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
    <div v-if="isLoaded">
        <n-space vertical>
            <n-switch v-model:value="editMode">
                <template #checked>
                    {{stats.filter((x: any) => !x?.cat)?.length}}
                </template>
                <template #unchecked>
                    {{ stats?.length }}
                </template>
            </n-switch>
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
                        {{ ontology?.[val.cat]?.title }}
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
const stem = ref<IInfo>({ title: '', emoji: '', leaf: 1, en: '', id: null, parent: null, num: null, name: '' });
const ontology = reactive({} as keyable);
const stats = ref();
const isLoaded = ref(false);
const count = ref(0);
const optional = ref([]);
const columns = [{ title: 'Variant', key: 'prename' }, { title: 'Number', key: 'qty' },];
const autoValue = ref();
const options = ref([]);

const focusGroup = () => {
    stem.value.parent = 10000;
};

const getParentProp = (itemId: number, feature: string) => ontology?.[String([ontology?.[itemId]?.parent])]?.[feature] || '';

const getNames = async () => {
    stats.value = await store.api(`names/${page.value}/${limit}`);
    const data1 = await store.api('ontology');
    const data2 = await store.api('count');
    Object.assign(ontology, ...(data1.map((x: keyable) => ({ [x.id]: x }))));
    count.value = data2?.ttl || 0;
};

const selectGroup = () => {
    console.log("selected", autoValue.value);
};

const paginate = async () => {
    router.push(`/list/${page.value}/${limit}`)
    await getNames();
};

const saveStem = async () => {
    let data = {} as keyable;
    let cat;
    // console.log(stem.value, autoValue.value);
    if (stem.value.parent === 10000) {
        cat = options.value.find((x: any) => x.value === autoValue.value)?.['parent'];
        data = await store.save('group', { name: stem.value.name, id: autoValue.value });
    } else {
        data = await store.save('topic', stem.value);
        cat = stem.value?.parent;
    }
    if (data.changes === 1) {
        const current = stats.value.find((x: any) => x.name === stem.value.name);
        current.cat = cat;
        autoValue.value = null;
        stem.value = { title: '', emoji: '', leaf: 1, en: '', id: null, parent: null, num: null, name: '' };
        showModal.value = false;
    } else {
        console.error("topic saving error!");
    }
};

const hideModal = () => {
    showModal.value = false;
    stem.value = { "id": null, "emoji": "", "title": "", "en": "", "parent": null, "leaf": 1, "num": null };
};

const openModal = async (id: number, name: string, item: IInfo) => {
    optional.value = await store.api('optional', { name });

    if (item === undefined) {
        stem.value = { "id": null, "emoji": "", "title": "", "en": "", "parent": null, "leaf": 1, "num": id }
    }
    if (!stem.value?.title) {
        stem.value.title = name.toLowerCase();
    }
    if (!stem.value?.name) {
        stem.value.name = name;
    }
    showModal.value = true;
};

onBeforeMount(async () => {
    await getNames();
    const topics = await store.api('topics');
    // console.log(topics);
    options.value = topics?.map((x: any) => ({ label: x.title, value: x.id, parent: x.parent }));
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
