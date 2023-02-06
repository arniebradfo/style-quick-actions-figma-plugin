# Style Quick Actions Figma Plugin
Quick actions for applying styles

(Under Development)

## Input Strategy
`⌘/` > `Quick Styles` > `fill | stroke | grid | effect | typography` > `fuzzy/find/style-name`
- fill | stroke | grid | effect | typography
  - fuzzy find filename `Library > folder/style-name`
  - error: styles have the same name?

- Manage Styles
  - use published styles in this file
    - toggle library by name, checkbox icon show what is currently active
      - success: 
        - toggled on: 'File Name' styles are now available in this file
        - toggled off: 'File Name' styles are no longer available in this file
      - errors: none?
    - errors:
      - no published styles
  - publish current file's styles for use in other files
    - success: (Updated) Published styles as 'File Name'. To use these styles in another file, select the name in 'Manage Styles'.
      - 'Published...' if its a new file
      - 'Updated published...' if its a file already in the registry
    - errors:
      - no styles to publish
  - delete published styles from plugin registry
    - success: ''
  - ? what happens to deleted files ?
  - ? what happens to unpublished files ?

## TODO:
- create a Map of style names to key
- get local styles with `getLocal{Type}Styles()`
- get team library styles by?
  - calling `importStyleByKeyAsync()`
- get team library ids by
  - parsing all nodes in the document async, and collecting a map of ids?
  - providing command to
    - parse document and collect all currently used styles (slow)
      - `setPluginData` local to the file
    - save/update styles from the current document for use in other documents
      - in `figma.clientStorage`
    - delete saved styles
      - from `figma.clientStorage`
    - use/remove a saved library per file
      - 

path:
