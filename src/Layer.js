import { Fire } from '/vendor/akiyatkin/load/Fire.js'

let Layer = {
	tikon: (...params) => Fire.tikon(Layer, ...params),
	on: (...params) => Fire.on(Layer, ...params),
    hand: (...params) => Fire.hand(Layer, ...params),
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
window.Layer = Layer
export {Layer}