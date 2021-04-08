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
                if (0.9 < entry.intersectionRatio) {
                    // entry.target.classList.remove("shrink")
                } else {
                    // entry.target.classList.add("shrink")
                }
            })
        }

        const options = {
            root: listContainer,
            rootMargin: "0px -24px 0px -24px",
            threshold: [0.3, 0.9]
        }

        this.intersectionObserver = new IntersectionObserver(intersectionHandler, options)
        this.actionHandler = actionHandler

        const firstSpacer = window.document.createElement("div")
        firstSpacer.setAttribute("class", "toggle_list_spacer")
        listContainer.appendChild(firstSpacer)

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
            this.intersectionObserver.observe(toggleButtonBevel.getElement())

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
}