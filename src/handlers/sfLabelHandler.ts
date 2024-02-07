/*=========================================================
        Imports
=========================================================*/

import * as xmlDom from 'xmldom';

import * as vscode from 'vscode';
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
    XmlWorker.appendTextNode(pDocument, labelElement, 'fullName', pLabelData.FullName);
    XmlWorker.appendTextNode(pDocument, labelElement, 'language', pLabelData.Language);
    XmlWorker.appendTextNode(pDocument, labelElement, 'protected', '' + pLabelData.Protected);
    XmlWorker.appendTextNode(pDocument, labelElement, 'shortDescription', pLabelData.ShortDescription);
    XmlWorker.appendTextNode(pDocument, labelElement, 'value', pLabelData.Value);
    pDocument.documentElement.appendChild(labelElement);
}

export function sortLabels() {

}