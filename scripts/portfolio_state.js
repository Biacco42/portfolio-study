'use strict';

import Util from "./util.js"

export default class State {
    contentsList
    authorsList
    tagsList
    page
    contentID
    contentsNumInPage
    stateEventHandler
    contentCacheDict

    constructor(contentsList, page, contentsNumInPage, stateEventHandler) {
        this.contentsList = contentsList.map(contentDesc => {
            const updated = Util.clone(contentDesc)
            const id = Util.removeExtension(contentDesc.contentPath)
            updated.id = id
            return updated
        })
        this.page = page
        this.contentID = null
        this.contentsNumInPage = contentsNumInPage
        this.stateEventHandler = stateEventHandler
        this.contentsCacheDict = {}

        this.setupAuthorsList()
        this.setupTagsList()

        this.publishState("init")
    }

    serialize() {
        return {
            authorsList: Util.clone(this.authorsList),
            tagsList: Util.clone(this.tagsList),
            page: this.page,
            contentID: this.contentID
        }
    }

    deserialize(serialized) {
        Object.keys(serialized.authorsList).forEach(author => {
            const enabled = serialized.authorsList[author]
            if (this.authorsList[author]) {
                this.authorsList[author] = enabled
            }
        })

        Object.keys(serialized.tagsList).forEach(tag => {
            const enabled = serialized.tagsList[tag]
            if (this.tagsList[tag]) {
                this.tagsList[tag] = enabled
            }
        })

        const totalPage = parseInt(this.getActiveContentsList().length / this.contentsNumInPage, 10) + 1
        if (0 <= serialized.page && serialized.page < totalPage) {
            this.page = serialized.page
        }

        if (this.contentsList.filter(contentDesc => contentDesc.id === serialized.contentID)[0]) {
            this.contentID = serialized.contentID
        }

        this.publishState("deserialize")
    }

    publishState(trigger) {
        this.stateEventHandler(trigger, {
            authors: this.authorsList,
            tags: this.tagsList,
            contents: this.getPageContents(),
            pageIndicies: this.getPageIndicies(),
            contentID: this.contentID
        }, this.serialize())
    }

    selectAuthor(author) {
        this.page = 0
        this.authorsList[author] = !this.authorsList[author]

        if (author === "all") {
            Object.keys(this.authorsList).forEach(author => {
                this.authorsList[author] = this.authorsList["all"]
            })
        }

        this.publishState("author")
    }

    selectTag(tag) {
        this.page = 0
        this.tagsList[tag] = !this.tagsList[tag]

        if (tag === "all") {
            Object.keys(this.tagsList).forEach(tag => {
                this.tagsList[tag] = this.tagsList["all"]
            })
        }

        this.publishState("tag")
    }

    selectPage(page) {
        this.page = parseInt(page, 10)
        this.publishState("page")
    }

    selectContent(contentID) {
        this.contentID = contentID
        this.publishState("content")
    }

    getPageIndicies() {
        const totalPage = parseInt(this.getActiveContentsList().length / this.contentsNumInPage, 10) + 1

        return Util.range(0, totalPage, 1).reduce((acc, pageNum) => {
            acc[pageNum] = pageNum == this.page ? true : false

            return acc
        }, {})
    }

    getPageContents() {
        return this.getActiveContentsList()
            .slice(this.page * this.contentsNumInPage, (this.page + 1) * this.contentsNumInPage)
            .map(contentDesc => {
                return this.getContent(contentDesc)
            })
    }

    getActiveContentsList() {
        const enabledAuthors = Object.keys(this.authorsList).filter(author => {
            return this.authorsList[author]
        })

        const enabledTags = Object.keys(this.tagsList).filter(tag => {
            return this.tagsList[tag]
        })

        const activeContents = this.contentsList.filter(contentDesc => {
            const isAuthorsEnabled = contentDesc.authors.reduce((acc, author) => {
                return acc || enabledAuthors.includes(author)
            }, false)

            const isTagsEnabled = contentDesc.tags.reduce((acc, tag) => {
                return acc || enabledTags.includes(tag)
            }, false)

            return isAuthorsEnabled && isTagsEnabled
        })

        return activeContents.filter((content) => {
            const now = dayjs().unix()
            const publishedOnUnixtime = dayjs(content.publishedOn).unix()
            return publishedOnUnixtime < now
        }).sort((a, b) => {
            const aDate = dayjs(a.publishedOn).unix()
            const bDate = dayjs(b.publishedOn).unix()
            return aDate - bDate
        })
    }

    getContent(contentDesc) {
        if (contentDesc.contentPath in this.contentsCacheDict) {
            return new Promise((resolve, _) => {
                resolve(this.contentsCacheDict[contentDesc.contentPath])
            })
        }

        return fetch(contentDesc.contentPath)
            .then(response => {
                return response.json()
            }).then(content => {
                content.authors = contentDesc.authors
                content.tags = contentDesc.tags
                content.publishedOn = contentDesc.publishedOn
                this.contentsCacheDict[contentDesc] = content
                return content
            })
    }

    setupAuthorsList() {
        this.authorsList = this.contentsList.reduce((acc, content) => {
            content.authors.forEach(authorName => {
                acc[authorName] = true
            })

            return acc
        }, { all: true })
    }

    setupTagsList() {
        this.tagsList = this.contentsList.reduce((acc, content) => {
            content.tags.forEach(tagName => {
                acc[tagName] = true
            })

            return acc
        }, { all: true })
    }
}
