import '../../shared/drop-handler.js';
import /* non es6 */ '../../shared/migrate.js';

let match = /install=([^=]+)/.exec(new URL(window.location).search);
if (match) {
  console.log(match);
  let url = decodeURIComponent(match[1]);

  for (let el of document.querySelectorAll("fieldset:not(#url-importer)"))
    el.style.display = 'none';

  let a = document.getElementById('url-anchor');
  a.href = url;
  a.innerText = url;

  document.getElementById('url-importer').style.display = 'block';
  document.getElementById('import-from-url').addEventListener('click', async () => {
    console.log('Installing ' + url);
    let status = document.createElement('div');
    status.innerText = 'working on import...';
    document.body.appendChild(status);

    try {
      let data = await (await fetch(url)).json();
      alert(await sanitizeAndLoadTPSE(data, browser.storage.local));
    } catch(ex) {
      alert("Failed to load content pack! See the console for more details");
      console.error("Failed to load content pack: ", ex);
      console.error(
        "If your content pack is more than a few hundred megabytes, the " +
        "parser may be running out of memory."
      );
    } finally {
      status.remove();
    }
  });
}

document.getElementById('import').addEventListener('change', async evt => {
  let status = document.createElement('div');
  status.innerText = 'working on import...';
  document.body.appendChild(status);

  try {
    let data = null;
    if (evt.target.files[0].name.endsWith('tpsez')) {
      status.innerText = 'working on import: load tpsez...';
      let zip = await JSZip.loadAsync(evt.target.files[0]);
      data = {};
      for (let [key, file] of Object.entries(zip.files)) {
        data[key] = JSON.parse(await file.async('string'))
      }
    } else {
      status.innerText = 'working on import: load tpse...';
      let reader = new FileReader();
      reader.readAsText(evt.target.files[0], "UTF-8");
      reader.onerror = () => alert("Failed to load content pack");
      await new Promise(res => reader.onload = res);
      data = JSON.parse(reader.result);
    }

    status.innerText = 'working on import: apply settings...';
    alert(await sanitizeAndLoadTPSE(data, browser.storage.local));
  } catch(ex) {
    alert("Failed to load content pack! See the console for more details");
    console.error("Failed to load content pack: ", ex);
    console.error(
      "If your content pack is more than a few hundred megabytes, the " +
      "parser may be running out of memory."
    );
  } finally {
    // reset the handler
    evt.target.type = '';
    evt.target.type = 'file';
    status.remove();
  }
});

async function exportKeys(entryCallback) {
  let presentKeys = new Set();
  async function exportKey(key) {
    let value = await browser.storage.local.get(key);
    if (!value[key]) return false;
    entryCallback(key, value[key]);
    presentKeys.add(key);
    return true;
  }

  if (!await exportKey('version'))
    throw new Error("Attempted to export, but missing key 'version'?");

  let elems = document.getElementsByClassName('export-toggle');
  for (let elem of elems) {
    if (elem.checked) {
      for (let key of elem.getAttribute('data-export').split(',')) {
        await exportKey(key);
      }
    }
  }

  if (presentKeys.has('animatedBackground')) {
    let { animatedBackground } = await browser.storage.local.get('animatedBackground');
    let key = 'background-' + animatedBackground.id;
    await exportKey(key);
  }

  if (presentKeys.has('backgrounds')) {
    let { backgrounds } = await browser.storage.local.get('backgrounds');
    let bgIds = backgrounds.map(({ id }) => 'background-' + id);
    for (let id of bgIds) await exportKey(id);
  }

  if (presentKeys.has('music')) {
    let { music } = await browser.storage.local.get('music');
    let musicIds = music.map(({ id }) => 'song-' + id);
    for (let id of musicIds) await exportKey(id);
  }
}

function offerDownload(filename, blob) {
    console.log("Offering download...");

    // https://stackoverflow.com/questions/3665115/18197341#18197341
    let a = document.createElement('a');
    let url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

document.getElementById('export').addEventListener('click', async evt => {
  let status = document.createElement('div');
  status.innerText = 'working on export...';
  document.body.appendChild(status);
  try {
    let config = {};
    await exportKeys((key, value) => config[key] = value);

    console.log("Encoding data...");
    let json = JSON.stringify(config, null, 2);
    let blob = new Blob([json], { type: 'application/json' });

    offerDownload('tetrio-plus-settings-export.tpse', blob);
    status.remove();
  } catch(ex) {
    alert(ex.toString());
    console.error(ex);
    status.remove();
  }
});

document.getElementById('export-zip').addEventListener('click', async evt => {
  let status = document.createElement('div');
  status.innerText = 'working on export...';
  document.body.appendChild(status);
  try {
    let zip = new JSZip();
    let config = {};
    await exportKeys((key, value) => {
      status.innerText = `working on export: key '${key}'...`;
      zip.file(key, JSON.stringify(value));
    });

    status.innerText = `working on export: generating zip (may take a while)...`;
    let zipstart = Date.now();
    let blob = await zip.generateAsync({
      type: "blob",
      // compression: "DEFLATE",
      // compressionOptions: { level: 1 }
    });
    console.log(`Zipping took ${Date.now() - zipstart}ms`);

    status.innerText = `working on export: offering download...`;
    offerDownload('tetrio-plus-settings-export.tpsez', blob);
    status.remove();
  } catch(ex) {
    alert(ex.toString());
    console.error(ex);
    status.remove();
  }
});

document.getElementById('clearData').addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all your TETR.IO PLUS data?')) {
    await browser.storage.local.clear();
    await migrate(browser.storage.local);
    await browser.storage.local.set({
      version: browser.runtime.getManifest().version
    });
    alert('Data cleared');
  }
});

const sampleRate = 44100;
const channels = 2;
const quality = 1.0;
document.getElementById('decompileSfx').addEventListener('click', async () => {
  let { customSoundAtlas, customSounds } = await browser.storage.local.get([
    'customSoundAtlas', 'customSounds'
  ]);
  if (!customSoundAtlas || !customSounds) {
    alert('No custom sfx configured.');
    return;
  }
  let status = document.createElement('div');
  status.innerText = 'working on export...';
  document.body.appendChild(status);


  const soundBuffer = await new window.OfflineAudioContext(
    channels,
    sampleRate,
    sampleRate
  ).decodeAudioData(await (await fetch(customSounds)).arrayBuffer());

  let zip = new JSZip();
  for (let [name, [ offset, duration ]] of Object.entries(customSoundAtlas)) {
    status.innerText = `working on export: ${name}.ogg...`;
    // Convert milliseconds to seconds
    offset /= 1000; duration /= 1000;

    const ctx = new window.OfflineAudioContext(
      channels,
      sampleRate*duration,
      sampleRate
    );

    let source = ctx.createBufferSource();
    source.buffer = soundBuffer;
    source.connect(ctx.destination);
    source.start(0, offset, duration);
    let slicedBuffer = await ctx.startRendering();

    let encoder = new window.OggVorbisEncoder(sampleRate, channels, quality);
    encoder.encode([
      slicedBuffer.getChannelData(0),
      slicedBuffer.getChannelData(1)
    ]);
    let blob = encoder.finish();
    zip.file(name + '.ogg', blob);
  }

  status.innerText = `working on export: generating zipfile...`;
  let blob = await zip.generateAsync({ type: 'blob' });

  let a = document.createElement('a');
  a.setAttribute('href', URL.createObjectURL(blob));
  a.setAttribute('download', 'tetrio-plus-sfx-export.zip');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  status.remove();
});
