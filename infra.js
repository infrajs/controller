import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { DOM } from '../../akiyatkin/load/DOM.js'

//import { } from './init.js'



let next = false
Event.handler('Crumb.onchange', () => {
	if (next) Controller.check()
	next = true
}, 'Controller')

Controller.hand('init', async () => {
	await import('/-collect/js')
	await import('./init.js')
})

Event.handler('Controller.onshow', function () {
	DOM.tikok('show')
}, 'crumb');

DOM.race('show', () => {
	Crumb.setA(document);
})