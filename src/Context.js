class Context {
    //Element.closest('html')
    constructor(div) {
        this.div = document.getElementById(div)
        this.child = this.div.firstElementChild
    }
    is() {
        return this.child.closest('html')
    }
}
export {Context}