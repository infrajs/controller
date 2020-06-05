<script type="module">
	import { DOM } from '/vendor/akiyatkin/load/DOM.js'
	import { Load } from '/vendor/akiyatkin/load/Load.js'

	import { Tpl } from '/vendor/infrajs/controller/src/Tpl.js'
	import { Layer } from '/vendor/infrajs/controller/src/Layer.js'
	import { View } from '/vendor/infrajs/view/View.js'
	import { Global } from '/vendor/infrajs/layer-global/Global.js'

	//let div = document.getElementById("{div}")
	//let context = div.firstElementChild
	//setTimeout(async () => {
	//	if (!context.closest('html')) return
	//	let View = (await import('/vendor/infrajs/view/View.js')).View
	//	let Tpl = (await import('/vendor/infrajs/controller/src/Tpl.js')).Tpl
		Tpl.getHtml({
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
			
			let g = {~json(global)}
			let json = {~json(json)}
			if (g) [g].flat(2).map(n => {
				if (!n) return
				var g = Global.get(n)
				if (json) g.unloads[json] = true
				g.layers[{id}] = Layer.getById({id})
			})
			
			//await Load.drop('json',{~json(json)})
			DOM.emit('load')
		})
	//}, 5000)
	
</script>