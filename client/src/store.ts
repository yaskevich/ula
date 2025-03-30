import { feature as topofeature } from 'topojson-client';
import project from '../package.json';
import topos from '../../data/poland.json';

const geofeatures = (<any>topofeature((topos as any), (topos.objects.woj as any))).features;
const git = project?.repository?.url ? 'https' + project.repository.url.slice(3, -4) : '';

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
};
