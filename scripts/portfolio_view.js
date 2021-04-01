'use strict';

import Util from "./util.js"

export default class View {
    document
    authorsList
    tagsList
    contentsWrapper
    contentsContainer
    pageIndicator

    colNum
    contents
    intersectionObserver

    constructor(document) {
        this.document = document
        this.authorsList = document.getElementById("authors_list")
        this.tagsList = document.getElementById("tags_list")
        this.contentsWrapper = document.getElementById("contents_wrapper")
        this.contentsContainer = document.getElementById("contents_container")
        this.pageIndicator = document.getElementById("page_indicator")

        this.colNum = View.numberOfCols()
        this.intersectionObserver = View.createIntersectionObserver()
    }

    onResize(pageContents) {
        const newColNum = View.numberOfCols()
        if (newColNum != this.colNum) {
            this.intersectionObserver = View.createIntersectionObserver()
            this.colNum = newColNum
            this.showPage(pageContents)
        }
    }

    showPage(pageContents) {
        this.contentsWrapper.classList.add("disappear")

        const colsDOM = Util.range(0, this.colNum, 1).map(_ => {
            const column = this.document.createElement("div")
            column.setAttribute("class", "column")
            return column
        })

        Promise.all(pageContents).then(contents => {
            contents.forEach((content, index) => {
                const columnDOM = colsDOM[index % this.colNum]
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
        })
    }

    showAuthors(authorsState) {
        Util.removeAllChildren(this.authorsList)
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

        const authorsString = Util.retrieveOrDefault(content, "author", []).join(", ")
        const authors = this.document.createElement("p")
        authors.textContent = authorsString
        authors.setAttribute("class", "author")

        const tagsList = Util.retrieveOrDefault(content, "tag", [])
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
        contentNode.setAttribute("class", "fadein")
        contentNode.classList.add("upin")
        this.intersectionObserver.observe(contentNode)
        return contentNode
    }

    static numberOfCols() {
        const viewportWidth = window.innerWidth
        return 1000 < viewportWidth ? 3 : viewportWidth < 599 ? 1 : 2
    }

    static createIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("shown")
                }
            })
        }
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.3
        }

        return new IntersectionObserver(intersectionHandler, options)
    }
}
