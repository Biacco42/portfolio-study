'use strict';

import BevelView from "./bevel_view.js"

export default class ContentCardView {
    bevelView

    constructor(content) {
        this.bevelView = new BevelView()

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
        contentNode.appendChild(thumbnail)
        contentNode.appendChild(label)

        const contentButton = this.document.createElement("a")
        contentButton.setAttribute("href", "#")
        contentButton.onclick = (event) => {
            event.preventDefault()
            this.actionHandler("selectContent", content.id)
        }
        contentButton.appendChild(contentNode)

        this.bevelView.setContentElement(contentButton)
    }

    getElement() {
        return this.bevelView.getElement()
    }

    show() {
        return Promise.all([this.bevelView.bevel(true), this.bevelView.showContent(true)])
    }

    hide() {
        return Promise.all([this.bevelView.bevel(false), this.bevelView.showContent(false)])
    }
}