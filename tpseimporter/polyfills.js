import { OfflineAudioContext } from 'web-audio-engine';
import fetch, { Response } from 'node-fetch';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { Canvas, Image } from 'canvas';
import { Blob, FileReader } from 'vblob';
import ffmpeg from 'fluent-ffmpeg';
import { ReadableStreamBuffer, WritableStreamBuffer } from 'stream-buffers';

global.self = global;
global.OggVorbisEncoderConfig = { TOTAL_MEMORY: 64 * 1024**2 };
global.print = console.error;
let ove_path = path.join(__dirname, '../source/lib/OggVorbisEncoder.js');
let ove = fs.readFileSync(ove_path);
new Function(ove)();


// Web API polyfills
Object.assign(global, {
  Blob,
  window: {
    // Not actually polyfills but used to feature-detect & polyfill other stuff
    IS_NODEJS_POLYFILLED: true,
    ffmpeg,
    ReadableStreamBuffer,
    WritableStreamBuffer,

    Blob,
    FileReader,
    OggVorbisEncoder,
    OfflineAudioContext,
    // OfflineAudioContext: function(...args) {
    //   let ctx = new OfflineAudioContext(...args);
    //   ctx.decodeAudioData = buf => decode(buf);
    //   return ctx;
    // },
    Image,
    document: {
      createElement(el) {
        if (el != 'canvas') throw new Error('Not supported');
        return new Canvas();
      }
    },
    async fetch(url) {
      if (url instanceof Readable)
        return new Response(url);

      let dataUrl = /^data:.+\/(.+);base64,(.*)$/;
      if (dataUrl.test(url)) {
        let [_1,_2,data] = /^data:.+\/(.+);base64,(.*)$/.exec(url);
        let buffer = Buffer.from(data, 'base64');
        return { // mock response
          async text() { return buffer.toString(); },
          async arrayBuffer() { return buffer; }
        }
      }

      return await fetch(url);
    }
  },
  browser: {
    extension: {
      getURL(relpath) {
        return fs.createReadStream(path.join(__dirname, '..', relpath));
      }
    }
  }
});
window.GIFGroover = require('./lib/GIFGroover.js').default;
