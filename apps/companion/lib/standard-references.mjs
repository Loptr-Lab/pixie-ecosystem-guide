import {retrieval} from './story-discovery.mjs';
import * as workModule from '../public/shared/published-work.js';
import * as standardModule from '../public/shared/standard-references.js';
const work=globalThis.MADE_SICK_WORK||workModule.default;
export const standard=globalThis.STANDARD_REFERENCES||standardModule.default;
export const createStandardReader=options=>standard.createReader({...options,retrieval,work});
