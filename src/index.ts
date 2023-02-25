import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { searchSuggestions } from './utils';

figma.on('run', (event: RunEvent) => {
	const { selection } = figma.currentPage;
	const {command, parameters } = event;
	const { parameterOne, parameterTwo } = parameters as ParametersType;

	const styleId = parameterTwo; // figma.getStyleById(parameterTwo)?.id;
	console.log({
		command,
		parameters,
		style: figma.getStyleById(parameterTwo),
		selection,
	});

	switch (parameterOne) {
		case Command.Fill:
			selection.forEach((node) => {
				if ('fillStyleId' in node) node.fillStyleId = parameterTwo;
			});
			break;
		case Command.Stroke:
			selection.forEach((node) => {
				if ('strokeStyleId' in node) node.strokeStyleId = parameterTwo;
			});
			break;
		case Command.Text:
			selection.forEach((node) => {
				if ('textStyleId' in node) node.textStyleId = parameterTwo;
			});
			break;
		case Command.Effect:
			selection.forEach((node) => {
				if ('effectStyleId' in node) node.effectStyleId = parameterTwo;
			});
			break;
		case Command.Grid:
			selection.forEach((node) => {
				if ('gridStyleId' in node) node.gridStyleId = parameterTwo;
			});
			break;
		case Command.ToggleStyle:
			figma.notify("Styles from 'Filename' are now available in this file");
			break;
		case Command.PublishStyle:
			figma.notify(
				"(Updated) Published styles as 'File Name'. To use these styles in another file, select the name in 'Manage Styles'."
			);
			break;
		case Command.DeleteStyle:
			figma.notify('Deleted Style');
			break;
		default:
			figma.notify('Error: Invalid Command', { error: true });
			break;
	}

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
