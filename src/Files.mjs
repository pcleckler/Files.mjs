"use strict";

import {HTML} from "./HTML.mjs";

// noinspection GrazieInspection
export class Files {

    static ContentTypes = {
        Json: "application/json",
        Text: "text/plain",
    }

    /**
     * Converts a value into a filename containing only valid filename characters. "Similar" characters are used to replace invalid filename characters:<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;\ -> [<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;/ -> ]<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;: -> ;<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;\* -> #<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;? -> $<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;" -> '<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;\< -> {<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;\> -> }<br />
     * &nbsp;&nbsp;&nbsp;&nbsp;\| -> !
     * @param {string} value The value to become a valid filename.
     * @returns {string}
     */
    static GetCleanFilename(value) {

        const replacement = {
            "\\" : "]",
            "/" : "[",
            ":" : ";",
            "*" : "#",
            "?" : "$",
            "\"" : "'",
            "<" : "{",
            ">" : "}",
            "|" : "!"
        };

        let returnValue = [];

        for (let i = 0; i < value.length; i++) {
            let c = value[i];

            if (c in replacement) {
                returnValue.push(replacement[c]);
            } else {
                returnValue.push(c);
            }
        }

        return returnValue.join("");
    }

    /**
     * Prompts the user to download a file generated from application data.
     * @param {string} contentType The MIME type of the file to be downloaded.
     * @param {string} filename The proposed filename for the file.
     * @param {string} data The textual contents of the file.
     */
    static Download(contentType, filename, data) {

        let anchor = HTML.Create({
            tag: "A",
            attributes: {
                style:    "display: none;",
                href:     `data:${contentType};charset=utf-8,${encodeURIComponent(data)}`,
                download: `${this.GetCleanFilename(filename)}`,
            }
        });

        document.body.appendChild(anchor);

        anchor.click();

        document.body.removeChild(anchor);
    }

    /**
     * Prompts the user to upload a file.
     * @param {Array.<string>} acceptedExtensions A list of acceptable extensions for upload.
     * @param {function} onDataAvailable A function with a single parameter that will accept the uploaded data.
     */
    static Upload(acceptedExtensions, onDataAvailable) {

        if (acceptedExtensions == null) {
            acceptedExtensions = [".*"];
        }

        let acceptedExtensionsAttribute = "";

        for (let i = 0; i < acceptedExtensions.length; i++) {

            if (i > 0) {
                acceptedExtensionsAttribute += ",";
            }

            let extension = acceptedExtensions[i];

            if (extension.substring(0,1) !== '.') {
                extension = `.${extension}`
            }

            acceptedExtensionsAttribute += extension;
        }

        let filePicker = HTML.Create({tag: "input", attributes: {type: "file", style: "position: absolute; top: 0px; left: 0px; display: none;", accept: acceptedExtensionsAttribute}});

        filePicker.addEventListener("change", function(e){

            let file = e.target.files[0];

            let reader = new FileReader();

            reader.addEventListener("load", (event) => {

                if (onDataAvailable !== null) {
                    onDataAvailable(event.target.result);
                }

            }, false);

            reader.readAsText(file);

        }, false);

        document.body.appendChild(filePicker);

        filePicker.click();

        document.body.removeChild(filePicker);
    }
}