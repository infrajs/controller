import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { DOM } from '../../akiyatkin/load/DOM.js'

let next = false
Event.handler('Crumb.onchange', () => {
	if (next) Controller.check()
	next = true
}, 'Controller')

Event.handler('Controller.onshow', function () {
	DOM.ok('load')
}, 'crumb');


Controller.hand('init', async () => {
	await import('/-collect/js')
	await import('./init.js')
})
DOM.done('load', href => {
	Crumb.setA(document);
})