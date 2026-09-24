import { createFromSource } from 'fumadocs-core/search/server';
import { source } from './source';

export const searchServer = createFromSource(source, {
  language: 'english',
});
