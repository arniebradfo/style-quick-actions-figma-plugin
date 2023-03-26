import { getLibraryPaintStyles, setLibrarySuggestions } from './manageStyles';
import { mapPaintStyleToStorage, StoragePaintStyle } from './mapStyle';
import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { InputCommand, InputKey, StyleSuggestion, SuggestionData } from './types';
import { searchSuggestions, Suggestion } from './utils';

export const onInput = async ({ parameters, key: _key, query, result }: ParameterInputEvent) => {
	const key = _key as InputKey;
	console.log({ parameters, key, query, result });
	result.setLoadingMessage('Loading Options'); // doesn't run
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

let allPaintStyleSuggestions: StyleSuggestion[] | null = null;
async function setPaintSuggestions(result: SuggestionResults, query?: string) {
	if (allPaintStyleSuggestions == null) {
		// memoize allPaintStyleSuggestions
		const localPaintStyles = figma.getLocalPaintStyles().map(mapPaintStyleToStorage);
		const remotePaintStyles = await getLibraryPaintStyles();

		// TODO: clean up this repeat code
		allPaintStyleSuggestions = localPaintStyles.map((style) => ({
			data: {
				source: 'local',
				id: style[0],
			},
			name: style[1],
			icon: svgIconPaint(style),
		}));
		allPaintStyleSuggestions = allPaintStyleSuggestions.concat(remotePaintStyles.map((style) => ({
			data: {
				source: 'remote',
				id: style[0],
			},
			name: style[1],
			icon: svgIconPaint(style),
		})));
	}
	result.setSuggestions(searchSuggestions(query, allPaintStyleSuggestions));
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
