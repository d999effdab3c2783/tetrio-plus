const html = arg => arg.join(''); // NOOP, for editor integration.

const music = [];
const backgrounds = [];
browser.storage.local.get([ 'music', 'backgrounds' ]).then(res => {
  if (res.backgrounds) backgrounds.push(...res.backgrounds);
  if (res.music) music.push(...res.music);
});

export default {
  template: html`
    <div class="section" v-if="node.type != 'root'">
      Select background:
      <select class="node-audio-selector" v-model="node.background">
        <option :value="null">None</option>
        <option :value="bg.id" v-for="bg of backgrounds">
          {{ bg.filename }} (ID: {{ bg.id }})
        </option>
      </select>
      <div v-if="backgrounds.length == 0">
        (Add backgrounds in the main TETR.IO PLUS menu)
      </div>

      Select audio:
      <select class="node-audio-selector" v-model="node.audio">
        <option :value="null">None</option>
        <option v-for="song of music" :value="song.id">
          {{ song.filename }} (ID: {{ song.id }})
        </option>
      </select>
      <div v-if="music.length == 0">
        (Add music in the main TETR.IO PLUS menu)
      </div>

      <div v-if="node.audio != null">
        <div class="form-control">
          Volume <input
            type="range"
            v-model.number="node.effects.volume"
            step="0.01"
            min="0"
            max="1"
          />
          <span class="form-control-value-display">
            {{(node.effects.volume*100).toFixed(0)}}%
          </span>
        </div>
        <div class="form-control">
          Speed <input
            type="number"
            v-model.number="node.effects.speed"
            step="0.01"
            min="0"
            max="10"
          />x
          <span class="form-control-value-display">
            (affects pitch)
          </span>
        </div>
        <div class="form-control">
          Start position <input
            type="number"
            v-model.number="node.audioStart"
            min="0"
          />s
        </div>
        <div class="form-control">
          End position <input
            type="number"
            v-model.number="node.audioEnd"
            min="0"
          />s
          <span class="form-control-value-display">
            (0 = end of song)
          </span>
        </div>
      </div>
    </div>
  `,
  props: ['node'],
  data: () => ({ music, backgrounds })
}
