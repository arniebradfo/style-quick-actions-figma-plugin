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
- other color functions: maybe '=' char then...
  - hex by typing '#' then number
  - change hsl by typing '+' 'a10'
- add to style names
  - text size and line height "• 12/Auto"
- hide/disable local library from toggle 
  - maybe its just always toggled on?
- storage size
  - test the size limits of storage
  - notify user if size is too large
  - save size as part of the storage meta
  - display size 
- what if there are no libraries to toggle or delete?
- what if two libraries have the same name?
