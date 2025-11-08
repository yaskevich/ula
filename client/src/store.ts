import { reactive } from 'vue';
import * as d3 from 'd3';
import { feature as topofeature } from 'topojson-client';
import project from '../package.json';
import topos from '../../data/poland.json';
import type { NDateLocale, NLocale } from 'naive-ui';

const geofeatures = (<any>topofeature((topos as any), (topos.objects.woj as any))).features;
const git = project?.repository?.url ? 'https' + project.repository.url.slice(3, -4) : '';

const state = reactive({
    exp: [] as Array<string>,
    loc: 0,
    locale: <NLocale | null>(null),
    dateLocale: <NDateLocale | null>(null),
});

const dict = {
    pages: {
        "home": ["Home", "Start"],
        "country": ["Country Top", "Kraj"],
        "regions": ["Regional Tops", "Województwa"],
        "groups": ["Groups", "Grupy"],
        "list": ["Full list", "Pełna lista"],
        "structure": ["Structure", "Struktura"],
        "places": ["Places", "Miejscowości"],
        "lexicon": ["Lexicon", "Słownik"],
    }
} as keyable;

const t = (chapter: string, id: string) => dict?.[chapter]?.[id][Number(state?.loc) || 0];

const renderBar = (id: string, data: [], keyName: string, valName: string, addKey = false, colorsMap?: keyable) => {
    if (data?.length) {
        // console.log(data);
        const margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        const x = d3.scaleBand().range([0, width]).padding(0.1);
        const y = d3.scaleLinear().range([height, 0]);
        const svg = d3.select("#" + id).append("svg");
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
            // .attr("class", "bar")
            .attr('fill', (x: any) => {
                return colorsMap?.[x?.key] ? colorsMap[x.key] : 'steelblue';
            })
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
};

const save = async (route: string, params: keyable) => {
    const response = await fetch(`/api/${route}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json', // this needs to be defined
        },
        body: JSON.stringify(params),
    });
    if (response.status === 200) {
        const data = await response.json();
        // console.log('result', data);
        return data;
    } else {
        console.log('fetching error');
    }
};

const toTree = (arr: any) => {
    const obj = Object.create(null);
    arr.forEach((x: any) => obj[x.id] = { ...x, });
    const res: any = [];
    arr.forEach((x: any) => {
        x.parent ? (obj[x.parent]?.children ? obj[x.parent].children.push(obj[x.id]) : obj[x.parent].children = [obj[x.id]]) : res.push(obj[x.id])
    });
    return res;
};

export default {
    version: project?.version,
    git,
    geofeatures,
    api,
    save,
    state,
    renderBar,
    toTree,
    t,
};
