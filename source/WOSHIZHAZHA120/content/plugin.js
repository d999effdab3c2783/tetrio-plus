const plugin_storage_prefix = 'WOSHIZHAZHA120_Customize-plugins'

const generate_plugin_state_storage_key = id => {
    return `${plugin_storage_prefix}-${id}-state`
}

const plugins = [
    {
        id: 'font_size_12px',
        name: '缩小字号',
        author: '渣渣120',
        version: '1.0.0',
        description: '将字号变小, 游戏页面也会变小',

        style: `
            :root {
                font-size: 12px;
            }
        `
    },
    {
        id: 'performancemeter_opacity_10',
        name: '降低性能指示器透明度',
        author: '渣渣120',
        version: '1.0.0',
        description: '在某些情况下, 当性能指示器打开时, 游戏帧数会比不打开时稳定, 原因不明',

        style: `
            #performancemeter {
                opacity: 0.1;
            }
        `
    },
    {
        id: 'sensitive_flag_replace',
        name: '敏感旗帜替换',
        author: '渣渣120',
        version: '1.0.0',
        description: '将台湾旗帜替换为中国旗帜',

        style: `
            .flag[title=Taiwan] {
                content: url(/res/flags/cn.png);
            }
        `
    },
    {
        id: 'chinese_translate',
        name: '中文翻译',
        author: '幻灭',
        version: '1.1.0',
        description: '汉化游戏',

        script: `
            const script = document.createElement('script')
            script.setAttribute('src', 'https://gitee.com/huanmes/iotranslate/releases/download/iotranv1.0/iotranslate.user.js')
            document.head.appendChild(script)
        `
    }
]

;(async () => {
    if (window.location.pathname != '/') return;
    let storage = await getDataSourceForDomain(window.location);

    const result = await storage.get([
        'tetrioPlusEnabled', ...plugins.map(plugin => {
            return generate_plugin_state_storage_key(plugin.id)
        })
    ])

    if (!result.tetrioPlusEnabled) {
        return
    }

    for (const plugin of plugins) {
        const storage_key = generate_plugin_state_storage_key(plugin.id)

        if (!result[storage_key]) {
            continue
        }

        if (plugin.style) {
            const style = document.createElement('style')
            style.innerHTML = plugin.style
            document.head.appendChild(style)
        }

        if (plugin.script) {
            const script = document.createElement('script')
            script.innerHTML = plugin.script
            document.head.appendChild(script)
        }
    }
})()