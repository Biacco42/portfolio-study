'use strict';

import Util from "./util.js"

export default class View {
    document
    header
    authorsList
    tagsList
    contentsContainer
    contentsWrapper
    pageIndicatorContainer
    pageIndicator
    popupBackground
    popupContent

    actionHandler
    colNum
    intersectionObserver

    constructor(document, actionHandler) {
        this.document = document
        this.header = document.getElementsByTagName("header")[0]
        this.authorsList = document.getElementById("authors_list")
        this.tagsList = document.getElementById("tags_list")
        this.contentsContainer = document.getElementById("contents_container")
        this.contentsWrapper = document.getElementById("contents_wrapper")
        this.pageIndicatorContainer = document.getElementById("page_indicator_container")
        this.pageIndicator = document.getElementById("page_indicator")
        this.popupBackground = document.getElementById("popup_background")
        this.popupContent = document.getElementById("popup_content")

        this.actionHandler = actionHandler
        this.colNum = View.numberOfCols()
        this.intersectionObserver = View.createIntersectionObserver()

        this.popupBackground.onclick = (event) => {
            event.stopPropagation()
            this.closePopup()
        }

        this.popupContent.onclick = (event) => {
            event.stopPropagation()
        }
    }

    onResize(pageContents) {
        const newColNum = View.numberOfCols()
        if (newColNum != this.colNum) {
            this.colNum = newColNum
            this.intersectionObserver = View.createIntersectionObserver()
            this.showPage(pageContents)
        }
    }

    showHeader() {
        View.showBevel(this.header)
    }

    hideHeader() {
        View.hideBevel(this.header)
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
        window.setTimeout(() => {
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
        }, 450)

        View.hideBevel(this.contentsContainer)
    }

    showPageIndicator(pageState) {
        Util.removeAllChildren(this.pageIndicator)
        Object.keys(pageState).forEach(page => {
            const pageButton = this.document.createElement("a")
            pageButton.innerHTML = parseInt(page, 10) + 1
            pageButton.setAttribute("href", page)
            pageButton.onclick = (event) => {
                event.preventDefault()

                View.hideBevel(this.pageIndicatorContainer)
                View.hideBevel(this.header)

                window.setTimeout(() => {
                    Util.removeAllChildren(this.contentsContainer)
                    window.scrollTo(0, 0)
                    View.showBevel(this.header)
                }, 425)

                this.actionHandler("selectPage", page)
            }

            const isEnabledClass = pageState[page] ? "enabled" : "disabled"
            pageButton.setAttribute("class", isEnabledClass)

            this.pageIndicator.appendChild(pageButton)
        })

        this.intersectionObserver.observe(this.pageIndicatorContainer)
    }

    showPopup(content) {
        this.popupBackground.setAttribute("class", "shown")
    }

    closePopup() {
        this.popupBackground.removeAttribute("class")
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
        contentNode.setAttribute("class", "bevel_content")
        contentNode.appendChild(thumbnail)
        contentNode.appendChild(label)

        const contentButton = this.document.createElement("a")
        contentButton.setAttribute("href", content.id)
        contentButton.onclick = (event) => {
            event.preventDefault()
            this.showPopup(content)
        }
        contentButton.appendChild(contentNode)

        const contentCard = this.document.createElement("div")
        contentCard.setAttribute("class", "card")
        contentCard.classList.add("bevel")
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
                        View.showBevel(entry.target)
                    }, delay)
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

    static showBevel(node) {
        if (node.classList.contains("bevel")) {
            node.classList.remove("hidden")
            node.classList.add("shown")
        }

        node.querySelectorAll(".bevel").forEach(element => {
            element.classList.remove("hidden")
            element.classList.add("shown")
        })
        node.querySelectorAll(".bevel_content").forEach(element => {
            element.classList.remove("hidden")
            element.classList.add("shown")
        })
    }

    static hideBevel(node) {
        if (node.classList.contains("bevel")) {
            node.classList.add("hidden")
            node.classList.remove("shown")
        }

        node.querySelectorAll(".bevel").forEach(element => {
            element.classList.add("hidden")
            element.classList.remove("shown")
        })
        node.querySelectorAll(".bevel_content").forEach(element => {
            element.classList.add("hidden")
            element.classList.remove("shown")
        })
    }
}
