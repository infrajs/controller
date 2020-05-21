import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { DOM } from '../../akiyatkin/load/DOM.js'


let next = false
Event.handler('Crumb.onchange', () => {
	if (next) {
		Controller.check()
	}
	next = true
}, 'Controller')


Event.handler('Controller.onshow', async () => {
	//Изменился слой на этой же странице? ИЛи дубли при взаимозависимостях
	await DOM.emit('load')
}, 'crumb');


/*let first = true
DOM.hand('load', async src => {
	if (!first) await Controller.check()
	first = false
})*/



//Подписаться один раз и отложить
Controller.once('init', async () => {
//DOM.once('check', async () => {
	await import('/-collect/js')
	await import('./init.js') //Подиски которые нужно дождаться
})











let ws = new WeakSet() 
DOM.done('load', href => {
	Crumb.setA(document);
	let cls = cls => document.getElementsByClassName(cls)
	for (let a of cls('a')) {
		if (ws.has(a)) continue
		if (!a.dataset.crumb) continue
		ws.add(a)
		a.addEventListener('click', async () => {
			Crumb.go(a.dataset.crumb)
		})
	}
	for (let a of cls('btn')) {
		if (ws.has(a)) continue
		if (!a.dataset.crumb) continue
		ws.add(a)
		a.addEventListener('click', async () => {
			Crumb.go(a.dataset.crumb)
		})
	}
})







