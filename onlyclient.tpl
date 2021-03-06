{root:}
	<script type="module">

		import { DOM } from '/vendor/akiyatkin/load/DOM.js'
		import { Load } from '/vendor/akiyatkin/load/Load.js'

		//Кэшируется динамика
		let counter = localStorage.getItem('infra_counter')||1
		//counter = 1
		if (counter == 1 && {firstvisitempty?:1?:0}) {
			let div = document.getElementById('{div}')
			div.dataset.parsed=''
		} else {
			(async () => {
				let Tpl = (await import('/vendor/infrajs/controller/src/Tpl.js')).Tpl
				let Layer = (await import('/vendor/infrajs/controller/src/Layer.js')).Layer
				let View = (await import('/vendor/infrajs/view/View.js')).View
				
				let div = document.getElementById('{div}')
				let parsed = div.dataset.parsed
				let layerid = div.dataset.layerid
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
					div.dataset.parsed = parsed
					div.dataset.layerid = layerid
					let g = {~json(global)}
					let json = {~json(json)}
					if (g) {
						const { Global } = await import('/vendor/infrajs/layer-global/Global.js')
						const ar = [g].flat(2)
						ar.map(n => {
							if (!n) return
							var g = Global.get(n)
							if (json) g.unloads[json] = true
							g.layers[{id}] = Layer.getById({id})
						})
					}
					//await Load.drop('json',{~json(json)})
					DOM.puff('load')
				})
			})();
		}
	</script>