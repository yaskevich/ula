<template>
    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="Enter the stem" :bordered="false" size="huge" role="dialog"
            aria-modal="true">
            <template #header-extra>
                <!-- Oops! -->
            </template>
            <n-input @keyup.enter="getName" v-model:value="value" type="text" placeholder="stem" />
            <!-- <n-select v-model:value="multipleSelectValue" filterable tag :options="options" /> -->
            <template #footer>
                <!-- Footer -->
            </template>
        </n-card>
    </n-modal>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
    <div v-if="isLoaded">
        <n-space vertical v-for="(val, index) in (store.freq as any).streets.slice(0, limit)">
            <n-space justify="space-between" style="max-width:300px">
                <n-button :text="route.fullPath !== `/country/${index + 1}`"
                    @click="router.push(`/country/${index + 1}`)">{{
                        index + 1
                    }}. {{ val.name }}</n-button>
                <!-- <InputText v-if="showEditor === index" type="text" v-model="value" size="small" /> -->
                <div>
                    <n-tag :type="cats[val.name] ? 'warning' : 'error'" size="small" v-if="val.name in cats">
                        {{ obj[cats[val.name]]?.title || '<error>' }}
                    </n-tag>
                    <n-tag type="info" size="small" v-if="val.name in dict">
                        {{ dict[val.name] }}
                    </n-tag>

                    <n-button v-else size="tiny" @click="showModal = true">
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
const showEditor = ref();
const router = useRouter();
const route = useRoute();
const limit = Number(route.params.limit) || 500;
console.log(route.params.limit);

const getName = () => {
    console.log(value.value);
}

const multipleSelectValue = ref(null);

const value = ref('');

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
    const response = await fetch('/api/dict');
    if (response.status === 200) {
        const data = await response.json();
        dict.value = data;
        // isLoaded.value = true;
    } else {
        console.log("fetching error");
    }
    const response2 = await fetch('/api/onto');
    if (response.status === 200) {
        const fetched = await response2.json();
        const data = Object.assign({}, ...fetched.map((x: any) => ({ [x['id']]: x })))
        // console.log(data);
        obj.value = data;
        // dict.value = data;
        const dataCats = {} as keyable;
        for (const item in data) {
            JSON.parse(data[item]?.names)?.forEach((x: any) => dataCats[x] = data[item].parent);
        }
        cats.value = dataCats;
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