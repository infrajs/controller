import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { External } from '/vendor/infrajs/controller/src/External.js'
import { Event } from '/vendor/infrajs/event/Event.js'

let Layer = { ...Fire, 
	pop: function (layer, prop) {
		var parent = layer;
		while (parent) {
			if (typeof(parent[prop]) !== 'undefined') return parent[prop];
			if (!parent['parent']) break;
			parent = parent['parent'];
		}
	},
	run (layers, callback) {
		if (!layers) return
		let r
		for (let layer of [layers].flat()) {
			r = callback(layer)
			if (r != null) return r
			r = Layer.run(layer.layers, callback)
			if (r != null) return r

			r = Layer.run(layer.child, callback)
			if (r != null) return r
			if (layer.divs) {
				for (let i in layer.divs) {
					r = Layer.run(layer.divs[i], callback)
					if (r != null) return r
				}
			}
			if (layer.childs) {
				for (let i in layer.childs) {
					r = Layer.run(layer.childs[i], callback)
					if (r != null) return r
				}
			}
			r = Layer.run(layer.systemlayers, callback)
			if (r != null) return r
		}
	},
	async get (id) {
		let layers = (await import('/-controller/')).default
		return Layer.run(layers, layer => {
			if (layer.id == id) return layer
		})
	},
	async getById (id) {
		let layers = (await import('/-controller/')).default
		return Layer.run(layers, layer => {
			if (layer.id == id) return layer
		})
	},
	async getByName (name) {
		let layers = (await import('/-controller/')).default
		return Layer.run(layers, layer => {
			if (layer.name == name) return layer
		})
	},
	isParent: function (layer, parent) {
		while (layer) {
			if (parent === layer) return true;
			layer = layer.parent;
		}
		return false;
	}
}

Event.classes['Layer'] = function (layer) {
	External.check(layer);
	External.unickCheck(layer);
	return layer.id;
}

window.Layer = Layer
export { Layer }