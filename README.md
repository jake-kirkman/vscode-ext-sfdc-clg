# salesforce-custom-label-generator README

Quick VSCode plugin to quickly create new Custom Labels from within the VSCode text editor, which adds the new label to your `CustomLabels.labels-meta.xml` using your selected text as the label value and prompting you for a label name, ending in your selected text being replaced with your new label.

## Features

- Command: `Generate Label From Selected Text`
  - Uses your selected text as the value of your new custom label, defaults things to stuff found in config, asks for a Label name, then updates your CustomLabels metadata, and replaces your selected text with the new label

## Extension Settings

* `sfdc-clg.default-language`: Default Language for label
* `sfdc-clg.path-to-label`: Relative path to your `CustomLabels.labels-meta.xml`
* `sfdc-clg.apex-replace-prefix`: Prefix for when replacing the editor text (e.g the `Label.` in `Label.MyLabel`)
* `sfdc-clg.short-description-same-as-name`: Should the ShortDescription match FullName?
* `sfdc-clg.prompt-for-categories`: Prompt for categories for the new label?
* `sfdc-clg.sort-labels-after-save`: Should all labels be sorted alphabetically when a new label has been added
* `sfdc-clg.should-new-labels-be-protected`: Should Labels be marked as protected?

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release