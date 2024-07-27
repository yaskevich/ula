<template>
  <h3>{{ streetObject?.name }} [{{ streetObject?.freq }}]</h3>
  <ButtonGroup>
    <Button @click="loadPrevious" :disabled="!curIndex" icon="pi pi-arrow-left"></Button>
    <Button @click="loadNext" icon="pi pi-arrow-right"></Button>
  </ButtonGroup>

  <div ref="mapRef" id="map">
    <svg ref="svgRef" :width="svgWidth" :height="svgHeight">
      <text x="0" y="15" class="title">{{ unit }}</text>
      <text x="0" y="60" class="quantity">{{ num }}</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import store from '../store';
import * as d3 from 'd3';

const svgWidth = ref(0);
const svgHeight = ref(0);

let legendOffsetY = 0;
const legendOffsetX = 5;
const legendHeight = 10;
const legendRightMargin = 50;
let legendCellWidth = 5;

const unit = ref('');
const num = ref('');
const svgRef = ref(null);
const mapRef = ref<HTMLElement | null>(null);

const streetObject = ref<IStreetInfo>();
const getCount = (id: number) => streetObject.value?.regions?.[id] || 0;

const curIndex = ref(0);

const loadStreet = () => {

  let svg = d3.select(svgRef.value);

  svg.selectAll("*").remove();
  const parentNode = d3.select(mapRef.value).node();

  if (parentNode !== null) {
    svgWidth.value = parentNode.getBoundingClientRect().width;
  }

  svgHeight.value = svgWidth.value * 1;
  // console.log(svgWidth.value, svgHeight.value);
  legendOffsetY = svgHeight.value - 30;

  const projection = d3.geoMercator()
    .center([19.480556, 52.069167])
    .scale(svgWidth.value / Math.PI * 16)
    .translate([svgWidth.value >> 1, svgHeight.value >> 1]);

  streetObject.value = Object.values(store.freq[curIndex.value])?.[0] as IStreetInfo;

  const last = d3.max(Object.values(streetObject.value.regions));
  const colorize = d3.scaleLinear<string>().domain([0, last]).clamp(true).range(['#f1eef6', '#0570b0']);

  legendCellWidth = (svgWidth.value - legendRightMargin) / last;

  svg.append("g")
    .selectAll("path")
    .data(store.geofeatures)
    .join("path")
    .classed('district', true)
    .attr('fill', (d: any) => {
      return colorize(getCount(d.properties.terytId));
    })
    .attr("d", d3.geoPath().projection(projection) as any)
    .on("mouseover", (e, d: any) => {
      unit.value = d.properties.nazwa + ' w-wo';
      num.value = getCount(d.properties.terytId);
    })
    .on("mouseout", function () {
      unit.value = num.value = '';
    });

  const legend = svg.append('g');

  legend
    .selectAll('.legend')
    .data(d3.range(last))
    .enter().append('rect')
    .attr('x', d => legendOffsetX + d * legendCellWidth + 'px')
    .attr("y", legendOffsetY)
    .attr("width", legendCellWidth)
    .attr("height", legendHeight)
    .attr('fill', d => colorize(d));

  legend
    .append("g")
    .attr("transform", `translate(${legendOffsetX},${legendOffsetY + legendHeight})`)
    .call(d3.axisBottom(d3.scaleLinear().domain([0, last]).range([0, last * legendCellWidth])).ticks(Math.round(last / 100)));
};

const loadNext = () => {
  curIndex.value += 1;
  loadStreet();
};

const loadPrevious = () => {
  if (curIndex.value) {
    curIndex.value -= 1;
    loadStreet();
  }
};

onMounted(() => loadStreet());

</script>

<style scoped lang="scss">
:deep(.district) {
  stroke: silver;

  &:hover {
    fill: #fbd0da;
  }
}

:deep(.title) {
  /* fill: #2196f3;
  fill: #0570b0; */
  fill: #5f071c;
}

:deep(.quantity) {
  /* fill: #2196f3; 
  fill: #0570b0;*/
  fill: #5f071c;
  font-size: 2em;
}
</style>
