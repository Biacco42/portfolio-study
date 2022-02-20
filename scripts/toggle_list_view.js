'use strict';

import BevelView from "./bevel_view.js";
import Util from "./util.js";

export default class ToggleListView {
    rootElement
    labelElement
    listContainer

    toggleList
    style

    actionHandler

    lastState

    constructor(label, style, actionHandler) {
        this.style = style
        this.lastState = null

        const rootElement = window.document.createElement("div")
        rootElement.setAttribute("class", "toggle_list")
        this.rootElement = rootElement

        const labelElement = window.document.createElement("p")
        labelElement.innerHTML = label
        this.labelElement = labelElement
        rootElement.appendChild(labelElement)

        const listContainer = window.document.createElement("div")
        listContainer.setAttribute("class", "toggle_list_container")
        this.listContainer = listContainer
        rootElement.appendChild(listContainer)

        this.actionHandler = actionHandler
    }

    getElement() {
        return this.rootElement
    }

    setState(state) {
        if (state == null) {
            this.lastState = null

            this.hide().then(() => {
                Util.removeAllChildren(this.listContainer)
                this.toggleList = {}
            })

            return
        }

        const afterNull = () => { return this.lastState == null }
        const authorsNumChange = () => { return Object.keys(this.lastState).length != Object.keys(state).length }
        const authorsChange = () => {
            const lastAuthors = Object.keys(this.lastState)
            return Object.keys(state).reduce((acc, author, index) => {
                const currentAuthor = lastAuthors[index]
                return acc || author != currentAuthor
            }, false)
        }
        const contentsUpdated = afterNull() || authorsNumChange() || authorsChange()

        if (contentsUpdated) {
            this.hide().then(() => {
                this.lastState = state

                Util.removeAllChildren(this.listContainer)
                this.toggleList = {}

                const firstSpacer = window.document.createElement("div")
                firstSpacer.setAttribute("class", "toggle_list_spacer")
                this.listContainer.appendChild(firstSpacer)

                this.toggleList = Object.keys(state).reduce((acc, key) => {
                    const toggleButtonContainer = window.document.createElement("div")
                    toggleButtonContainer.setAttribute("class", "toggle_button_container")

                    const toggleButtonBevel = new BevelView(this.style, ["toggle_bevel"])
                    toggleButtonContainer.appendChild(toggleButtonBevel.getElement())

                    const toggleButton = window.document.createElement("a")
                    toggleButton.innerHTML = key
                    toggleButton.setAttribute("href", "#")
                    toggleButton.setAttribute("class", "toggle_button")
                    toggleButton.onclick = (event) => {
                        event.preventDefault()
                        this.actionHandler(key)
                    }
                    toggleButtonBevel.setContentElement(toggleButton)

                    this.listContainer.appendChild(toggleButtonContainer)

                    acc[key] = toggleButtonBevel

                    return acc
                }, {})

                const lastSpacer = window.document.createElement("div")
                lastSpacer.setAttribute("class", "toggle_list_spacer")
                this.listContainer.appendChild(lastSpacer)
            })
        } else {
            Object.keys(state).forEach(key => {
                if (typeof this.toggleList[key] !== "undefined") {
                    const target = this.toggleList[key]
                    target.bevel(state[key])

                    if (state[key]) {
                        target.contentElement.firstElementChild.classList.remove("disabled")
                    } else {
                        target.contentElement.firstElementChild.classList.add("disabled")
                    }
                }
            })
        }
    }

    show() {
        if (this.lastState) {
            const showTask = Object.keys(this.lastState).map((key) => {
                const toggleButtonBevel = this.toggleList[key]

                if (this.lastState[key]) {
                    toggleButtonBevel.contentElement.firstElementChild.classList.remove("disabled")
                } else {
                    toggleButtonBevel.contentElement.firstElementChild.classList.add("disabled")
                }

                toggleButtonBevel.showContent(true)
                return toggleButtonBevel.bevel(this.lastState[key])
            })

            this.labelElement.style.opacity = "1"

            return Promise.all(showTask)
        } else {
            return new Promise((resolve, _) => { resolve() })
        }
    }

    hide() {
        if (this.lastState) {
            const hideTask = Object.keys(this.lastState).forEach((key) => {
                const toggleButtonBevel = this.toggleList[key]
                toggleButtonBevel.showContent(false)
                return toggleButtonBevel.bevel(false)
            })

            this.labelElement.style.opacity = "0"

            return Promise.all(hideTask)
        } else {
            return new Promise((resolve, _) => { resolve() })
        }
    }
}