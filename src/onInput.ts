import { getLibraryPaintStyles, setLibrarySuggestions } from './manageStyles';
import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { InputCommand, InputKey } from './types';
import { searchSuggestions } from './utils';

export const onInput = async ({ parameters, key: _key, query, result }: ParameterInputEvent) => {
	const key = _key as InputKey;
	console.log({ parameters, key, query, result });
	switch (key) {
		case InputCommand.Fill:
			await setPaintSuggestions(result, query);
			break;
		case InputCommand.Stroke:
			await setPaintSuggestions(result, query);
			break;
		case InputCommand.Text:
			setTextSuggestions(result, query);
			break;
		case InputCommand.Effect:
			setEffectSuggestions(result, query);
			break;
		case InputCommand.Grid:
			setGridSuggestions(result, query);
			break;
		case InputCommand.ToggleStyle:
			await setLibrarySuggestions(result, query, true);
			break;
		case InputCommand.PublishStyle:
			break;
		case InputCommand.DeleteStyle:
			await setLibrarySuggestions(result, query);
			break;
		default:
			break;
	}
};

async function setPaintSuggestions(result: SuggestionResults, query?: string) {
	const localPaintStyles = figma.getLocalPaintStyles();
	const remotePaintStyles = await getLibraryPaintStyles()
	const paintStyleSuggestions = localPaintStyles
		.concat(remotePaintStyles)
		.map((style) => ({
			name: style.name,
			data: style.id,
			icon: svgIconPaint(style),
			// style: ''
		}));
	result.setSuggestions(searchSuggestions(query, paintStyleSuggestions));
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
