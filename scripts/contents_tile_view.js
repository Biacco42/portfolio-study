'use strict';

import ContentCardView from "./content_card_view.js";
import Util from "./util.js";
import uuid4 from 'https://cdn.jsdelivr.net/gh/tracker1/node-uuid4/browser.mjs'

export default class ContentsTileView {
    contentsContainer
    contentsWrapper
    pageContents
    lastPageContents
    contentCardDict
    cardIntersectionObserver
    colNum
    hidden

    actionHandler

    constructor(actionHandler) {
        this.contentsContainer = window.document.createElement("div")
        this.contentsContainer.id = "contents_container"

        this.pageContents = null
        this.lastPageContents = null
        this.contentCardDict = {}
        this.cardIntersectionObserver = this.createCardIntersectionObserver()
        this.colNum = 0
        this.hidden = false
        this.actionHandler = actionHandler
    }

    getElement() {
        return this.contentsContainer
    }

    setState(pageContents) {
        this.pageContents = pageContents
    }

    show() {
        if (this.pageContents == null) {
            this.lastPageContents = null
            return this.hide().then(() => {
                this.contentCardDict = {}
                this.cardIntersectionObserver = this.createCardIntersectionObserver()

                const colNum = ContentsTileView.numberOfCols()
                const colsElement = Util.range(0, colNum, 1).map(_ => {
                    const column = window.document.createElement("div")
                    column.setAttribute("class", "column")
                    return column
                })

                const contentsWrapper = window.document.createElement("div")
                contentsWrapper.id = "contents_wrapper"
                colsElement.forEach(colElement => {
                    const columnWrapper = window.document.createElement("div")
                    columnWrapper.appendChild(colElement)
                    contentsWrapper.appendChild(columnWrapper)
                })

                Util.removeAllChildren(this.contentsContainer)
                this.contentsContainer.appendChild(contentsWrapper)
                this.contentsWrapper = contentsWrapper
                this.colNum = colNum
            })
        }

        const afterNull = () => { return this.lastPageContents == null }
        const colChange = () => { return this.colNum != ContentsTileView.numberOfCols() }
        const contentsNumChange = () => { return this.lastPageContents.length != this.pageContents.length }
        const contentsChange = () => {
            return this.pageContents.reduce((acc, pageContent, index) => {
                const currentPageContent = this.lastPageContents[index]
                return acc || pageContent.id != currentPageContent.id
            }, false)
        }
        const contentsUpdated = afterNull() || colChange() || contentsNumChange() || contentsChange()

        if (contentsUpdated) {
            this.lastPageContents = this.pageContents
            return this.hide().then(() => {
                this.contentCardDict = {}
                this.cardIntersectionObserver = this.createCardIntersectionObserver()

                const colNum = ContentsTileView.numberOfCols()
                const colsElement = Util.range(0, colNum, 1).map(_ => {
                    const column = window.document.createElement("div")
                    column.setAttribute("class", "column")
                    return column
                })

                this.pageContents.forEach((content, index) => {
                    const contentCard = new ContentCardView(content, this.actionHandler)
                    const contentCardElement = contentCard.getElement()
                    const uuidKey = uuid4()
                    contentCardElement.id = uuidKey
                    this.contentCardDict[uuidKey] = contentCard
                    this.cardIntersectionObserver.observe(contentCardElement)

                    const columnElement = colsElement[index % colNum]
                    columnElement.appendChild(contentCardElement)
                })

                const contentsWrapper = window.document.createElement("div")
                contentsWrapper.id = "contents_wrapper"
                colsElement.forEach(colElement => {
                    const columnWrapper = window.document.createElement("div")
                    columnWrapper.appendChild(colElement)
                    contentsWrapper.appendChild(columnWrapper)
                })

                Util.removeAllChildren(this.contentsContainer)
                this.contentsContainer.appendChild(contentsWrapper)
                this.contentsWrapper = contentsWrapper
                this.colNum = colNum
                this.hidden = false
            })
        } else if (this.hidden) {
            this.cardIntersectionObserver = this.createCardIntersectionObserver()
            Object.keys(this.contentCardDict).forEach((key) => {
                this.cardIntersectionObserver.observe(this.contentCardDict[key].getElement())
            })
            this.hidden = false
            return new Promise((resolve, _) => { resolve() })
        } else {
            return new Promise((resolve, _) => { resolve() })
        }
    }

    hide() {
        this.cardIntersectionObserver.disconnect()
        const hideTasks = Object.keys(this.contentCardDict).map((key) => {
            return this.contentCardDict[key].hide()
        })
        this.hidden = true

        return Promise.all(hideTasks)
    }

    createCardIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const seed = Math.random()
                    const delay = seed * seed * 200

                    if (entry.target.id && this.contentCardDict.hasOwnProperty(entry.target.id)) {
                        const card = this.contentCardDict[entry.target.id]
                        window.setTimeout(() => {
                            card.show()
                        }, delay)
                    }

                    this.cardIntersectionObserver.unobserve(entry.target)
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

    static numberOfCols() {
        const viewportWidth = window.innerWidth
        return 1000 < viewportWidth ? 3 : viewportWidth <= 600 ? 1 : 2
    }
}