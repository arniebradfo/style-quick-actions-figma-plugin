![Cover Art](./assets/CoverArt.png)

# Style Quick Actions - Figma Plugin
Quick actions for applying styles to selected including Text, Fill, Stroke, Effect, and Grid. Works with local styles and published Team Library styles.

Local styles will always be quickly available. No management necessary. Read below to learn how to use Team Library Styles from other files.

If you want to use this plugin, visit the [Figma Plugin Page](https://www.figma.com/community/plugin/1227005108437065902).

## Build
To build this project, you need `node`, `npm` and `yarn` installed.
```zsh
yarn install # install dependencies
yarn start # to start the app in watch mode
```

## Recommended Use

### Quick Key Combos
To quickly select the commands from the quick actions input, type:
- `qfl` for Fill
- `qsk` for Stroke
- `qtx` for Text
- `qgd` for Grid
- `qef` for Effect

For example, to set a Fill quickly, type: `⌘/` > `qfl` > `pri-blu-1` to match 'primary-blue-fill-01'

### Key Bindings
You can set custom keybindings on MacOS that will automatically open one of the style fills. This is probably possible on Windows too, but I don't know the details.

- Navigate to: System Preferences > Keyboard > Shortcuts > App Shortcuts > click "+"
- Select Application: "Figma.app" and set shortcut for plugin commands by pasting in the "Menu Title" in this format: `Plugins->Plugin Name->Plugin Command`
  
I prefer to set the actions for setting Fill, Stroke, and Text to:
- `⌃F` - Fill - `Plugins->Style Quick Actions->Fill`
- `⌃S` - Fill - `Plugins->Style Quick Actions->Stroke`
- `⌃T` - Fill - `Plugins->Style Quick Actions->Text`

[Read more on Apple Support](https://support.apple.com/guide/mac-help/create-keyboard-shortcuts-for-apps-mchlp2271/mac)

## Using Published Figma Team Library Styles

To use Team Library Styles in another file
- Publish your file as a [Figma 'Team Library'](https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma)
- Publish your file by running 'Style Quick Actions > Publish Library Styles'
- In the another file, run 'Style Quick Actions > Toggle Library Styles' and select the library
- The Styles will now be available in the Fill, Stroke, Text, Effect, and Grid Style selectors

You will have to update Published Styles every time the Team Library Styles are updated. 
- Update Published Styles by running 'Style Quick Actions > Publish Library Styles' again.

Delete styles by running 'Style Quick Actions > Remove Library Styles'

Caveats:
- Library Styles are saved in this plugin based on their source file name. If that file name changes, the plugin will treat it as a new Published Library Style. If you change the a source file name, delete the old one and re-publish.
- There is a [max memory limit of 1MB for each plugin](https://www.figma.com/plugin-docs/api/figma-clientStorage/#:~:text=Each%20plugin%20gets%20a%20total%20of%201MB%20of%20storage). This means there is a limited number of styles you can publish via this plugin. There is a percentage % next to the Published Style name that displays how much of the total memory each Library takes up.
- You can't Toggle Published Styles in their own source library. Those styles are always available locally.


## TODO:
- Deprecated APIs: https://www.figma.com/plugin-docs/updates/2024/02/21/version-1-update-87/
- stroke icon should have a white dot in the center
- better instructions in a wiki, with images - in Playground File

- support variables
  - Test more?
  - show correct color based on variable mode - look at selected item, its mode, and select the correct instance of color based on that mode? This would require saving more information?
  - add collection name to path? This is not what figma does

- apply fill and text style to subset of highlighted text
- put library stats first? sometimes the Library names are very long...
  - or truncate name by char count?
- other color functions: maybe '=' char then...
  - hex by typing '#' then number
  - change hsl by typing '+' 'a10'

--- 

![Icon](./assets/Icon.svg)
