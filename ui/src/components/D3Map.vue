<template>
  <!-- <h3>{{ streetObject?.name }} [{{ streetObject?.freq }}] 🏅{{ curIndex + 1 }}</h3> -->
  <!-- <h5> <i class="pi pi-info-circle"></i> {{ unit }} {{ num }} </h5> -->
  <Checkbox @change="showHideCaptions" v-model="captionsVisible" :binary="true" />

  <div ref="mapRef" id="map">
    <svg ref="svgRef" :width="svgWidth" :height="svgHeight" style="font-family: 'Open Sans'">
      <text x="0" y="15" class="title">{{ unit }}</text>
      <text x="250" y="25" class="quantity">{{ num }}</text>
      <g v-if="vuerouter.name === 'Top'">
        <text x="0" y="350">🏅{{ id + 1 }} ({{ streetObject?.freq }})</text>
        <text x="0" y="390" class="street">{{ streetObject?.name }}</text>
      </g>
    </svg>
  </div>
  <ButtonGroup v-if="vuerouter.name === 'Top'">
    <Button @click="loadPrevious" :disabled="!id" icon="pi pi-arrow-left"></Button>
    <Button @click="chartClicked" link severity="secondary" icon="pi pi-save" />
    <Button @click="loadNext" icon="pi pi-arrow-right"></Button>
  </ButtonGroup>
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount, ref, toRaw } from 'vue';
import router from '../router';
import store from '../store';
import * as d3 from 'd3';
import { useRoute } from 'vue-router';
import { onBeforeRouteUpdate } from 'vue-router';

const captionsVisible = ref(true);

const vuerouter = useRoute();
console.log(vuerouter.name);

const id = ref(Number(toRaw(vuerouter?.params?.id)) || 0);
console.log("requested", id.value);

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
const getCounts = (num: number) => streetObject.value?.regions?.[num] || [0, 0];

const showHideCaptions = () => {
  d3.selectAll('.captions').classed('hidden', !captionsVisible.value);
};

const serializeSVG = (svg: HTMLElement | SVGElement) => {
  const xmlns = 'http://www.w3.org/2000/xmlns/';
  const xlinkns = 'http://www.w3.org/1999/xlink';
  const svgns = 'http://www.w3.org/2000/svg';
  return function serialize() {
    // console.log("svg source", svg);
    (svg as Node) = svg.cloneNode(true);
    const fragment = window.location.href + '#';
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      for (const attr of (walker.currentNode as Element).attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, '#');
        }
      }
    }
    svg.setAttributeNS(xmlns, 'xmlns', svgns);
    svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);
    // const { width, height } = resizeState.dimensions;
    const width = 600, height = 400;

    svg.setAttribute('viewBox', `-10 -10 ${width + 20} ${height + 40}`);
    const serializer = new window.XMLSerializer();
    const string = serializer.serializeToString(svg);
    return new Blob([string], { type: 'image/svg+xml' });
  };
};

