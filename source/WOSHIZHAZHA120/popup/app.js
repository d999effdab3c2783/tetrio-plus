const app = Vue.createApp({
    template: `<n-config-provider :theme="theme" :locale="locale" :date-locale="date_locale" inline-theme-disabled :hljs="hljs">
    <n-dialog-provider>
        <n-loading-bar-provider>
            <n-message-provider>
                <n-modal-provider>
                    <n-notification-provider>
                        <n-layout position="absolute">
                            <n-layout-content class="container">
                                <n-h1 prefix="bar">TETR.IO PLUS (WOSHIZHAZHA120's Customize)</n-h1>

                                <n-list bordered class="plugins">
                                    <n-list-item v-for="(plugin, index) in plugins" :key="plugin.id">
                                        <n-thing>
                                            <template #header>
                                                <n-text>{{ plugin.name }}</n-text>
                                                <n-text class="plugin_information_divider" :depth="3">By</n-text>
                                                <n-text>{{ plugin.author }}</n-text>
                                                <n-text class="plugin_information_divider" :depth="3">@</n-text>
                                                <n-text> {{ plugin.version }}</n-text>
                                            </template>

                                            <template #description>{{ plugin.description }}</template>

                                            <n-switch v-model:value="plugin.state"></n-switch>
                                        </n-thing>

                                        <n-drawer placement="left" v-model:show="plugin.show_code" width="50%">
                                            <n-drawer-content title="代码">
                                                <n-flex vertical size="small">
                                                    <n-card class="plugin_code" size="small" title="样式" v-if="!!plugin.style">
                                                        <n-code :code="plugin.style" language="CSS" show-line-numbers/>
                                                    </n-card>

                                                    <n-card class="plugin_code" size="small" title="脚本" v-if="!!plugin.script">
                                                        <n-code :code="plugin.script" language="JavaScript" show-line-numbers/>
                                                    </n-card>
                                                </n-flex>
                                            </n-drawer-content>
                                        </n-drawer>

                                        <template #suffix>
                                            <n-button @click.stop="plugin.show_code = true">检查代码</n-button>
                                        </template>
                                    </n-list-item>
                                </n-list>
                            </n-layout-content>
                        </n-layout>
                    </n-notification-provider>
                </n-modal-provider>
            </n-message-provider>
        </n-loading-bar-provider>
    </n-dialog-provider>
</n-config-provider>
`,
    setup() {
        const $osTheme = naive.useOsTheme()

        return {
            theme: Vue.computed(() => {
                switch ($osTheme.value) {
                    case 'light':
                        return naive.lightTheme
                    case 'dark':
                        return naive.darkTheme
                    default:
                        return 'auto'
                }
            }),
            locale: naive.zhCN,
            date_locale: naive.zhCN,
            hljs,

            plugins: (() => {
                const get_state = storage_key => {
                    const state = Vue.ref(false)

                    browser.storage.local.get(storage_key)
                        .then(result => {
                            state.value = result[storage_key] ?? false
                        })

                    Vue.watch(state, async newState => {
                        await browser.storage.local.set({
                            [storage_key]: newState
                        })
                    })

                    return state
                }

                const format_code = (input, parser) => {
                    const formatted = Vue.ref()

                    if (!!!input) {
                        return formatted
                    }

                    prettier.format(input, {
                        parser,
                        plugins: prettierPlugins
                    }).then(result => {
                        formatted.value = result
                    })

                    return formatted
                }

                return plugins.map(plugin => {
                    plugin.state = get_state(
                        generate_plugin_state_storage_key(plugin.id)
                    )

                    plugin.show_code = Vue.ref(false)
                    plugin.style = format_code(plugin.style, 'css')
                    plugin.script = format_code(plugin.script, 'babel')

                    return Vue.reactive(plugin)
                })
            })()
        }
    }
})

app.use(naive)
app.mount('#app')