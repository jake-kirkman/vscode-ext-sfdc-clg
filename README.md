# Introduction to Salesforce Custom Label Generator (SFDC-CLG)

Quick VSCode plugin to quickly create new Custom Labels from within the VSCode text editor, which adds the new label to your `CustomLabels.labels-meta.xml` using your selected text as the label value and prompting you for a label name. An optional feature will also allow you to replace your selected text with the label automatically.

## Features

- Command: `Generate Label From Selected Text`
  - Uses your selected text as the value of your new custom label, defaults label fields to values found in config, and based on config, will prompt for Label/ShortDescription/Language/Category, it will then update your `CustomLabels.labels-meta.xml` metadata with the new label, and dependant on whether the config flag is enabled, replaces your selected text with the new label
  - This command is also added to the context menu for Javascript and Apex languages to make generating a label simpler

## Usage

This extension relies on there being selected text in your current active editor, and can be activated either through the context menu selecting the "Generate label from selected text", or running the `SFDX-CLG: Generate Label From Selected Text` in the command pallette.
Once a label is added to your metadata, you'll have to manually deploy the file to your Salesforce instance before being able to access it in other bits of metadata.

![Gif showcasing the usage of the extension](/media/dbb7ca53-7a91-4279-8bac-558904e71b76.gif)

## Extension Settings

* `sfdc-clg.prompts.language` - Should the Generate Label command prompt for Language
* `sfdc-clg.prompts.protected` - Should the Generate Label command prompt for Protected
* `sfdc-clg.prompts.short-description` - Should the Generate Label command prompt for Short Description
* `sfdc-clg.prompts.category` - Should the Generate Label command prompt for Category
* `sfdc-clg.defaults.language` - What should the default be for Language
* `sfdc-clg.defaults.protected` - What should the default be for Protected
* `sfdc-clg.defaults.category` - What should the default be for Category
* `sfdc-clg.replacements.replace-selected-text-with-label` - When generating a label has finished, should the selected text be replaced with the Label prefix + label name?
* `sfdc-clg.replacements.replace-prefix` - If replacement is enabled, what should be the prefix?
* `sfdc-clg.paths.label-metadata-location` - Path to your `CustomLabels.labels-meta.xml` file relative to your workspace
* `sfdc-clg.config.sort-labels-on-generation` - When adding a new label, should all labels be sorted or just add the new label to the bottom of the label array

## Release Notes

### 1.0.0

Initial release