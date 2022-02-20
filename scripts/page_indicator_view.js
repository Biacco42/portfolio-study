'use strict';

import BevelView from "./bevel_view.js";
import Util from "./util.js";

export default class PageIndicatorView {
    pageIndicatorContainer

    pageIndicies
    pageIndexButtons

    intersectionObserver
    actionHandler

    constructor(actionHandler) {
        this.actionHandler = actionHandler
        this.pageIndicies = {}
        this.pageIndexButtons = []
        this.pageIndicatorContainer = window.document.createElement("div")
        this.pageIndicatorContainer.id = "page_indicator_container"
        this.intersectionObserver = this.createIntersectionObserver()
    }

    getElement() {
        return this.pageIndicatorContainer
    }

    setState(pageIndicies) {
        if (pageIndicies) {
            this.pageIndicies = pageIndicies
        } else {
            this.pageIndicies = {}
        }

        this.show()
    }

    show() {
        return this.hide().then(() => {
            window.setTimeout(() => {
                Util.removeAllChildren(this.pageIndicatorContainer)
                this.intersectionObserver = this.createIntersectionObserver()

                Object.keys(this.pageIndicies).forEach(page => {
                    const bevelButton = new BevelView(null, ["page_button"])

                    const pageNum = window.document.createElement("div")
                    pageNum.innerHTML = parseInt(page, 10) + 1

                    const pageNode = window.document.createElement("div")
                    pageNode.setAttribute("class", "page_num")

                    if (this.pageIndicies[page]) {
                        pageNode.classList.add("selected")
                    }

                    pageNode.appendChild(pageNum)

                    const pageButtonLink = window.document.createElement("a")
                    pageButtonLink.setAttribute("class", "page_button_link")
                    pageButtonLink.setAttribute("href", "#")
                    pageButtonLink.onclick = (event) => {
                        event.preventDefault()
                        if (!this.pageIndicies[page]) {
                            this.actionHandler(page)
                        }
                    }
                    pageButtonLink.appendChild(pageNode)

                    bevelButton.setContentElement(pageButtonLink)

                    this.pageIndicatorContainer.appendChild(bevelButton.getElement())
                    this.pageIndexButtons.push(bevelButton)
                })

                this.intersectionObserver.observe(this.pageIndicatorContainer)
            }, 500)
        })
    }

    hide() {
        this.intersectionObserver.disconnect()
        const hideTask = this.pageIndexButtons.map((button) => {
            button.showContent(false)
            return button.bevel(false)
        })

        return Promise.all(hideTask)
    }

    createIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.pageIndexButtons.forEach((button) => {
                        button.bevel(true)
                        window.setTimeout(() => {
                            button.showContent(true)
                        }, 500)
                    })
                    this.intersectionObserver.unobserve(entry.target)
                }
            })
        }
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1
        }

        return new IntersectionObserver(intersectionHandler, options)
    }
}