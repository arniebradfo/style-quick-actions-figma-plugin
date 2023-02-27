import { setLibraryStyleSuggestions } from './manageStyles';
import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { searchSuggestions, Command, Key } from './utils';

export const onInput = async ({ parameters, key: _key, query, result }: ParameterInputEvent) => {
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
			await setLibraryStyleSuggestions(result, query, true);
			break;
		case Command.PublishStyle:
			break;
		case Command.DeleteStyle:
			await setLibraryStyleSuggestions(result, query);
			break;
		default:
			break;
	}
};

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
