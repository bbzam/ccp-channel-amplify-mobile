(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  browser: true,
  version: '',
  versions: {},
  nextTick: function (fn: Function) {
    setTimeout(fn, 0);
  },
};

import 'zone.js';
