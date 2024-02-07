/*=========================================================
        Imports
=========================================================*/

/*=========================================================
        Methods
=========================================================*/

export function appendTextNode(pDoc: Document, pParentElement: Element, pTagName: string, pText: string): void {
    let element = pDoc.createElement(pTagName);
    element.textContent = pText;
    pParentElement.appendChild(element);
}