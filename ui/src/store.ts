import { reactive } from 'vue';
import project from '../package.json';
import freq from '../../data/freq.json';

import { feature as topofeature } from 'topojson-client';

const git = project?.repository?.url ? 'https' + project.repository.url.slice(3, -4) : '';

export default {
    version: project?.version,
    git,
    freq,
};
