const html = arg => arg.join('');

let app = new Vue({
  template: html`
    <div>
      <h1>Miscellaneous texture replacer</h1>

      <div>
        <label for="key">Replace:</label>
        <select v-model="key">
          <option :value="null">Select a key...</option>
          <option :value="key" v-for="key of Object.keys(keys)">{{ key }}</option>
        </select>
        with
        <input name="file" ref="file" type="file" accept="image/*" @change="set" :disabled="!key"/>
      </div>

      <div class="preview" v-if="keys[key]">
        <h2>Vanilla</h2>
        <div class="image-container">
          <img :src="keys[key] + '?bypass-tetrio-plus'"  :key="keys[key]" />
        </div>
        <a :href="keys[key] + '?bypass-tetrio-plus'" download>Download</a>
      </div>

      <div class="preview" v-if="keys[key]">
        <h2>Current <button @click="remove" :disabled="!isSet">Remove</button></h2>
        <div class="image-container">
          <img :src="currentSrc" :key="currentSrc" />
        </div>
        <a :href="currentSrc" download>Download</a>
      </div>
    </div>
  `,
  data: {
    keys: {
      board: 'https://tetr.io/res/skins/board/generic/board.png',
      queue: 'https://tetr.io/res/skins/board/generic/queue.png',
      grid: 'https://tetr.io/res/skins/board/generic/grid.png',
      particle_beam: 'https://tetr.io/res/particles/beam.png',
      particle_beams_beam: 'https://tetr.io/res/particles/beams/beam.png',
      particle_bigbox: 'https://tetr.io/res/particles/bigbox.png',
      particle_box: 'https://tetr.io/res/particles/box.png',
      particle_chip: 'https://tetr.io/res/particles/chip.png',
      particle_chirp: 'https://tetr.io/res/particles/chirp.png',
      particle_dust: 'https://tetr.io/res/particles/dust.png',
      particle_fbox: 'https://tetr.io/res/particles/fbox.png',
      particle_fire: 'https://tetr.io/res/particles/fire.png',
      particle_particle: 'https://tetr.io/res/particles/particle.png',
      particle_smoke: 'https://tetr.io/res/particles/smoke.png',
      particle_star: 'https://tetr.io/res/particles/star.png'
    },
    key: 'board',
    cacheBuster: `?cache-buster=${Date.now()}`,
    isSet: false
  },
  async mounted() {
    await this.reload();

  },
  computed: {
    currentSrc() {
      let prefix = window.browser?.electron
        ? 'tetrio-plus://tetrio-plus/'
        : 'https://tetr.io/';
      let path = this.keys[this.key].slice('https://tetr.io/'.length);
      return prefix + path + this.cacheBuster;
    }
  },
  watch: {
    async key() {
      await this.reload();
    }
  },
  methods: {
    async reload() {
      this.isSet = false;
      this.cacheBuster = `?cache-buster=${Date.now()}`;

      if (!this.key) return false;
      let val = await browser.storage.local.get(this.key);
      this.isSet = !!val[this.key];
    },
    async set() {
      let file = this.$refs.file.files[0];
      if (!file) return;

      let reader = new FileReader();
      await new Promise(res => {
        reader.addEventListener('load', res);
        reader.readAsDataURL(file);
      });
      await browser.storage.local.set({ [this.key]: reader.result });

      // reset the handler
      this.$refs.file.type = '';
      this.$refs.file.type = 'file';
      await this.reload();
    },
    async remove() {
      await browser.storage.local.remove(this.key);
      await this.reload();
    }
  }
});
app.$mount('#app');
