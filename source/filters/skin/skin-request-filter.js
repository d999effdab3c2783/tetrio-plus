[
  { skin: 'minos', key: 'skin', name: 'Custom skin', query: '' },
  { skin: 'ghost', key: 'ghost', name: 'Custom skin (ghost)', query: '' },
  { skin: 'minos', key: 'skinAnim', name: 'Animated skin', query: '?animated' },
  { skin: 'ghost', key: 'ghostAnim', name: 'Animated skin (ghost)', query: '?animated' },
].forEach(({ skin, key, name, query }) => {
  createRewriteFilter(name, `https://tetr.io/res/skins/${skin}/connected.2x.png${query}`, {
    enabledFor: async (storage, url) => {
      return !!(await storage.get(key))[key];
    },
    onStop: async (storage, url, src, callback) => {
      callback({
        type: 'image/png',
        data: (await storage.get(key))[key],
        encoding: 'base64-data-url'
      });
    }
  });
});
