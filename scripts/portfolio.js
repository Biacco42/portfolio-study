'use strict';

import Util from "./util.js"
import State from "./portfolio_state.js"
import View from "./portfolio_view.js"

let state
let view

window.onload = (_) => {
    fetch("contents-list.json")
        .then(response => {
            return response.json()
        })
        .then(responseJSON => {
            onContentsListReceived(responseJSON)
        })
}

window.onresize = (_) => {

}

function onContentsListReceived(contentsList) {
    state = new State(contentsList, 1, 16, (stateEvent, stateValue) => {
        switch (stateEvent) {
            case "selectedAutohrs":
                break
            case "selectedTags":
                break
            case "selectedIndicies":
                break
            case "pageContents":
                inflate(stateValue, 3)
                break
        }
    })
    view = new View()
}

// TODO: temp dev
function inflate(contentsList, cols) {
    console.log("inflate!!!!!!!")
    let contentsWrapper = document.getElementById("contents_wrapper")
    contentsWrapper.classList.add("disappear")

    const colsDOM = Util.range(0, cols, 1).map(_ => {
        const column = document.createElement("div")
        column.setAttribute("class", "column")

        return column
    })

    Promise.all(contentsList).then(contents => {
        contents.forEach((content, index) => {
            let columnDOM = colsDOM[index % cols]
            columnDOM.appendChild(getContentDOM(content))
        })

        let contentsWrapper = document.createElement("div")
        contentsWrapper.id = "contents_wrapper"
        colsDOM.forEach(colDOM => {
            let columnWrapper = document.createElement("div")
            columnWrapper.appendChild(colDOM)
            contentsWrapper.appendChild(columnWrapper)
        })

        let contentsContainer = document.getElementById("contents_container")
        while (contentsContainer.firstChild) {
            contentsContainer.removeChild(contentsContainer.firstChild)
        }
        contentsContainer.appendChild(contentsWrapper)
    })
}

function getContentDOM(content) {
    let defaultImageSource = {
        "src": "images/360x360.png",
        "width": 360,
        "height": 360
    }
    let imageSource = Util.retrieveOrDefault(content, "thumbnail", defaultImageSource)
    let image = document.createElement("img")
    image.setAttribute("src", imageSource.src)
    image.setAttribute("width", imageSource.width)
    image.setAttribute("height", imageSource.height)
    image.setAttribute("class", "thumbnail")
    image.setAttribute("load", "lazy")

    let thumbnail = document.createElement("div")
    thumbnail.appendChild(image)

    let titleString = Util.retrieveOrDefault(content, "title", "")
    let title = document.createElement("h1")
    title.textContent = titleString

    let descriptionString = Util.retrieveOrDefault(content, "description", "")
    let description = document.createElement("p")
    description.textContent = descriptionString
    description.setAttribute("class", "description")

    let authorsString = Util.retrieveOrDefault(content, "author", []).join(", ")
    let authors = document.createElement("p")
    authors.textContent = authorsString
    authors.setAttribute("class", "author")

    let tagsList = Util.retrieveOrDefault(content, "tag", [])
    let tags = document.createElement("div")
    tags.style.display = "flex"
    tagsList.forEach(tagString => {
        let tag = document.createElement("p")
        tag.textContent = tagString
        tag.setAttribute("class", tagString)
        tags.appendChild(tag)
    })

    let label = document.createElement("div")
    label.appendChild(title)
    label.appendChild(description)
    label.appendChild(authors)
    label.appendChild(tags)

    let contentNode = document.createElement("div")
    contentNode.appendChild(thumbnail)
    contentNode.appendChild(label)
    contentNode.setAttribute("class", "fadein")
    contentNode.classList.add("upin")
    contentNode.classList.add("shown")
    return contentNode
}

