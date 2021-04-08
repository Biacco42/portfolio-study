'use strict';

import BevelView from "./bevel_view.js";

export default class ToggleListView {
    rootElement
    labelElement
    listContainer

    toggleList

    actionHandler

    lastState

    constructor(label, style, state, actionHandler) {
        this.lastState = state

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

        const firstSpacer = window.document.createElement("div")
        firstSpacer.setAttribute("class", "toggle_list_spacer")
        listContainer.appendChild(firstSpacer)

        this.toggleList = Object.keys(state).reduce((acc, key) => {
            const toggleButtonContainer = window.document.createElement("div")
            toggleButtonContainer.setAttribute("class", "toggle_button_container")

            const toggleButtonBevel = new BevelView(style, ["toggle_bevel"])
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

            listContainer.appendChild(toggleButtonContainer)

            acc[key] = toggleButtonBevel

            return acc
        }, {})

        const lastSpacer = window.document.createElement("div")
        lastSpacer.setAttribute("class", "toggle_list_spacer")
        listContainer.appendChild(lastSpacer)
    }

    getElement() {
        return this.rootElement
    }

    setState(toggleState) {
        this.lastState = toggleState

        Object.keys(toggleState).forEach(key => {
            if (typeof this.toggleList[key] !== "undefined") {
                const target = this.toggleList[key]
                target.bevel(toggleState[key])

                if (toggleState[key]) {
                    target.contentElement.firstElementChild.classList.remove("disabled")
                } else {
                    target.contentElement.firstElementChild.classList.add("disabled")
                }
            }
        })
    }

    show() {
        Object.keys(this.lastState).forEach((key) => {
            const toggleButtonBevel = this.toggleList[key]
            toggleButtonBevel.showContent(true)
            toggleButtonBevel.bevel(this.lastState[key])
        })

        this.labelElement.style.opacity = "1"
    }

    hide() {
        Object.keys(this.lastState).forEach((key) => {
            const toggleButtonBevel = this.toggleList[key]
            toggleButtonBevel.showContent(false)
            toggleButtonBevel.bevel(false)
        })

        this.labelElement.style.opacity = "0"
    }
}