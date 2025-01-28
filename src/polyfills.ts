(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: [],
};
(window as any).Buffer = window.Buffer || require('buffer').Buffer;
