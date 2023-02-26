import { publishStyles } from './publishStyles';
import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { searchSuggestions } from './utils';

enum Command {
	Fill = 'fill',
	Stroke = 'stroke',
	Text = 'text',
	Effect = 'effect',
	Grid = 'grid',
	ToggleStyle = 'toggle',
	PublishStyle = 'publish',
	DeleteStyle = 'delete',
}
type Key = Command;

type _RunEvent = {
	command: Command;
	parameters: Record<Command, string>;
};

figma.on('run', (event: RunEvent) => {
	const { selection } = figma.currentPage;
	const { command, parameters } = event as _RunEvent;
	const styleId = parameters?.[command] || '';

	console.log({
		command,
		parameters,
		style: figma.getStyleById(styleId),
		selection,
	});

	switch (command) {
		case Command.Fill:
			selection.forEach((node) => {
				if ('fillStyleId' in node) node.fillStyleId = styleId;
			});
			break;
		case Command.Stroke:
			selection.forEach((node) => {
				if ('strokeStyleId' in node) node.strokeStyleId = styleId;
			});
			break;
		case Command.Text:
			selection.forEach((node) => {
				if ('textStyleId' in node) node.textStyleId = styleId;
			});
			break;
		case Command.Effect:
			selection.forEach((node) => {
				if ('effectStyleId' in node) node.effectStyleId = styleId;
			});
			break;
		case Command.Grid:
			selection.forEach((node) => {
				if ('gridStyleId' in node) node.gridStyleId = styleId;
			});
			break;
		case Command.ToggleStyle:
			figma.notify("Styles from 'Filename' are now available in this file");
			break;
		case Command.PublishStyle:
			publishStyles();
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

figma.parameters.on('input', ({ parameters, key: _key, query, result }: ParameterInputEvent) => {
	const key = _key as Key;
	console.log({ parameters, key, query, result });
	switch (key) {
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
