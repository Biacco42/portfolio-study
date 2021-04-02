'use strict';

import Util from "./util.js"

export default class View {
    document
    authorsList
    tagsList
    contentsWrapper
    contentsContainer
    pageIndicator

    actionHandler
    colNum
    intersectionObserver

    constructor(document, actionHandler) {
        this.document = document
        this.authorsList = document.getElementById("authors_list")
        this.tagsList = document.getElementById("tags_list")
        this.contentsWrapper = document.getElementById("contents_wrapper")
        this.contentsContainer = document.getElementById("contents_container")
        this.pageIndicator = document.getElementById("page_indicator")

        this.actionHandler = actionHandler
        this.colNum = View.numberOfCols()
        this.intersectionObserver = View.createIntersectionObserver()
    }

    onResize(pageContents) {
        const newColNum = View.numberOfCols()
        if (newColNum != this.colNum) {
            this.colNum = newColNum
            this.intersectionObserver = View.createIntersectionObserver()
            this.showPage(pageContents)
        }
    }

    showAuthors(authorsState) {
        Util.removeAllChildren(this.authorsList)
        Object.keys(authorsState).forEach(author => {
            const authorButton = this.document.createElement("a")
            authorButton.innerHTML = author
            authorButton.setAttribute("href", author)
            authorButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectAuthor", author)
            }

            const isEnabledClass = authorsState[author] ? "enabled" : "disabled"
            authorButton.setAttribute("class", isEnabledClass)

            this.authorsList.appendChild(authorButton)
        })
    }

    showTags(tagsState) {
        Util.removeAllChildren(this.tagsList)
        Object.keys(tagsState).forEach(tag => {
            const tagButton = this.document.createElement("a")
            tagButton.innerHTML = tag
            tagButton.setAttribute("href", tag)
            tagButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectTag", tag)
            }

            const isEnabledClass = tagsState[tag] ? "enabled" : "disabled"
            tagButton.setAttribute("class", isEnabledClass)

            this.tagsList.appendChild(tagButton)
        })
    }

    showPage(pageContents) {
        this.contentsWrapper.ontransitionend = () => {
            window.scrollTo(0, 0)

            const colNum = View.numberOfCols()
            const colsDOM = Util.range(0, colNum, 1).map(_ => {
                const column = this.document.createElement("div")
                column.setAttribute("class", "column")
                return column
            })

            Promise.all(pageContents).then(contents => {
                contents.forEach((content, index) => {
                    const columnDOM = colsDOM[index % colNum]
                    columnDOM.appendChild(this.getContentDOM(content))
                })

                const contentsWrapper = this.document.createElement("div")
                contentsWrapper.id = "contents_wrapper"
                colsDOM.forEach(colDOM => {
                    const columnWrapper = this.document.createElement("div")
                    columnWrapper.appendChild(colDOM)
                    contentsWrapper.appendChild(columnWrapper)
                })

                Util.removeAllChildren(this.contentsContainer)
                this.contentsContainer.appendChild(contentsWrapper)
                this.contentsWrapper = contentsWrapper
                this.colNum = colNum
            })
        }
        this.contentsWrapper.classList.add("disappear")
    }

    showPageIndicator(pageState) {
        Util.removeAllChildren(this.pageIndicator)
        Object.keys(pageState).forEach(page => {
            const pageButton = this.document.createElement("a")
            pageButton.innerHTML = parseInt(page, 10) + 1
            pageButton.setAttribute("href", page)
            pageButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectPage", page)
            }

            const isEnabledClass = pageState[page] ? "enabled" : "disabled"
            pageButton.setAttribute("class", isEnabledClass)

            this.pageIndicator.appendChild(pageButton)
        })
    }

    getContentDOM(content) {
        const defaultImageSource = {
            "src": "images/360x360.png",
            "width": 360,
            "height": 360
        }
        const imageSource = Util.retrieveOrDefault(content, "thumbnail", defaultImageSource)
        const image = this.document.createElement("img")
        image.setAttribute("src", imageSource.src)
        image.setAttribute("width", imageSource.width)
        image.setAttribute("height", imageSource.height)
        image.setAttribute("class", "thumbnail")
        image.setAttribute("load", "lazy")

        const thumbnail = this.document.createElement("div")
        thumbnail.appendChild(image)

        const titleString = Util.retrieveOrDefault(content, "title", "")
        const title = this.document.createElement("h1")
        title.textContent = titleString

        const descriptionString = Util.retrieveOrDefault(content, "description", "")
        const description = this.document.createElement("p")
        description.textContent = descriptionString
        description.setAttribute("class", "description")

        const authorsString = Util.retrieveOrDefault(content, "authors", []).join(", ")
        const authors = this.document.createElement("p")
        authors.textContent = authorsString
        authors.setAttribute("class", "author")

        const tagsList = Util.retrieveOrDefault(content, "tags", [])
        const tags = this.document.createElement("div")
        tags.style.display = "flex"
        tagsList.forEach(tagString => {
            const tag = this.document.createElement("p")
            tag.textContent = tagString
            tag.setAttribute("class", tagString)
            tags.appendChild(tag)
        })

        const label = this.document.createElement("div")
        label.appendChild(title)
        label.appendChild(description)
        label.appendChild(authors)
        label.appendChild(tags)

        const contentNode = this.document.createElement("div")
        contentNode.appendChild(thumbnail)
        contentNode.appendChild(label)

        const contentButton = this.document.createElement("a")
        contentButton.setAttribute("href", content.id)
        contentButton.onclick = (event) => {
            event.preventDefault()
            this.actionHandler("selectContent", content.id)
        }
        contentButton.appendChild(contentNode)

        const contentCard = this.document.createElement("div")
        contentCard.setAttribute("class", "card_slidein")
        contentCard.appendChild(contentButton)
        this.intersectionObserver.observe(contentCard)

        return contentCard
    }

    static numberOfCols() {
        const viewportWidth = window.innerWidth
        return 1000 < viewportWidth ? 3 : viewportWidth < 599 ? 1 : 2
    }

    static createIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const seed = Math.random()
                    const delay = seed * seed * 400
                    window.setTimeout(() => {
                        entry.target.classList.add("shown")
                    }, delay)
                }
            })
        }
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0
        }

        return new IntersectionObserver(intersectionHandler, options)
    }
}
