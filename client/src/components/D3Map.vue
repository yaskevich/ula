<template>
  <div style="min-width:500px">
    <n-checkbox @update:checked="showHideCaptions" :default-checked="true" v-if="vuerouter.name !== 'Regions'" />
    <!-- <n-button @click="console.log(props.place)">check</n-button> -->
    <div ref="mapRef" id="map">
      <svg ref="svgRef" :width="svgWidth" :height="svgHeight" style="font-family: 'Open Sans'">
        <text x="0" y="15" class="title">{{ unit }}</text>
        <text x="250" y="25" class="quantity">{{ num }}</text>
        <g v-if="vuerouter.name === 'Top'">
          <text x="0" y="410">🏅{{ id + 1 }} ({{ streetObject?.freq }})</text>
          <text x="0" y="440" class="street">{{ streetObject?.name }}</text>
        </g>
      </svg>
    </div>
    <n-space>
      <n-button-group v-if="vuerouter.name === 'Top'">
        <n-button @click="loadPrevious" :disabled="id < 2">
          <template #icon>
            <n-icon :component="ArrowLeft" />
          </template>
        </n-button>
        <n-button @click="chartClicked" link severity="secondary">
          <template #icon>
            <n-icon :component="Download" />
          </template>
        </n-button>
        <n-button @click="loadNext">
          <template #icon>
            <n-icon :component="ArrowRight" />
          </template>
        </n-button>
      </n-button-group>
      <n-button @click="animate">{{ myInterval ? 'Stop' : 'Run' }}</n-button>
      <n-auto-complete v-if="vuerouter.name === 'Top'" v-model:value="autoValue" :options="options"
        placeholder="street name" @select="selectAuto" @update:value="chooseAuto" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount, ref, toRaw, watch } from 'vue';
import * as d3 from 'd3';
import { ArrowRight, ArrowLeft, Download } from '@vicons/carbon';
import { useRoute } from 'vue-router';
import { onBeforeRouteUpdate } from 'vue-router';
import router from '../router';
import store from '../store';
import dv from '../dataviz';

const props = defineProps({
  place: { type: Number },
  street: { type: String }
});

const vuerouter = useRoute();
// console.log(vuerouter.name);
const inId = Number(toRaw(vuerouter?.params?.id));
const id = ref(inId > 0 ? inId - 1 : 0);
// console.log("requested", id.value);
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
const myInterval = ref();
const groups = ref();
const regions = ref();
const autoValue = ref('');
const options = ref([]);
const getCounts = (hash: keyable, num: number | string) => hash?.[num] || [0, 0];
const renderPercent = (x: number) => String(parseFloat(Number(x).toFixed(4)));

const selectAuto = (rank: number) => {
  console.log('selected', rank, options.value.find((x: any) => x.rank === rank));
  router.push(`/country/${rank}`);
};

const chooseAuto = async (chunk: string) => {
  if (chunk?.length > 3) {
    // console.log(chunk);
    const data = await store.api('name', { chunk });
    // console.log(data);
    options.value = data.map((x: any) => ({ ...x, label: x.name, value: x.rank }));
  }
};

const showHideCaptions = (checked: boolean) => {
  d3.selectAll('.captions').classed('hidden', !checked);
};

const chartClicked = async () => {
  if (svgRef.value) {
    await dv.renderImage(svgRef.value);
  }
};

