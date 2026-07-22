export * from '@pennyspring/data'
import { createLocalApi } from '@pennyspring/data-rn';

export const localApi = createLocalApi();

export { createRemoteApi } from './remote';
