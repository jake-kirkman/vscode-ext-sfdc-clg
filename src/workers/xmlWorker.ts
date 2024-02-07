/*=========================================================
        Imports
=========================================================*/

/*=========================================================
        Constants
=========================================================*/

const XML_ESCAPES: {[key: string]: string} = {
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
};

/*=========================================================
        Methods
=========================================================*/

export function appendTextNode(pDoc: Document, pParentElement: Element, pTagName: string, pText: string): void {
    let element = pDoc.createElement(pTagName);
    element.textContent = pText;
    pParentElement.appendChild(element);
}

export function escapeXml(pText: string): string {
    return pText?.replace(/[&'"<>]/g, s => XML_ESCAPES[s]) || '';
}