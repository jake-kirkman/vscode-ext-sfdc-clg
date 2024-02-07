/*
 * This declaration is due to the XML formatter package having some wonky types
 * as the TS import is simply `import xmlFormat from 'xml-formatter'`, however
 * when this converts to JS it modified the `xmlFormat` function to `xmlFormat.default`
 * that doesn't exist. So declaring the module here means TS will just leave it as a function
 */
declare module 'xml-formatter'; 