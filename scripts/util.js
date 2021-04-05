'use strict';

export default class Util {
    static range(start, stop, step) {
        return Array.from({ length: (stop - start) / step }, (_, i) => start + (i * step))
    }

    static retrieveOrDefault(obj, key, defaultValue) {
        if (obj.hasOwnProperty(key)) {
            return obj[key]
        } else {
            return defaultValue
        }
    }

    static removeAllChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }

    static removeExtension(path) {
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        const lastDotIndex = fileName.lastIndexOf(".")
        return lastDotIndex != -1 ? fileName.substring(0, lastDotIndex) : fileName
    }

    static clone(object) {
        return JSON.parse(JSON.stringify(object))
    }

    static haveSameKeys(obj1, obj2) {
        const equalLength = Object.keys(obj1).length === Object.keys(obj2).length
        const hasSameKeys = Object.keys(obj1).reduce((acc, tag) => {
            return acc & typeof obj2[tag] !== "undefined"
        }, true)

        return equalLength & hasSameKeys
    }
}