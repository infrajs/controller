import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'


//Для onlyclient
let counter = localStorage.getItem('infra_counter')||0
localStorage.setItem('infra_counter', ++counter)

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
DOM.done('load', () => {
	Crumb.setA(document);
	let cls = cls => document.getElementsByClassName(cls)
	//Для элементов с классом a или btn, но не для ссылок
	for (let a of cls('a')) {
		if (ws.has(a)) continue
		if (!a.dataset.crumb) continue
		if (a.tagName == 'A') continue
		ws.add(a)
		a.addEventListener('click', async () => {
			Crumb.go(a.dataset.crumb)
		})
	}
	for (let a of cls('btn')) {
		if (ws.has(a)) continue
		if (!a.dataset.crumb) continue
		if (a.tagName == 'A') continue
		ws.add(a)
		a.addEventListener('click', async () => {
			Crumb.go(a.dataset.crumb)
		})
	}
})







