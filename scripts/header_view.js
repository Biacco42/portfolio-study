'use strict';

import BevelView from "./bevel_view.js"
import ToggleListView from "./toggle_list_view.js"

export default class HeaderView {
    bevelView
    authorsListView
    tagsListView

    constructor(authorsState, tagsState, actionHandler) {
        this.bevelView = new BevelView(true)

        const content = window.document.createElement("div")
        const title = window.document.createElement("h1")
        title.innerHTML = "Hello Portfolio!"
        content.appendChild(title)

        this.authorsListView = new ToggleListView("author", authorsState, (author) => {
            actionHandler("selectAuthor", author)
        })
        this.tagsListView = new ToggleListView("tag", tagsState, (tag) => {
            actionHandler("selectTag", tag)
        })

        content.appendChild(this.authorsListView.getElement())
        content.appendChild(this.tagsListView.getElement())

        this.bevelView.setContentElement(content)
    }

    show() {
        return Promise.all([this.bevelView.bevel(true), this.bevelView.showContent(true)])
    }

    hide() {
        return Promise.all([this.bevelView.bevel(false), this.bevelView.showContent(false)])
    }

    setState(authorsState, tagsState) {
        this.authorsListView.setState(authorsState)
        this.tagsListView.setState(tagsState)
    }

    getElement() {
        return this.bevelView.getElement()
    }
}
