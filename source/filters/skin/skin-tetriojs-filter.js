createRewriteFilter("UHD Forcer", "https://tetr.io/js/tetrio.js*", {
  enabledFor: async (storage, request) => {
    let res = await storage.get(['skin', 'ghost']);
    return res.skin || res.ghost;
  },
  onStop: async (storage, url, src, callback) => {
    let newSrc = src.replace(/["']uhd["']\s*:\s*["']hd["']/, "'uhd':'uhd'")
    if (newSrc == src) console.warn('UHD Disabler hook broke (1/1)');
    callback({ type: 'text/javascript', data: newSrc, encoding: 'text' });
  }
});

createRewriteFilter("Advanced skin loader", "https://tetr.io/js/tetrio.js*", {
  enabledFor: async (storage, request) => {
    let res = await storage.get([
      'advancedSkinLoading',
      'skinAnimMeta',
      'ghostAnimMeta'
    ]);
    return res.advancedSkinLoading && (res.skinAnimMeta || res.ghostAnimMeta);
  },
  onStop: async (storage, url, src, callback) => {
    try {
      const res = await storage.get(['skinAnimMeta', 'ghostAnimMeta']);

      // Load animated 2x spritesheet
      src = src.replace(
        /(\/res\/skins\/(minos|ghost)\/connected.2x.png)/g,
        "$1?animated"
      );

      // Set up animated textures
      var rgx = /(\w+\((\w+),\s*(\w+),\s*(\w+),\s*(\w+),\s*(\w+),\s*(\w+)\)\s*{[\S\s]{0,200}Object\.keys\(\3\)\.forEach\(\w\s*=>\s*{)([\S\s]+?)}/
      var match = false;
      src = src.replace(rgx, ($, pre, a1, a2, a3, a4, a5, a6, loopBody) => {
        var rgx2 = /(\w+\[\w+\])\s*=\s*new\s*PIXI\.Texture\((\w+),\s*new\s*PIXI.Rectangle\(([^,]+),([^,]+),([^,]+),([^,]+)\)\)/;
        let res = rgx2.exec(loopBody);
        if (!res) return;
        let [$2, target, baseTexArg, rectArg1, rectArg2, rectArg3, rectArg4] = res;
        loopBody = (`
          let first = new PIXI.Texture(
            ${baseTexArg},
            new PIXI.Rectangle(${rectArg1}, ${rectArg2}, ${rectArg3}, ${rectArg4})
          );

          let ghost = (
            ${baseTexArg}?.resource?.url &&
            ${baseTexArg}.resource.url.indexOf('ghost') !== -1
          );
          let scale = ghost ? 1024 : 2048;

          first.tetrioPlusAnimatedArray = [];
          for (let _i = 0; _i < Math.max(${baseTexArg}.height / scale, 1); _i++) {
            first.tetrioPlusIsGhost = ghost;
            first.tetrioPlusAnimatedArray.push(new PIXI.Texture(
              ${baseTexArg},
              new PIXI.Rectangle(${rectArg1}, ${rectArg2} + _i * scale, ${rectArg3}, ${rectArg4})
            ));
          }

          ${target} = first;
        `);
        match = true;
        return pre + loopBody + '}';
      });
      if (!match) {
        console.warn('Advanced skin loader hooks broke (1/?)');
        return;
      }

      // Replace sprites with animated sprites
      var rgx = /(wang24[\S\s]{0,50}(.)\s*=\s*\w+\.assets\[.+?\].textures[\S\s]{0,50})new PIXI.Sprite\(\2\)/g;
      var match = 0;
      src = src.replace(rgx, ($, pre, texVar) => {
        match += 1;
        return pre + (`
          (() => {
            let { frames, delay } = ${b64Recode(res.skinAnimMeta || {})};
            let { frames: gframes, delay: gdelay } = ${b64Recode(res.ghostAnimMeta || {})};

            let sprite = new PIXI.AnimatedSprite(${texVar}.tetrioPlusAnimatedArray);
            sprite.animationSpeed = 1/delay;

            if (${texVar}.tetrioPlusIsGhost) {
              frames = gframes;
              delay = gdelay;
              console.log(gframes, gdelay);
            }

            let target = () => ~~(((PIXI.Ticker.shared.lastTime/1000) * 60 / delay) % frames);
            sprite.gotoAndStop(target());
            let int = setInterval(() => {
              sprite.gotoAndStop(target());
              if (!sprite.parent || !sprite.parent.parent)
                clearInterval(int);
            }, 16);
            return sprite;
          })()
        `);
      });
      if (match != 2) {
        console.warn('Advanced skin loader hooks broke (2/?)');
        return;
      }

    } finally {
      callback({
        type: 'text/javascript',
        data: src,
        encoding: 'text'
      });
    }
  }
})
