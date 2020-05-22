<script type="module">
    import { View } from '/vendor/infrajs/view/View.js'
    import { Tpl } from '/vendor/infrajs/controller/src/Tpl.js'
    
    DOM.once('load', async () => {
        await Tpl.getHtml({
            tpl:{~json(tpl)},
            data:{~json(data)},
            div:{~json(div)},
            tplroot:{~json(tplroot)},
            dataroot:{~json(dataroot)},
            id:{~json(id)},
            counter:{~json(counter)},
            json:{~json(json)},
            config:{~json(config)}
        }).then( async html => {
            await View.html(html, "{div}")
        })
    })
    
</script>