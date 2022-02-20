'use strict';

import HeaderView from "./header_view.js"
import ToggleListView from "./toggle_list_view.js";
import Util from "./util.js"

export default class PortfolioView {
    document
    mainView
    headerView
    contentsListContainer
    filterContainer
    authorsView
    tagsView
    contentsContainer



    contentsWrapper
    pageIndicatorContainer
    pageIndicator
    popupBackground
    popupView
    popupContent




    actionHandler
    colNum

    constructor(document, actionHandler) {
        this.document = document
        this.actionHandler = actionHandler
        this.mainView = document.getElementById("main_view")
        this.headerView = new HeaderView()
        this.mainView.appendChild(this.headerView.getElement())

        this.contentsListContainer = document.createElement("div")
        this.contentsListContainer.id = "contents_list"
        this.mainView.appendChild(this.contentsListContainer)

        this.filterContainer = document.createElement("div")
        this.filterContainer.id = "filter_container"
        this.contentsListContainer.appendChild(this.filterContainer)

        this.contentsContainer = document.createElement("div")
        this.contentsContainer.id = "contents_container"
        this.contentsListContainer.appendChild(this.contentsContainer)

        this.colNum = PortfolioView.numberOfCols()

        // this.popupBackground.onclick = (event) => {
        //     event.stopPropagation()
        //     this.actionHandler("deselectContent", null)
        // }

        // this.popupContent.onclick = (event) => {
        //     event.stopPropagation()
        // }
    }

    setState(state) {
        if (!this.authorsView && !this.tagsView) {
            this.authorsView = new ToggleListView("authors", "thin", state.authors, (selected) => {
                this.actionHandler("selectAuthor", selected)
            })

            const authorsElement = this.authorsView.getElement()
            authorsElement.id = "authors_list"
            this.filterContainer.appendChild(authorsElement)

            this.tagsView = new ToggleListView("tags", "thin", state.tags, (selected) => {
                this.actionHandler("selectTag", selected)
            })

            this.filterContainer.appendChild(this.tagsView.getElement())
        } else {
            this.authorsView.setState(state.authors)
            this.tagsView.setState(state.tags)
        }
    }

    onResize(pageContents) {
        const newColNum = PortfolioView.numberOfCols()
        if (newColNum != this.colNum) {
            this.colNum = newColNum
            this.showPage(pageContents)
        }
    }

    showHeader() {
        return this.headerView.show()
    }

    hideHeader() {
        return this.headerView.hide()
    }

    showAuthors() {
        return this.authorsView.show()
    }

    hideAuthors() {
        return this.authorsView.hide()
    }

    showTags() {
        return this.tagsView.show()
    }

    hideTags() {
        return this.tagsView.hide()
    }

    showPage(pageContents) {
        this.cardIntersectionObserver = PortfolioView.createCardIntersectionObserver()

        const colNum = PortfolioView.numberOfCols()
        const colsElement = Util.range(0, colNum, 1).map(_ => {
            const column = this.document.createElement("div")
            column.setAttribute("class", "column")
            return column
        })

        pageContents.forEach((content, index) => {
            const columnElement = colsElement[index % colNum]
            columnElement.appendChild(this.getContentCardElement(content))
        })

        const contentsWrapper = this.document.createElement("div")
        contentsWrapper.id = "contents_wrapper"
        colsElement.forEach(colElement => {
            const columnWrapper = this.document.createElement("div")
            columnWrapper.appendChild(colElement)
            contentsWrapper.appendChild(columnWrapper)
        })

        Util.removeAllChildren(this.contentsContainer)
        this.contentsContainer.appendChild(contentsWrapper)
        this.contentsWrapper = contentsWrapper
        this.colNum = colNum
    }

    showPageIndicator(pageIndicies) {
        window.setTimeout(() => {
            Util.removeAllChildren(this.pageIndicator)

            Object.keys(pageIndicies).forEach(page => {
                const pageNum = this.document.createElement("div")
                pageNum.innerHTML = parseInt(page, 10) + 1

                const pageNode = this.document.createElement("div")
                pageNode.setAttribute("class", "page_num")
                pageNode.classList.add("bevel_content")

                if (pageIndicies[page]) {
                    pageNode.classList.add("selected")
                }

                pageNode.appendChild(pageNum)

                const pageButtonLink = this.document.createElement("a")
                pageButtonLink.setAttribute("href", "#")
                pageButtonLink.onclick = (event) => {
                    event.preventDefault()
                    if (!pageIndicies[page]) {
                        this.actionHandler("selectPage", page)
                    }
                }
                pageButtonLink.appendChild(pageNode)

                const pageButton = this.document.createElement("div")
                pageButton.setAttribute("class", "page_button")
                pageButton.classList.add("bevel")
                pageButton.appendChild(pageButtonLink)

                this.pageIndicator.appendChild(pageButton)
            })

            PortfolioView.showBevel(this.header)

            this.intersectionObserver.observe(this.pageIndicatorContainer)
        }, 450)

        PortfolioView.hideBevel(this.pageIndicatorContainer)
    }

