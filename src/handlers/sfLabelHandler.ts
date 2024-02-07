/*=========================================================
        Imports
=========================================================*/

import * as xmlDom from 'xmldom';

import * as vscode from 'vscode';
import * as utility from '../libs/utility'
import * as CONSTANTS from '../libs/constants';
import * as XmlWorker from '../workers/xmlWorker';
import * as fs from 'fs';
import * as path from 'path';
import Label from '../models/label';

const xmlFormat = require('xml-formatter');

/*=========================================================
        File Functions
=========================================================*/

export function getPathToLabelFile(): string | undefined {
    let folders = vscode.workspace.workspaceFolders;
    if(undefined != folders && folders.length > 0) {
        return folders[0].uri.fsPath + vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_PATH_TO_LABELS)!
    } else {
        return undefined;
    }
}

export function fetchSalesforceLabelFile(): string | undefined {
    let file;
    let filePath = getPathToLabelFile();
    if(undefined != filePath) {
        file = fs.readFileSync(filePath).toString();
    }
    return file;
}

export function upsertLabelFile(pData: string): void {
    let filePath = getPathToLabelFile();
    if(undefined != filePath) {
        fs.writeFileSync(filePath, pData);
    }
}

/*=========================================================
        XML Functions
=========================================================*/

export function parseStringToXML(pData: string): Document {
    let parser = new xmlDom.DOMParser();
    let doc = parser.parseFromString(pData);
    return doc;
}

export function serializeDocument(pDoc: Document): string {
    let serializer = new xmlDom.XMLSerializer();
    return xmlFormat(
        serializer.serializeToString(pDoc), 
        {
            collapseContent: true
        }
    );
}

export function addLabel(pDocument: Document, pLabelData: Label) {
    let labelElement = pDocument.createElement('labels');
    XmlWorker.appendTextNode(pDocument, labelElement, 'fullName', XmlWorker.escapeXml(pLabelData.FullName));
    XmlWorker.appendTextNode(pDocument, labelElement, 'language', XmlWorker.escapeXml(pLabelData.Language));
    XmlWorker.appendTextNode(pDocument, labelElement, 'protected', '' + pLabelData.Protected);
    XmlWorker.appendTextNode(pDocument, labelElement, 'shortDescription', XmlWorker.escapeXml(pLabelData.ShortDescription));
    XmlWorker.appendTextNode(pDocument, labelElement, 'value', XmlWorker.escapeXml(pLabelData.Value));
    pDocument.documentElement.appendChild(labelElement);
}

export function sortLabels(pDocument: Document) {
    //Init vars
    let sortingArray: {Element: Node, Name: string}[] = [];
    let labelElements = pDocument.documentElement.childNodes;
    Array.from(labelElements).forEach((element) => {
        pDocument.documentElement.removeChild(element);
        if(element.hasChildNodes()) {
            let name: string | undefined;
            for(let i = 0; i < element.childNodes.length; i++) {
                let childElement = element.childNodes[i];
                if(childElement.nodeName == 'fullName' && null != childElement.textContent) {
                    name = childElement.textContent;
                    break;
                } 
            }
            if(undefined != name) {
                sortingArray.push({
                    //Clone node here because the `appendNode` doesn't append a child properly
                    //if the `parentNode` is still populated, and we've already removed it from the parent
                    //but that doesn't reflect on the node. So cloning it here fixes that issue
                    //Bit janky I know, but really this needs a much better XML parser
                    Element: element.cloneNode(true), 
                    Name: name!.toLowerCase()
                });
            }
        }
    });
    //Sort
    sortingArray.sort((pValA, pValB) => utility.sortObject(pValA, pValB, {property: 'Name', direction: CONSTANTS.SORT_ASCENDING}));
    //Re-add elements
    sortingArray.forEach(pItem => {
        // console.log(`##Item : pElement : `, pItem.Element);
        pDocument.documentElement.appendChild(pItem.Element);
    });
}