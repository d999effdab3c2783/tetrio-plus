createRewriteFilter("Sfx Request", "https://tetr.io/sfx/tetrio.opus.rsd*", {
  enabledFor: async (storage, request) => {
    let {sfxEnabled} = await storage.get('sfxEnabled');
    if (!sfxEnabled) return false; // Custom sfx disabled

    let {customSoundAtlas} = await storage.get('customSoundAtlas');
    if (!customSoundAtlas) return false; // No custom sfx configured

    return true;
  },
  onStart: async (storage, url, src, callback) => {
    let { customSounds, customSoundAtlas, customSoundsCache } = await storage.get(['customSounds', 'customSoundAtlas', 'customSoundsCache']);

    // https://gist.github.com/axetroy/69dd9c7790ea63a0cdc2038b40bcb209

    function hashCode(any) {
      let hash = 0;
      if (
          any === null ||
          any === void 0 ||
          any === '' ||
          any === 0 ||
          any === false
      ) {
        return 0;
      }

      if (any instanceof RegExp) {
        const str =
            any.source +
            any.dotAll +
            any.flags +
            any.global +
            any.ignoreCase +
            any.lastIndex +
            any.multiline +
            any.sticky +
            any.unicode;
        return hashCode(str);
      }

      if (any instanceof Error) {
        return hashCode(any.message + any.stack);
      }

      // Date
      if (any instanceof Date) {
        return hashCode(any.getTime());
      }

      // if a Number
      if (any instanceof Number) {
        return hashCode(any + '');
      }

      // Map
      if (any instanceof Map) {
        hash = hashCode('Map');
        any.forEach((val, key) => {
          obj[key] = value;
          hash += hashCode(key + value);
        });
        return hash;
      }

      // Set
      if (any instanceof Set) {
        hash = hashCode('Set');
        let i = 0;
        any.forEach(value => {
          hash += hashCode(i + value);
          i++;
        });
        return hash;
      }

      // Object or Array, support nest object
      if (any instanceof Object) {
        for (let key in any) {
          if (any.hasOwnProperty(key)) {
            const value = any[key];
            hash += hashCode(key + value);
          }
        }
        return hash;
      }

      // String
      if (typeof any === 'string') {
        let hash = 0;
        const length = any.length;
        if (length === 0) return hash;
        for (let i = 0; i < length; i++) {
          let chr = any.charCodeAt(i);
          hash = (hash << 5) + chr - hash;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      }

      return hash;
    }

    const encode = async buffer => {
      return Buffer.from(buffer).toString('base64')
    }

    const decode = async data => {
      return new Uint8Array( Buffer.from(data, 'base64') )
    }

    if (customSoundsCache) {
      if (customSoundsCache.h1 === hashCode(customSounds) && hashCode(customSoundAtlas) === customSoundsCache.h2) {
        callback({
          type: 'audio/ogg',
          data: await decode(customSoundsCache.binary),
          encoding: 'arraybuffer'
        });

        return;
      } else {
        await storage.remove(['customSoundsCache'])
      }
    }

    // Note: the new audio format introduced in TETR.IO β1.6.2 no longer uses the duration field and instead assumes tight packing,
    // with the duration of each sprite inferred by the distance to the offset of the next sprite.
    // TETR.IO PLUS already does tight packing, so this approach should be fine.

    let atlas = Object.entries(customSoundAtlas).map(([name, [offset, duration]]) => ({ name, offset, duration }));
    atlas.sort((a, b) => {
      if (a.offset < b.offset) return -1;
      if (a.offset > b.offset) return 1;
      return 0;
    });

    let temp_buffer = new ArrayBuffer(4);
    let view = new DataView(temp_buffer);

    let header_buffer = [];
    header_buffer.push(0x74, 0x52, 0x53, 0x44); // header
    view.setUint32(0, 1, true); // major
    header_buffer.push(...new Uint8Array(temp_buffer));
    view.setUint32(0, 0, true); // minor
    header_buffer.push(...new Uint8Array(temp_buffer));
    for (let { name, offset, duration } of atlas) {
      let name_buffer = new TextEncoder().encode(name);

      // atlas values are in milliseconds, but tetrio changed to using seconds with its new format
      view.setFloat32(0, offset/1000, true);
      header_buffer.push(...new Uint8Array(temp_buffer));

      view.setUint32(0, name_buffer.length, true);
      header_buffer.push(...new Uint8Array(temp_buffer));

      header_buffer.push(...name_buffer);
    }

    let last_sprite = atlas[atlas.length-1];
    view.setFloat32(0, (last_sprite.offset + last_sprite.duration)/1000, true);
    header_buffer.push(...new Uint8Array(temp_buffer));
    header_buffer.push(0, 0, 0, 0); // name length of last sprite

    let audio_buffer = convertDataURIToBinary(customSounds);
    view.setUint32(0, audio_buffer.byteLength, true);
    header_buffer.push(...new Uint8Array(temp_buffer));

    let final_buffer = new Uint8Array(header_buffer.length + audio_buffer.length);
    final_buffer.set(header_buffer, 0);
    final_buffer.set(audio_buffer, header_buffer.length);

    await storage.set({
      customSoundsCache: {
        h1: hashCode(customSounds),
        h2: hashCode(customSoundAtlas),
        binary: await encode(final_buffer)
      }
    })

    callback({
      type: 'audio/ogg',
      data: final_buffer,
      encoding: 'arraybuffer'
    });
  }
});


// https://gist.github.com/borismus/1032746
var BASE64_MARKER = ';base64,';
function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
