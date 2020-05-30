<script type="module">
	import { DOM } from '/vendor/akiyatkin/load/DOM.js'

	
		
	
	setTimeout(async () => {
		let View = (await import('/vendor/infrajs/view/View.js')).View
		let Tpl = (await import('/vendor/infrajs/controller/src/Tpl.js')).Tpl
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
			DOM.emit('load')
		})
	}, 1000)
	
	
</script>