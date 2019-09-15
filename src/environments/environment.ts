import { api, firebase } from './private';

export const environment = {
  production: false,
  api: api.test,
  firebase: firebase.dev
};
