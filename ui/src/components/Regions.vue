<template>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
    <div class="grid">
        <div class="col">
            <D3Map />
        </div>
        <div class="col">
            <div v-for="index in Array(500).keys()">
                <Button :text="route.fullPath !== `/regions/${index + 1}`"
                    @click="router.push(`/regions/${index + 1}`)">{{
                index + 1
            }}</Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import store from '../store';
import D3Map from './D3Map.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
// console.log(route.fullPath);
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
