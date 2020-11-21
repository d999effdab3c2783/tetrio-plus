import { OfflineAudioContext } from 'web-audio-engine';
import fetch, { Response } from 'node-fetch';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { Canvas, Image } from 'canvas';
import './decoders.js';
import { Blob, FileReader } from 'vblob';

global.self = global;
require('../source/lib/OggVorbisEncoder.js');

// Web API polyfills
Object.assign(global, {
  Blob,
  FileReader,
  OggVorbisEncoder,
  OfflineAudioContext,
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
    return await fetch(url);
  },
  browser: {
    extension: {
      getURL(relpath) {
        return fs.createReadStream(path.join(__dirname, '..', relpath));
      }
    }
  }
});
