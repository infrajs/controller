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
export {Layer}