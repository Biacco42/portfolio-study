'use strict';

import BevelView from "./bevel_view.js";

export default class ToggleListView {
    rootElement

    toggleList

    actionHandler
    intersectionObserver

    constructor(label, state, actionHandler) {
        this.rootElement = window.document.createElement("div")

        const labelElement = window.document.createElement("p")
        labelElement.innerHTML = label
        this.rootElement.appendChild(labelElement)

        const listContainer = window.document.createElement("div")
        listContainer.setAttribute("class", "toggle_list_container")
        this.rootElement.appendChild(listContainer)

        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { // temp
                }
            })
        }

        const options = {
            root: listContainer,
            rootMargin: "0px",
            threshold: 0.0
        }

        this.intersectionObserver = new IntersectionObserver(intersectionHandler, options)
        this.actionHandler = actionHandler

        this.toggleList = Object.keys(state).reduce((acc, key) => {
            const toggleButtonBevel = new BevelView(false, ["toggle_bevel"])

            const toggleButton = window.document.createElement("a")
            toggleButton.innerHTML = key
            toggleButton.setAttribute("href", "#")
            toggleButton.setAttribute("class", "toggle_button")
            toggleButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler(key)
            }
            toggleButtonBevel.setContentElement(toggleButton)

            toggleButtonBevel.showContent(true)
            toggleButtonBevel.bevel(state[key])

            listContainer.appendChild(toggleButtonBevel.getElement())

            return acc[key] = toggleButtonBevel
        }, {})
    }

    getElement() {
        return this.rootElement
    }

    setState(toggleState) {
        Object.keys(toggleState).forEach(key => {
            if (typeof this.toggleList[key] !== "undefined") {
                this.toggleList[key].bevel(toggleState[key])
            }
        })
    }
}