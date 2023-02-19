import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { searchSuggestions } from './utils';

figma.on('run', (event: RunEvent) => {
	// console.log(figma.currentPage.selection[0]);

	const command = event.command;
	const parameters = event.parameters as ParametersType;
	console.log({ command, parameters });
	const { parameterOne, parameterTwo } = event.parameters as ParametersType;

	switch (parameterOne) {
		case Command.Fill:
			console.log(figma.getStyleById(parameterTwo));
			break;
		case Command.Stroke:
			console.log(figma.getStyleById(parameterTwo));
			break;
		case Command.Text:
			break;
		case Command.Effect:
			break;
		case Command.Grid:
			break;
		case Command.ToggleStyle:
			break;
		case Command.PublishStyle:
			break;
		case Command.DeleteStyle:
			break;
		default:
			break;
	}

	figma.notify(
		"(Updated) Published styles as 'File Name'. To use these styles in another file, select the name in 'Manage Styles'."
	);

	// figma.currentPage.selection.forEach((node) => commandMap[command](node, parameters));
	figma.closePlugin();
});

enum Command {
	Fill,
	Stroke,
	Text,
	Effect,
	Grid,
	ToggleStyle,
	PublishStyle,
	DeleteStyle,
}
type CommandSuggestion = SuggestionObj<Command>;
type Key = 'parameterOne' | 'parameterTwo';
type ParametersType = {
	parameterOne: Command;
	parameterTwo: string;
};

const styleTypeCommands: CommandSuggestion[] = [
	{ name: `Fill`, data: Command.Fill },
	{ name: `Stroke`, data: Command.Stroke },
	{ name: `Typography`, data: Command.Text },
	{ name: `Effect`, data: Command.Effect },
	{ name: `Grid`, data: Command.Grid },
];
const manageStyleCommand = 'Manage Styles';
const manageStyleOptions: CommandSuggestion[] = [
	{ name: `${manageStyleCommand}: Toggle available published styles`, data: Command.ToggleStyle },
	{ name: `${manageStyleCommand}: Publish current file's styles`, data: Command.PublishStyle },
	{ name: `${manageStyleCommand}: Delete a published style`, data: Command.DeleteStyle },
];
const initialSuggestions = styleTypeCommands.concat(manageStyleOptions);

figma.parameters.on('input', ({ parameters, key: _key, query, result }: ParameterInputEvent<ParametersType>) => {
	const key = _key as Key;
	console.log({ parameters, key, query, result });

	if (key === 'parameterOne') {
		result.setSuggestions(searchSuggestions(query, initialSuggestions));
	} else if (key === 'parameterTwo') {
		switch (parameters.parameterOne) {
			case Command.Fill:
				setPaintSuggestions(result, query);
				break;
			case Command.Stroke:
				setPaintSuggestions(result, query);
				break;
			case Command.Text:
				setTextSuggestions(result, query);
				break;
			case Command.Effect:
				setEffectSuggestions(result, query);
				break;
			case Command.Grid:
				setGridSuggestions(result, query);
				break;
			case Command.ToggleStyle:
				break;
			case Command.PublishStyle:
				break;
			case Command.DeleteStyle:
				break;
			default:
				break;
		}
	}
});
function setPaintSuggestions(result: SuggestionResults, query?: string) {
	const paintStyles = figma.getLocalPaintStyles().map((style) => ({
		name: style.name,
		data: style.id,
		icon: svgIconPaint(style),
	}));
	result.setSuggestions(searchSuggestions(query, paintStyles));
}

function setTextSuggestions(result: SuggestionResults, query?: string) {
	const textStyles = figma.getLocalTextStyles().map((style) => ({
		name: style.name, // 00/Auto
		data: style.id,
		icon: svgIconText(style),
	}));
	result.setSuggestions(searchSuggestions(query, textStyles));
}

function setGridSuggestions(result: SuggestionResults, query?: string) {
	const gridStyles = figma.getLocalGridStyles().map((style) => ({
		name: style.name,
		data: style.id,
		icon: svgIconGrid(style),
	}));
	result.setSuggestions(searchSuggestions(query, gridStyles));
}

function setEffectSuggestions(result: SuggestionResults, query?: string) {
	const effectStyles = figma.getLocalEffectStyles().map((style) => ({
		name: style.name,
		data: style.id,
		icon: svgIconEffect(style),
	}));
	result.setSuggestions(searchSuggestions(query, effectStyles));
}
