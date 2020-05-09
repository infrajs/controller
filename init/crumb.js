import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'
import { Event } from '/vendor/infrajs/event/Event.js'
Crumb.init();


DOM().then(async () => {
    let ws = new WeakSet() 
    Event.handler('Controller.onshow', () => {
        let cls = cls => document.getElementsByClassName(cls)
        for (let a of cls('crumbgo')) {
            if (ws.has(a)) continue
            ws.add(a)
            a.addEventListener('click', () => {
                if (!a.dataset.go) return;
                Crumb.go(a.dataset.go);
            })
        }
    })
})