const renderImage = (svg: HTMLElement) => {
  let resolve, reject = null;
  const promise = new Promise((y, n) => ((resolve = y), (reject = n)));
  const image = new Image();
  image.onerror = reject;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const link = document.createElement('a');
  // const filename = tkn + '-' + store.getFormattedTime();
  const filename = "test.png";

  image.onload = () => {
    const rect = svg.getBoundingClientRect();
    canvas.width = rect.width * 4;
    canvas.height = rect.height * 4;
    if (context) {
      context.fillStyle = '#F1F1EF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, rect.width * 4, rect.height * 4);

      context.canvas.toBlob(function (blob) {
        if (blob) {
          var url = URL.createObjectURL(blob);
          link.download = filename + '.png';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    }
    // console.log('on load');
  };

  const serializedSVG = serializeSVG(svg);
  // console.log("svg:serialized", serializedSVG());
  const url = URL.createObjectURL(serializedSVG());
  link.download = filename + '.svg';
  image.src = url;
  link.href = url;
  // link.click();
  return promise;
};

const getFontBase64 = async () => {
  let newStyle = "";

  const blobToBase64 = (blob: Blob) => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule.constructor.name === 'CSSFontFaceRule') {
        const styleRule = (rule as CSSStyleRule).style;
        const srcString = styleRule.getPropertyValue("src");
        if (!srcString.includes('primeicons')) {
          const src = srcString.split("(")[1].split(")")[0].replace(/"|'/g, "");
          const blob = await (await fetch(src)).blob();
          const base64 = await blobToBase64(blob);
          newStyle += `@font-face {`;
          for (const style of styleRule) {
            const propValue = style !== "src" ? styleRule.getPropertyValue(style) : `url("${base64}")`;
            newStyle += `${style}: ${propValue};`;
          }
          newStyle += `}`;
        }
      }
    }
  }

  if (newStyle) {
    d3.select("svg").append('defs').append('style').attr('type', 'text/css').text(newStyle);
  }
};

const chartClicked = async () => {
  if (svgRef.value) {
    await renderImage(svgRef.value);
  }
};

const loadStreet = () => {
  id.value = id.value || 0;
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

  // vuerouter.name === 'Top'
  streetObject.value = Object.values(store.freq.streets[id.value])?.[0] as IStreetInfo;

  // router.push(`/top/${id.value}`);
  const values = vuerouter.name === 'Top' ? Object.values(streetObject.value.regions).map(x => x[1]) : Object.values(store.freq.regions);
  const ext = d3.extent(values) as Array<number>;
  // console.log("last", last);
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
        return colorize(vuerouter.name === 'Top' ? getCounts(d.properties.terytId)[1] : store.freq.regions[d.properties.terytId]);
      })
      .attr("d", path as any)
      .on("mouseover", (e, d: any) => {
        unit.value = d.properties.nazwa + ' w-wo';
        const counts = vuerouter.name === 'Top' ? getCounts(d.properties.terytId)[1] : [store.freq.regions[d.properties.terytId], 0];
        console.log(counts);

        num.value = `${counts[0]} ≈ ${counts[1]}%`;
      })
      .on("mouseout", function () {
        unit.value = num.value = '';
      });



    carta.append("g").attr('class', 'captions')
      .selectAll("text")
      .data(store.geofeatures)
      .enter().append("text")
      .attr("class", "place-label shadow")
      .style("font-size", "8px")
      .attr("x", (d: any) => path.centroid(d)[0])
      .attr("y", (d: any) => path.centroid(d)[1] + 4)
      .attr("text-anchor", "middle")
      .text((d: any) => d.properties.nazwa);

    carta.append("g").attr('class', 'captions')
      .selectAll("text")
      .data(store.geofeatures)
      .enter().append("text")
      .attr("class", "place-label")
      .style("font-size", "8px")
      .attr("x", (d: any) => path.centroid(d)[0])
      .attr("y", (d: any) => path.centroid(d)[1] + 4)
      .attr("text-anchor", "middle")
      .text((d: any) => d.properties.nazwa);


    showHideCaptions();

    const legend = carta.append('g');

    const ticksNumber = 10;

    legend
      .selectAll('.legend')
      .data(d3.ticks(0, Math.ceil(last), ticksNumber))
      .enter().append('rect')
      .attr('x', d => legendOffsetX + d * legendCellWidth + 'px')
      .attr("y", legendOffsetY)
      .attr("width", legendCellWidth)
      .attr("height", legendHeight)
      .attr('fill', d => {
        // console.log(d, colorize(d));
        return colorize(d)
      });

    const sc = d3.scaleLinear().domain([0, last]).range([0, last * legendCellWidth]);


    legend
      .append("g")
      .attr("transform", `translate(${legendOffsetX},${legendOffsetY + legendHeight})`)
      .call(d3.axisBottom(sc).ticks(ticksNumber).tickFormat((d, i) => String(parseFloat(Number(d).toFixed(4))))); // Math.round(last / 5)
  }
};

const loadNext = () => {
  id.value += 1;
  router.push(`/top/${id.value}`)
};

const loadPrevious = () => {
  if (id.value) {
    id.value -= 1;
    router.push(`/top/${id.value}`)
  }
};

onBeforeMount(async () => await getFontBase64());

onMounted(() => loadStreet());

onBeforeRouteUpdate(async (to, from) => {
  console.log(to.params);

  id.value = Number(to.params.id);
  loadStreet();
})
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
</style>
