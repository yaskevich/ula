
<template>
    <div class="card flex justify-center">
        <Tree :value="nodes" class="w-full md:w-[30rem]"></Tree>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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
    

onMounted(() => {
    // NodeService.getTreeNodes().then((data) => (nodes.value = data));
});
</script>
