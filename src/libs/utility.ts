/*=========================================================
        Imports
=========================================================*/

import { exec } from 'child_process';
import * as CONSTANTS from '../libs/constants';

// using cross-spawn to mitigate against windows issues with spawn - https://www.npmjs.com/package/cross-spawn
import * as spawn from 'cross-spawn';
import * as path from 'path';

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

// Use this for spawning a child process to kick off our sfdx commands, given
// how much data can be spat back spawn seemed the logical option.
//
// This will likely need tweaking, I think we could do with passing in a
// callback for shell.stdout.on to make this a little better
export function runCommand(processName: string, args: string[], writeToConsole: boolean, errorMsg: string) {
    return new Promise(async (resolve, reject) => {
        const shell = spawn(processName, args, {
            // stdio take 3 args, stdin, stdout, stderr - we inherit stdin from
            // the parent process, means we can provide input to the child if
            // prompted
            stdio: ["inherit"],
            windowsHide: true
        });

        // Put this here mainly to write the JSON from the child process back to
        // main, again might be recatored by utilising a callback
        let stdoutResult = '';

        // something has gone horribly wrong with the child process
        shell.on('error', reject);

        // Build JSON String - well it writes all output regardless of call
        // which is horrific but thats why I originally slammed this in here -
        // again specific callback for this is prolly the way forward
        shell.stdout?.on('data', (data: any) => {
            if(writeToConsole) process.stdout.write(data);

            stdoutResult += data.toString()
        });
        if(writeToConsole) {
            shell.stderr?.on('data', (data: any) => process.stderr.write(data));
        }

        shell.on('exit', (code: number) => {
            // exit code from the child process, 0 success, 1 error - should an
            // sfdx command fail it will handily return 1 rather than the child
            // process full on bailing
            //
            // note we resolve with the massive string of output from the child
            // process, we could get the installed package job ids from this -
            // again lets write a specific callback to handle it or something
             code ? reject(new Error(errorMsg)) : resolve(stdoutResult);
        });
    });
}