import { feature as topofeature } from 'topojson-client';
import project from '../package.json';
import topos from '../../data/poland.json';
import freq from '../../data/freq.json';

const geofeatures = (<any>topofeature((topos as any), (topos.objects.woj as any))).features;
const git = project?.repository?.url ? 'https' + project.repository.url.slice(3, -4) : '';

export default {
    version: project?.version,
    git,
    freq,
    geofeatures,
};
