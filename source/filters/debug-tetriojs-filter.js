createRewriteFilter("Break the game hooks", "https://tetr.io/js/tetrio.js*", {
  enabledFor: async (storage, request) => {
    let res = await storage.get('debugBreakTheGame');
    return res.debugBreakTheGame;
  },
  onStart: async (storage, url, src, callback) => {
    callback({
      type: 'text/javascript',
      data: `console.log("` +
        `TETRIO PLUS> ` +
        `The game is intentionally broken. ` +
        `Turn off the 'Break the game' option.` +
      `")`,
      encoding: 'text'
    });
  }
})

/*createRewriteFilter("temporary debug hooks", "https://tetr.io/js/tetrio.js*", {
  enabledFor: async (storage, request) => {
    return true;
  },
  onStop: async (storage, url, src, callback) => {
    let patched = false;
    let reg1 = /`xHW.+?\)}`/g;
    src = src.replace(reg1, (match) => {
      patched = true;
      return `{ toString() { console.trace("xHW read"); debugger; return ${match}; } }`;
    });
    if (!patched) console.log('temporary debug broke');

    callback({
      type: 'text/javascript',
      data: src,
      encoding: 'text'
    });
  }
})*/
