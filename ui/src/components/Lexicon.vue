<template>
    <div class="card flex justify-center">
        <Tree :value="nodeRefs" class="w-full md:w-[30rem]"></Tree>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const nodeRefs = ref();
const icons = ['crown', 'clipboard', 'warehouse', 'trophy', 'bullseye', 'briefcase', 'bell', 'envelope', 'palette', 'sun', 'car', 'building', 'gauge', 'thumbtack', 'barcode', 'face-smile']


const nodes = [
    {
        key: '0',
        label: 'Documents',
        data: 'Documents Folder',
        icon: 'pi pi-fw pi-inbox',
        children: [
            {
                key: '0-0',
                label: 'Work',
                data: 'Work Folder',
                icon: 'pi pi-fw pi-cog',
                children: [
                    { key: '0-0-0', label: 'Expenses.doc', icon: 'pi pi-fw pi-file', data: 'Expenses Document' },
                    { key: '0-0-1', label: 'Resume.doc', icon: 'pi pi-fw pi-file', data: 'Resume Document' }
                ]
            },
            {
                key: '0-1',
                label: 'Home',
                data: 'Home Folder',
                icon: 'pi pi-fw pi-home',
                children: [{ key: '0-1-0', label: 'Invoices.txt', icon: 'pi pi-fw pi-file', data: 'Invoices for this month' }]
            }
        ]
    },
    {
        key: '1',
        label: 'Events',
        data: 'Events Folder',
        icon: 'pi pi-fw pi-calendar',
        children: [
            { key: '1-0', label: 'Meeting', icon: 'pi pi-fw pi-calendar-plus', data: 'Meeting' },
            { key: '1-1', label: 'Product Launch', icon: 'pi pi-fw pi-calendar-plus', data: 'Product Launch' },
            { key: '1-2', label: 'Report Review', icon: 'pi pi-fw pi-calendar-plus', data: 'Report Review' }
        ]
    },
    {
        key: '2',
        label: 'Movies',
        data: 'Movies Folder',
        icon: 'pi pi-fw pi-star-fill',

    }
];


onMounted(async () => {
    // NodeService.getTreeNodes().then((data) => (nodes.value = data));
    const response = await fetch('/api/onto');
    if (response.status === 200) {
        const data = await response.json();
        // console.log(data);
        const datum = Object.entries(data).map((x, z) => ({
            key: x[0] || 'unsorted',
            label: x[0] || 'unsorted',
            // data: 'Documents Folder',
            icon: 'pi pi-fw pi-' + (icons.shift() || 'bookmark-fill'),
            children: x[1].map(y => ({
                key: y.stem || 'unnamed',
                label: y.stem || 'unnamed',
                // data: 'Documents Folder',
                icon: 'pi pi-fw pi-bookmark',
            }))
        }));
        nodeRefs.value = datum;
        // console.log(datum);
    } else {
        console.log("fetching error");
    }
});
</script>

<style>
.p-tree-node-label {
    text-transform: capitalize;
}
</style>
