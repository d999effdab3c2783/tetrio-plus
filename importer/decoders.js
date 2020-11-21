import { spawn } from 'child_process';
import { decode } from 'wav-decoder';
import { decoder } from 'web-audio-engine';
import { ReadableStreamBuffer } from 'stream-buffers';

decoder.set('oga', async (arraybuf, opts) => {
  try {
    console.error('Decoding audio of length', arraybuf.byteLength);

    let ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 'wav',
      'pipe:1'
    ]);

    let chunks = [];
    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', data => {
      // for (let line of data.split('\n'))
      //   console.error('[ffmpeg]', line);
    });
    ffmpeg.stdout.on('data', chunk => chunks.push(chunk));

    const input = new ReadableStreamBuffer({
      frequency: 1,
      chunkSize: 16*1024
    });
    input.pipe(ffmpeg.stdin);
    input.put(Buffer.from(arraybuf));
    input.stop();


    await new Promise(res => ffmpeg.on('close', res));
    // BUG: The decoded data is Incredbly Broken™
    // Seems to come out very short and at a sample rate of 3k
    let result = await decode(Buffer.concat(chunks));
    return result;
  } catch(ex) { console.error(ex); }
});
