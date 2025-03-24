<template>
    <h3>Structure of street names</h3>
    <div id="graph"></div>
    <n-data-table :columns="columns" :data="stats" :row-props="rowProps" :row-class-name="rowClassName"
        style="font-weight:bold;" />
</template>


<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import * as d3 from 'd3';

const rowClassName = (row: IWord) => {
    if (row.qty > 10000) {
        return 'good'
    } else if (row.qty > 1000) {
        return 'pass'
    } else if (row.qty > 100) {
        return 'bad';
    }
    return 'hell';
};
const stats = ref<Array<IWord>>();

const rowProps = (row: IWord) => {
    return {
        style: 'cursor: pointer;',
        onClick: () => {
            console.info(row.words, row.qty)
        }
    }
};

const columns: DataTableColumns = [
    {
        title: 'Words number',
        key: 'words'
    },
    {
        title: 'Quantity',
        key: 'qty'
    },];

const getWords = async () => {
    const response = await fetch('/api/words');
    if (response.status === 200) {
        const data = await response.json();
        stats.value = data;
    }
};

const renderBar = () => {
    if (stats?.value?.length) {
        const margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        const x = d3.scaleBand().range([0, width]).padding(0.1);
        const y = d3.scaleLinear().range([height, 0]);
        const svg = d3.select("#graph").append("svg");
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const data = stats.value.filter(x => x.words > 6).reverse();

        x.domain(data.map((d) => String(d.words)));
        y.domain([0, d3.max(data, (d: any) => d.qty)]);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => String(x(String(d.words))))
            .attr("width", x.bandwidth())
            .attr("y", (d) => y(d.qty))
            .attr("height", (d) => height - y(d.qty));

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g").call(d3.axisLeft(y));
    }
};


onMounted(async () => {
    await getWords();
    renderBar();
});
</script>
<style scoped>
:deep(.bar) {
    /* fill: steelblue; */
    fill: #cc3232;
}

:deep(.good td) {
    background-color: #99c140 !important;
}

:deep(.pass td) {
    background-color: #e7b416 !important;
}

:deep(.bad td) {
    background-color: #db7b2b !important;
}

:deep(.hell td) {
    background-color: #cc3232 !important;
}
</style>