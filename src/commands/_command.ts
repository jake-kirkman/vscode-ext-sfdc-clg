/*=========================================================
        Imports
=========================================================*/

import * as vscode from 'vscode';
import * as dataHandler from '../handlers/dataHandler';
import * as logHandler from '../handlers/logHandler';

/*=========================================================
        Classes
=========================================================*/

export abstract class Command {

    //Vars
    CommandName: string;
    CommandLabel: string;

    //Constructor
    constructor(pCommandName: string, pCommandLabel: string) {
        this.CommandName = pCommandName;
        this.CommandLabel = pCommandLabel;
    }

    //Abstract Methods
    abstract initialiseSteps(): Thenable<CommandStep[]>;

    //Methods
    async executeCommand(...pArgs: any) {
        try {
            let progressMessage = `Executing ${this.CommandLabel || 'Command'}`;
            logHandler.log(`Executing Command: ${this.CommandLabel} [${this.CommandName}]`);

            //Create wait dialog
            await vscode.window.withProgress(
                {
                    title: progressMessage, 
                    cancellable: true, 
                    location: vscode.ProgressLocation.Notification
                }, async (
                    pProgress: vscode.Progress<{message:string, increment: number}>, 
                    pCancellationToken: vscode.CancellationToken
                ) => {
                    //Get list of steps for command
                    let commandSteps: CommandStep[] = await this.initialiseSteps();
                    logHandler.log(`Command Steps:`);
                    commandSteps.forEach(step => logHandler.log(`Step: ${step.Label} [${step.Name}]`))

                    //Vars
                    let processedSteps: CommandStep[] = [];
                    let stepIncrement: number = 100 / commandSteps.length;

                    //Process Steps
                    for(let step of commandSteps) {
                        //See if command has been cancelled
                        if(pCancellationToken.isCancellationRequested) {
                            logHandler.log(`Command cancelled on step ${step.Label} [${step.Name}]`);
                            break;
                        }
                        //Loop Vars
                        let stepProcessor: Thenable<string | void> | undefined;
                        //See if step is valid
                        if(step.OnCondition == undefined || await step.OnCondition.call(this, processedSteps)) {
                            //Process step
                            progressMessage = step.Label;
                            stepProcessor = step.OnProcess.call(this, ...pArgs);
                        }
                        //Fire Progress
                        pProgress.report({message: progressMessage, increment: stepIncrement});
                        //Await step
                        if(stepProcessor != undefined) {
                            let errorMessage;
                            try {
                                errorMessage = await stepProcessor;
                            } catch(ex: Error | any) {
                                errorMessage = `Unhandled exception occurred during step ${step.Name}: ${ex.message || JSON.stringify(ex)}`;
                            }
                            if(errorMessage != undefined) {
                                logHandler.error(`Command Failed [${this.CommandLabel}]: ${errorMessage}`);
                                vscode.window.showErrorMessage(`Command [${this.CommandLabel}] failed due to: ${errorMessage}`);
                                return;
                            }
                        }

                    }
                }
            );

        } catch(ex: any) {
            logHandler.error(JSON.stringify(ex));
            console.error(ex);
            if(undefined != ex.message) {
                vscode.window.showErrorMessage(`Command "${this.CommandLabel}" failed due to: ${ex.message} `)
            }
        }
    }

    registerCommand() {
        dataHandler.getExtensionContext().subscriptions.push(
            vscode.commands.registerCommand(
                this.CommandName,
                this.executeCommand,
                this
            )
        )
    }

}

export class CommandStep {

    Label: string;
    Name: string;
    OnProcess: (...pArgs: any[]) => Thenable<string | void>; //Returns error message, undefined if success
    OnCondition?: (pPreviousSteps: CommandStep[]) => Thenable<Boolean> | undefined; //Function returns boolean of whether it's applicable

    constructor(
        pStepOptions: {
            Label: string, 
            Name:string, 
            OnProcess: (...pArgs: any[]) => Thenable<string | void>, 
            OnCondition?: (pPreviousSteps: CommandStep[]) => Thenable<Boolean> | undefined
        }
    ) {
        this.Label = pStepOptions.Label;
        this.Name = pStepOptions.Name;
        this.OnProcess = pStepOptions.OnProcess;
        this.OnCondition = pStepOptions.OnCondition;
    }

}