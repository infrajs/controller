class Context {
    constructor(div) {
        this.div = document.getElementById(div)
        this.child = this.div.firstElementChild
    }
    is() {
        let el = this.child
        if (!el) return
        do if (el.tagName == 'HTML') return true
        while (el = el.parentElement)
    }
}
export {Context}