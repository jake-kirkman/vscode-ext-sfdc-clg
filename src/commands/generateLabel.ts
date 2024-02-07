/*=========================================================
        Imports
=========================================================*/

import {Command, CommandStep} from './_command';
import * as vscode from 'vscode';
import * as CONSTANTS from '../libs/constants';
import * as sfLabelHandler from '../handlers/sfLabelHandler';
import Label from '../models/label';

/*=========================================================
        Classes
=========================================================*/

export class GenerateLabelCommand extends Command {

    //Constructor
    constructor() {
        super('sfdc-clg.generate-label-from-selected-text', 'SFDX-CLG: Generate Label From Selected Text');
    }

    //Methods
    async initialiseSteps(): Promise<CommandStep[]> {
        let selectedText: string | undefined;
        let xmlDoc: Document;
        let labelName: string;
        return [
            new CommandStep(
                {
                    Label: 'Obtaining Selected Text',
                    Name: 'ObtainSelectedText',
                    OnProcess: async () => {
                        let possibleSelection = vscode.window.activeTextEditor?.selection;
                        if(undefined != possibleSelection && possibleSelection.start.compareTo(possibleSelection.end) != 0) {
                            selectedText = vscode.window.activeTextEditor?.document.getText(possibleSelection);
                        }
                        if(undefined == selectedText) {
                            return 'You have not selected any text';
                        } 
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Parsing labels file',
                    Name: 'ParsingLabelsFile',
                    OnProcess: async () => {
                        try {
                            xmlDoc = sfLabelHandler.parseStringToXML(sfLabelHandler.fetchSalesforceLabelFile()!);
                        } catch(ex) {
                            console.error(ex);
                        }
                        if(undefined == xmlDoc) {
                            return 'Unable to parse XMLDoc';
                        }
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Prompting for LabelName',
                    Name: 'PromptingForLabelName',
                    OnProcess: async () => {
                        let input = await vscode.window.showInputBox({
                            title:'What would you like to name your new label?', 
                            placeHolder: 'e.g. MyApexClass_MyLabel',
                            prompt: 'NB: should not include spaces'
                        });
                        if(undefined == input) {
                            return 'Label name was undefined, please input a proper name';
                        } else {
                            labelName = input;
                        }
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Sanatising Selected Text',
                    Name: 'SanatiseText',
                    OnProcess: async () => {
                        if(selectedText?.startsWith('\'')) {
                            selectedText = selectedText.substring(1);
                        }
                        if(selectedText?.endsWith('\'')) {
                            selectedText = selectedText.substring(0, selectedText.length - 1);
                        }
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Adding label to XML Doc',
                    Name: 'AddingLabel',
                    OnProcess: async () => {
                        let labelDetail: Label = {
                            FullName: labelName,
                            ShortDescription: labelName,
                            Language: vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_DEFAULT_LANGUAGE)!,
                            Protected: vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_NEW_LABELS_BE_PROTECTED)!,
                            Value: selectedText!,
                            Category: ''
                        };
                        sfLabelHandler.addLabel(xmlDoc, labelDetail);
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Saving Data',
                    Name: 'SavingData',
                    OnProcess: async () => {
                        sfLabelHandler.upsertLabelFile(sfLabelHandler.serializeDocument(xmlDoc));
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Replacing data in editor',
                    Name: 'ReplaceData',
                    OnProcess: async () => {
                        await vscode.window.activeTextEditor?.edit((pEdit) => {
                            pEdit.replace(
                                vscode.window.activeTextEditor?.selection!, 
                                `${
                                    vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_APEX_REPLACE_PREFIX)
                                }${
                                    labelName
                                }`
                            );
                        });
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Showing success message',
                    Name: 'Success',
                    OnProcess: async () => {
                        vscode.window.showInformationMessage(`Successfully created label called '${labelName}'`);
                    }
                }
            )
        ];
    }

}