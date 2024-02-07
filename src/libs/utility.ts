/*=========================================================
        Imports
=========================================================*/

import { exec } from 'child_process';
import * as CONSTANTS from '../libs/constants';

/*=========================================================
        Methods
=========================================================*/

export function sortObject(pValA: any, pValB: any, pProperty: {property: string, direction: string}|{property: string, direction: string}[]): number {

    //Grab property value
    let propertyInfo = Array.isArray(pProperty) ? (pProperty = [...pProperty]).shift() : pProperty;

    //Validate
    if(null == propertyInfo) {
        throw new Error('Sorting information is null');
    } else if(null == propertyInfo.property) {
        throw new Error('Property to sort is null');
    }

    //Easy sorts:
    if(pValA == undefined && pValB == undefined) return 0
    else if(pValA != undefined && pValB == undefined) return 1
    else if(pValA == undefined && pValB != undefined) return -1
    
    //Sort!
    if(pValA[propertyInfo.property] == pValB[propertyInfo.property]) {
        return Array.isArray(pProperty) && pProperty.length > 0 ? sortObject(pValA, pValB, pProperty) : 0;
    } else {
        let directionModifier = propertyInfo.direction == null || propertyInfo.direction == CONSTANTS.SORT_ASCENDING ? 1 : -1;
        return pValA[propertyInfo.property] < pValB[propertyInfo.property] ? (-1 * directionModifier) : (1 * directionModifier);
    }
}

export function openUrl(pUrl: string) {
    return new Promise<void>((pResolve, pReject) => {
        let process = exec(`start ${pUrl}`);
        process.on('error', pReject);
        process.on('close', (pCode) =>{
            if(pCode == 0) {
                pResolve();
            } else {
                pReject(new Error(`Process exited with status code ${pCode}`))
            }
        })
    })
}