const loadStreet = async () => {
  id.value = id.value || 0;
  // console.log('call load street', id.value);
  if (vuerouter.name === 'Regions') {
    // console.log("load regions");
    const data = await store.api('groups');
    groups.value = data;
  } else if (vuerouter.name === 'Top') {
    console.log(id.value, props.street);
    streetObject.value = await store.api('street/' + props.street);
  }

  let svg = d3.select(svgRef.value);

  svg.select(".carta").remove();
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

  const path = d3.geoPath().projection(projection);

  const values = Object.values(vuerouter.name === 'Top' ? streetObject?.value?.regions : regions.value).map((x: any) => x[1]);
  const ext = d3.extent(values) as Array<number>;
  const last = ext[1];

  if (ext[0] !== undefined && ext[1] !== undefined) {
    const leftLim = Math.ceil(last);
    const colorize = d3.scaleLinear<string>().domain([0, last]).range(['#f1eef6', '#0570b0']);

    // const colorize = d3.scaleThreshold().domain(d3.ticks(0, leftLim, 5)).range(d3.schemeBlues[5] as any);

    legendCellWidth = (svgWidth.value - legendRightMargin) / last;
    const carta = svg.append("g").classed('carta', true);
    carta.append("g")
      // .   attr('x', '550px')
      // .attr("y", '150px')
      // .attr("transform", `translate(150,0)`)
      .selectAll("path")
      .data(store.geofeatures)
      .join("path")
      .style("stroke", 'black')
      .classed('district', true)
      .attr('fill', (d: any) => {
        // console.log(d);
        if (vuerouter.name === 'Regions') {
          return 'aliceblue';
        }
        const numid = String(d.properties.terytId).padStart(2, '0');
        // console.log(String(d.properties.terytId).padStart(2, '0'), d.properties.terytId);

        // String(d.properties.terytId).padStart(2, '0')
        // console.log(getCounts(regions.value, Number());

        // console.log(regions.value, numid);
        // console.log(getCounts(regions.value, numid)[1]);

        // console.log(colorize(getCounts(regions.value, d.properties.terytId)[1]));
        // console.log(colorize(getCounts(regions.value, numid)[1]));
        const obj = vuerouter.name === 'Top' ? streetObject?.value?.regions : regions.value;
        return colorize(getCounts(obj, numid)[1]);
      })
      .attr("d", path as any)
      .on("mouseover", (e: any, d: any) => {
        unit.value = d.properties.nazwa + ' w-wo';
        const tid = String(d.properties.terytId).padStart(2, '0');

        if (vuerouter.name === 'Regions') {
          if (props?.place) {
            num.value = groups.value[tid][props.place - 1]?.qty;
          }
        } else {
          const obj = vuerouter.name === 'Top' ? streetObject?.value?.regions : regions.value;
          const counts = getCounts(obj, tid);
          num.value = `${counts[0]} ≈ ${renderPercent(counts[1])}%`;
        }
      })
      .on("mouseout", function () {
        unit.value = num.value = '';
      });


    const getRegionCaption = (d: any) => {
      // console.log(d);
      if (vuerouter.name !== 'Regions') {
        return d.properties.nazwa;
      }
      const regionData = groups.value[String(d.properties.terytId).padStart(2, '0')];
      if (regionData?.length) {
        const idx = props.place || 1;
        const regionInfo = regionData?.[idx - 1];
        return regionInfo?.title;
        // console.log(groups.value);
      } else {
        console.log('error');
      }
      // 
      return d.properties.nazwa;
    };
    carta.append("g").attr('class', 'captions')
      .selectAll("text")
      .data(store.geofeatures)
      .enter().append("text")
      .attr("class", "place-label shadow")
      .style("font-size", "8px")
      .attr("x", (d: any) => path.centroid(d)[0])
      .attr("y", (d: any) => path.centroid(d)[1] + 4)
      .attr("text-anchor", "middle")
      .text((d: any) => getRegionCaption(d));

    carta.append("g").attr('class', 'captions')
      .selectAll("text")
      .data(store.geofeatures)
      .enter().append("text")
      .attr("class", "place-label")
      .style("font-size", "8px")
      .attr("x", (d: any) => path.centroid(d)[0])
      .attr("y", (d: any) => path.centroid(d)[1] + 4)
      .attr("text-anchor", "middle")
      .text((d: any) => getRegionCaption(d));

    showHideCaptions(true);

    if (vuerouter.name !== 'Regions') {
      const legend = carta.append('g');
      const ticksNumber = 10;

      legend
        .selectAll('.legend')
        .data(d3.ticks(0, Math.ceil(last), ticksNumber))
        .enter().append('rect')
        .attr('x', (d: any) => legendOffsetX + d * legendCellWidth + 'px')
        .attr("y", legendOffsetY)
        .attr("width", legendCellWidth)
        .attr("height", legendHeight)
        .attr('fill', (d: any) => {
          // console.log(d, colorize(d));
          return colorize(d)
        });

      const sc = d3.scaleLinear().domain([0, last]).range([0, last * legendCellWidth]);

      legend
        .append("g")
        .attr("transform", `translate(${legendOffsetX},${legendOffsetY + legendHeight})`)
        .call(d3.axisBottom(sc).ticks(ticksNumber).tickFormat((d: any, i: any) => renderPercent(d as number))); // Math.round(last / 5)
    }
  }
};

const loadNext = () => {
  id.value += 1;
  if (vuerouter.name === 'Regions') {
    router.push(`/regions/${id.value}`);
  } else {
    router.push(`/country/${id.value}`);
  }
};

const loadPrevious = () => {
  if (id.value) {
    id.value -= 1;
    router.push(`/country/${id.value}`);
  }
};

watch(() => props.place, async (selection, prevSelection) => {
  // console.log("props update", props.place, selection);
  await loadStreet();
});

const animate = () => {
  if (myInterval.value) {
    clearInterval(myInterval.value);
    myInterval.value = null;
  } else {
    myInterval.value = setInterval(function () {
      console.log("next");
      loadNext();
    }, 1000);
  }
};

onBeforeMount(async () => await dv.getFontBase64(d3.select("svg")));

onMounted(async () => {
  if (!id.value && vuerouter.name === 'Top') {
    console.log("update URL");
    id.value = 1;
    router.push(`/country/${id.value}`)
  }

  const data = await store.api('regions');
  regions.value = data;
  await loadStreet();
});

onBeforeRouteUpdate(async (to, from) => {
  console.log('route update', to.params);
  id.value = Number(to.params.id) - 1;
  loadStreet();
});
</script>

<style scoped lang="scss">
:deep(.district) {
  // stroke: silver;

  &:hover {
    fill: #fbd0da;
  }
}

:deep(.street) {
  fill: #0f4260;
  font-size: 1.5em;
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

#map {
  min-width: 350px;
  max-width: 500px;
}

:deep(.place-label) {
  stroke: black;
  stroke-width: 0.5px;
  pointer-events: none;
}

:deep(.place-label.shadow) {
  stroke: white;
  stroke-width: 2.5px;
  opacity: 0.9;
}

:deep(.hidden) {
  display: none;
}
</style>
