'use strict';

import ContentCardView from "./content_card_view.js";
import Util from "./util.js";
import uuid4 from 'https://cdn.jsdelivr.net/gh/tracker1/node-uuid4/browser.mjs'

export default class ContentsTileView {
    contentsContainer
    contentsWrapper
    pageContents
    contentCardDict
    cardIntersectionObserver
    colNum

    constructor() {
        this.contentsContainer = window.document.createElement("div")
        this.contentsContainer.id = "contents_container"

        this.pageContents = null
        this.contentCardDict = {}
        this.cardIntersectionObserver = null
    }

    getElement() {
        return this.contentsContainer
    }

    show(pageContents) {
        if (pageContents == null) {
            this.pageContents = null
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

        const afterNull = () => { return this.pageContents == null }
        const colChange = () => { return this.colNum != ContentsTileView.numberOfCols() }
        const contentsNumChange = () => { return this.pageContents.length != pageContents.length }
        const contentsChange = () => {
            return pageContents.reduce((acc, pageContent, index) => {
                const currentPageContent = this.pageContents[index]
                return acc || pageContent.id != currentPageContent.id
            }, false)
        }
        const contentsUpdated = afterNull() || colChange() || contentsNumChange() || contentsChange()

        if (contentsUpdated) {
            this.pageContents = pageContents
            return this.hide().then(() => {
                this.contentCardDict = {}
                this.cardIntersectionObserver = this.createCardIntersectionObserver()

                const colNum = ContentsTileView.numberOfCols()
                const colsElement = Util.range(0, colNum, 1).map(_ => {
                    const column = window.document.createElement("div")
                    column.setAttribute("class", "column")
                    return column
                })

                pageContents.forEach((content, index) => {
                    const contentCard = new ContentCardView(content)
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
            })
        } else {
            return new Promise((resolve, _) => { resolve() })
        }
    }

    hide() {
        const hideTasks = Object.keys(this.contentCardDict).map(key => {
            return this.contentCardDict[key].hide()
        })

        return Promise.all(hideTasks)
    }

    createCardIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const seed = Math.random()
                    const delay = seed * seed * 400

                    if (entry.target.id && this.contentCardDict.hasOwnProperty(entry.target.id)) {
                        const card = this.contentCardDict[entry.target.id]
                        window.setTimeout(() => {
                            card.show()
                        }, delay)
                    }
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