
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { DOM } from '../../akiyatkin/load/DOM.js'

let next = false
Crumb.hand('change', async () => {
	if (next) {
		await DOM.emit('check')
	}
	next = true
})


Event.handler('Controller.onshow', async () => {
	//Изменился слой на этой же странице? ИЛи дубли при взаимозависимостях
	await DOM.emit('load')
}, 'crumb');

//Подписаться один раз и отложить
DOM.once('check', async () => {
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







