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
        let xmlDoc: Document;
        let labelData: Partial<Label> = {
            Language: vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_DEFAULT_LANGUAGE),
            Protected: vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_DEFAULT_PROTECTED) == 'True',
            Category: vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_DEFAULT_CATEGORY),
        };
        return [
            new CommandStep(
                {
                    Label: 'Obtaining Selected Text',
                    Name: 'ObtainSelectedText',
                    OnProcess: async () => {
                        let possibleSelection = vscode.window.activeTextEditor?.selection;
                        if(undefined != possibleSelection && possibleSelection.start.compareTo(possibleSelection.end) != 0) {
                            labelData.Value = vscode.window.activeTextEditor?.document.getText(possibleSelection);
                        }
                        if(undefined == labelData.Value) {
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
                            prompt: 'NB: should not include spaces',
                            validateInput: (pVal) => {return pVal.length > 80 ? 'Name should be 80 characters or less' : undefined}
                        });
                        if(undefined == input) {
                            return 'Label name was undefined, please input a proper name';
                        } else {
                            labelData.FullName = input;
                            labelData.ShortDescription = input;
                        }
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Prompting for ShortDescription',
                    Name: 'PromptingForShortDescription',
                    OnProcess: async () => {
                        let input = await vscode.window.showInputBox({
                            title:'What should be the short description?', 
                            placeHolder: 'e.g. MyApexClass_MyLabel',
                            prompt: 'NB: should not include spaces',
                            value: labelData.ShortDescription,
                            validateInput: (pVal) => {return pVal.length > 80 ? 'Short Description should be 80 characters or less' : undefined}
                        });
                        if(undefined == input) {
                            return 'Short Description was undefined, please input a proper value';
                        } else {
                            labelData.ShortDescription = input;
                        }
                    },
                    OnCondition: async () => {
                        return vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_PROMPT_FLAG_SHORT_DESCRIPTION) as Boolean;
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Prompting for Category',
                    Name: 'PromptingForCategory',
                    OnProcess: async () => {
                        let input = await vscode.window.showInputBox({
                            title:'What should be the Category?', 
                            value: labelData.Category
                        });
                        labelData.Category = input;
                    },
                    OnCondition: async () => {
                        return vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_PROMPT_FLAG_CATEGORY) as Boolean;
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Prompting for Language',
                    Name: 'PromptingForCategory',
                    OnProcess: async () => {
                        let input = await vscode.window.showInputBox({
                            title:'What should be the Language?', 
                            value: labelData.Language
                        });
                        if(undefined == input) {
                            return 'Language was undefined, please input a proper value';
                        } else {
                            labelData.Language = input;
                        }
                    },
                    OnCondition: async () => {
                        return vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_PROMPT_FLAG_LANGUAGE) as Boolean;
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Prompting for Protected Value',
                    Name: 'PromptingForProtectedValue',
                    OnProcess: async () => {
                        let input = await vscode.window.showQuickPick(
                            [{label: 'True', picked: true == labelData.Protected }, {label: 'False', picked: false == labelData.Protected }],
                            {
                                title:'Should this label be protected?', 
                                canPickMany: false
                            }
                        );
                        if(undefined == input) {
                            return 'Protected was undefined, please input a proper value';
                        } else {
                            labelData.Protected = input.label == 'True';
                        }
                    },
                    OnCondition: async () => {
                        return vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_PROMPT_FLAG_LANGUAGE) as Boolean;
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Sanatising Selected Text',
                    Name: 'SanatiseText',
                    OnProcess: async () => {
                        if(labelData.Value?.startsWith('\'')) {
                            labelData.Value = labelData.Value.substring(1);
                        }
                        if(labelData.Value?.endsWith('\'')) {
                            labelData.Value = labelData.Value.substring(0, labelData.Value.length - 1);
                        }
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Adding label to XML Doc',
                    Name: 'AddingLabel',
                    OnProcess: async () => {
                        sfLabelHandler.addLabel(xmlDoc, labelData as Label);
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Sorting Labels',
                    Name: 'SortingLabels',
                    OnProcess: async () => {
                        sfLabelHandler.sortLabels(xmlDoc);
                    },
                    OnCondition: async () => {
                        return vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_CONFIG_SORT_LABELS) as Boolean;
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
                                    vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_REPLACEMENTS_REPLACE_PREFIX)
                                }${
                                    labelData.FullName
                                }`
                            );
                        });
                    },
                    OnCondition: async () => {
                        return vscode.workspace.getConfiguration().get(CONSTANTS.CFG_KEY_REPLACEMENTS_REPLACE_SELECTED_TEXT) as Boolean;
                    }
                }
            )
            , new CommandStep(
                {
                    Label: 'Showing success message',
                    Name: 'Success',
                    OnProcess: async () => {
                        vscode.window.showInformationMessage(`Successfully created label called '${labelData.FullName}'`);
                    }
                }
            )
        ];
    }

}