<template>
    <!-- <h2>Analysis of the street names of Poland</h2> -->
    <n-space>
        <div>
            <D3Map />
        </div>
        <div>
            <n-input-number v-model:value="id" clearable :min="1" />
            <!-- <n-space>
                <span v-for="index in Array(500).keys()">
                    <n-button :type="route.fullPath !== `/regions/${index + 1}` ? 'default' : 'info'"
                        @click="router.push(`/regions/${index + 1}`)">
                        {{ index + 1 }}</n-button>
                </span>
            </n-space> -->
        </div>
    </n-space>
</template>

<script setup lang="ts">
import store from '../store';
import D3Map from './D3Map.vue';
import { ref, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const id = ref(Number(route.params.id));
</script>