    showPopup(content) {
        window.setTimeout(() => {
            window.scrollTo(0, 0)
            this.mainView.style.display = "none"
            this.popupBackground.style.display = "block"

            window.setTimeout(() => {
                PortfolioView.showBevel(this.popupView)
            }, 30)
        }, 450)

        this.lastScroll = window.scrollY
        PortfolioView.hideBevel(this.mainView)
    }

    hidePopup(completion) {
        window.setTimeout(() => {
            this.mainView.style.display = "block"
            this.popupBackground.style.display = "none"
            completion()
        }, 450)

        PortfolioView.hideBevel(this.popupView)
    }

    getContentCardElement(content) {
        const defaultImageSource = {
            "src": "images/360x360.png",
            "width": 360,
            "height": 360
        }
        const imageSource = Util.retrieveOrDefault(content, "thumbnail", defaultImageSource)
        const image = this.document.createElement("img")
        image.setAttribute("src", imageSource.src)
        if (imageSource.width) { image.setAttribute("width", imageSource.width) }
        if (imageSource.height) { image.setAttribute("height", imageSource.height) }
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
            tag.setAttribute("class", "tag")
            tags.appendChild(tag)
        })

        const publishedOnRawString = Util.retrieveOrDefault(content, "publishedOn", "2021-04-01T00:00:00+09:00")
        const publishedOnString = dayjs(publishedOnRawString).format("YYYY MM/DD")
        const publishedOn = this.document.createElement("p")
        publishedOn.textContent = publishedOnString
        publishedOn.setAttribute("class", "publishedOn")

        const label = this.document.createElement("div")
        label.appendChild(title)
        label.appendChild(description)
        label.appendChild(authors)
        label.appendChild(tags)
        label.appendChild(publishedOn)

        const contentNode = this.document.createElement("div")
        contentNode.setAttribute("class", "bevel_content")
        contentNode.appendChild(thumbnail)
        contentNode.appendChild(label)

        const contentButton = this.document.createElement("a")
        contentButton.setAttribute("href", "#")
        contentButton.onclick = (event) => {
            event.preventDefault()
            this.actionHandler("selectContent", content.id)
        }
        contentButton.appendChild(contentNode)

        const contentCard = this.document.createElement("div")
        contentCard.setAttribute("class", "card")
        contentCard.classList.add("bevel")
        contentCard.appendChild(contentButton)
        this.intersectionObserver.observe(contentCard)

        return contentCard
    }

    initAuthors(authorsState) {
        Util.removeAllChildren(this.authorsList)
        Object.keys(authorsState).forEach(author => {
            const authorButton = this.document.createElement("a")
            authorButton.innerHTML = author
            authorButton.setAttribute("href", "#")
            authorButton.setAttribute("id", "author_" + author)
            authorButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectAuthor", author)
            }

            if (authorsState[author]) {
                authorButton.setAttribute("class", "enabled")
            }

            this.authorsList.appendChild(authorButton)
        })
    }

    initTags(tagsState) {
        Util.removeAllChildren(this.tagsList)
        Object.keys(tagsState).forEach(tag => {
            const tagButton = this.document.createElement("a")
            tagButton.innerHTML = tag
            tagButton.setAttribute("href", "#")
            tagButton.setAttribute("id", "tag_" + tag)
            tagButton.onclick = (event) => {
                event.preventDefault()
                this.actionHandler("selectTag", tag)
            }

            if (tagsState[tag]) {
                tagButton.setAttribute("class", "enabled")
            }

            this.tagsList.appendChild(tagButton)
        })
    }

    static numberOfCols() {
        const viewportWidth = window.innerWidth
        return 1000 < viewportWidth ? 3 : viewportWidth <= 600 ? 1 : 2
    }

    static createCardIntersectionObserver() {
        const intersectionHandler = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const seed = Math.random()
                    const delay = seed * seed * 400
                    window.setTimeout(() => {
                        PortfolioView.show(entry.target)
                        PortfolioView.show(entry.target.firstElementChild.firstElementChild)
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
}
