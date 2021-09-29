export const name = 'TETR.IO v6.1.0 connected ghost animated';
export const desc = 'A complex 512x512 gif or multiple images with 48px by 48px blocks (see wiki)';
export const extrainputs = [];

import { KEYS, Validator } from './util.js';
export function test(files) {
  if (files.length == 1 && files[0].type != 'image/gif')
    return false;

  return files.every(file => {
    return new Validator(file)
      .filename(KEYS.CONNECTED_GHOST)
      .dimension(512, 512)
      .isAllowed();
  });
}

import splitgif from './converters/splitgif.js';
import { load as loadconnghostraster } from './tetrio-6.1-connected-ghost.js';
export async function load(files, storage, options) {
  if (files.length == 1 && files[0].type == 'image/gif')
    files = await splitgif(files[0], options);

  let canvas = window.document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024 * files.length;
  let ctx = canvas.getContext('2d');

  for (let i = 0; i < files.length; i++)
    ctx.drawImage(files[i].image, 0, i * 1024, 1024, 1024);

  await loadconnghostraster([files[0]], storage); // non-animated fallback
  await storage.set({
    ghostAnim: canvas.toDataURL('image/png'),
    ghostAnimMeta: {
      frames: files.length,
      frameWidth: 2048,
      frameHeight: 2048,
      delay: options.delay || 30
    }
  });
}
