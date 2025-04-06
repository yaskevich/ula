import { reactive } from 'vue';
import * as d3 from 'd3';
import { feature as topofeature } from 'topojson-client';
import project from '../package.json';
import topos from '../../data/poland.json';

const geofeatures = (<any>topofeature((topos as any), (topos.objects.woj as any))).features;
const git = project?.repository?.url ? 'https' + project.repository.url.slice(3, -4) : '';


const state = reactive({
    exp: [] as Array<string>,
});


const renderBar = (data: [], keyName: string, valName: string, addKey = false) => {
    if (data?.length) {
        console.log(data);

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


        const formatKey = (x: any) => String(x[keyName]) + (addKey ? ` (${String(x[valName])})` : '');

        x.domain(data.map((d) => formatKey(d)));
        y.domain([0, d3.max(data, (d: any) => d[valName])]);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => String(x(String(formatKey(d)))))
            .attr("width", x.bandwidth())
            .attr("y", (d) => y(d[valName]))
            .attr("height", (d) => height - y(d[valName]));

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g").call(d3.axisLeft(y));
    }
};

const api = async (route: string, params?: keyable) => {
    const response = await fetch(`/api/${route}?` + new URLSearchParams(params).toString());
    if (response.status === 200) {
        return await response.json();
    } else {
        console.log("fetching error");
    }
}

export default {
    version: project?.version,
    git,
    geofeatures,
    api,
    state,
    renderBar,
};
