'use strict';

import BevelView from "./bevel_view.js"

export default class HeaderView {
    bevelView

    constructor() {
        this.bevelView = new BevelView()

        const content = window.document.createElement("div")
        const title = window.document.createElement("h1")
        title.innerHTML = "Hello Portfolio!"
        content.appendChild(title)

        this.bevelView.setContentElement(content)
    }

    getElement() {
        return this.bevelView.getElement()
    }

    show() {
        const showContent = new Promise((resolve, _) => {
            window.setTimeout(() => {
                this.bevelView.showContent(true).then(() => {
                    resolve()
                })
            }, 700)
        })
        return Promise.all([this.bevelView.bevel(true), showContent])
    }

    hide() {
        return Promise.all([this.bevelView.bevel(false), this.bevelView.showContent(false)])
    }
}
