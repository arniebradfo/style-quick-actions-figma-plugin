import {
	getLibraryEffectStyles,
	getLibraryGridStyles,
	getLibraryPaintStyles,
	getLibraryTextStyles,
	setLibrarySuggestions,
} from './manageStyles';
import {
	mapEffectStyleToStorage,
	mapGridStyleToStorage,
	mapPaintStyleToStorage,
	mapStyleToStorageLocal,
	mapTextStyleToStorage,
} from './mapStyle';
import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { InputCommand, InputKey } from './types';
import { mapDisplayName, searchSuggestions, StyleSuggestion, Suggestion } from './suggestion';

export const onInput = async ({ parameters, key: _key, query, result }: ParameterInputEvent) => {
	const key = _key as InputKey;
	console.log({ parameters, key, query, result });
	result.setLoadingMessage('Loading Options'); // doesn't appear
	switch (key) {
		case InputCommand.Fill:
			await setPaintSuggestions(result, query);
			break;
		case InputCommand.Stroke:
			await setPaintSuggestions(result, query);
			break;
		case InputCommand.Text:
			await setTextSuggestions(result, query);
			break;
		case InputCommand.Effect:
			await setEffectSuggestions(result, query);
			break;
		case InputCommand.Grid:
			await setGridSuggestions(result, query);
			break;
		case InputCommand.ToggleStyle:
			await setLibrarySuggestions(result, query, true);
			break;
		case InputCommand.PublishStyle:
			// no input
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
		const localStyles = figma.getLocalPaintStyles().map(mapStyleToStorageLocal(mapPaintStyleToStorage));
		const remoteStyles = await getLibraryPaintStyles();
		allPaintStyleSuggestions = [...localStyles, ...remoteStyles].map((style) => ({
			data: {
				source: style[4] ? 'local' : 'remote',
				id: style[0],
				displayName: `${style[1]} · ${style[4] ? '[local]' : ''}`,
			},
			name: style[1],
			icon: svgIconPaint(style),
		}));
	}
	result.setSuggestions(searchSuggestions(query, allPaintStyleSuggestions, mapDisplayName));
}

let allTextStyleSuggestions: StyleSuggestion[] | null = null;
async function setTextSuggestions(result: SuggestionResults, query?: string) {
	// if (!allTextStyleSuggestions) { // Memoize
	const localStyles = figma.getLocalTextStyles().map(mapStyleToStorageLocal(mapTextStyleToStorage));
	const remoteStyles = await getLibraryTextStyles();
	allTextStyleSuggestions = [...localStyles, ...remoteStyles].map((style) => ({
		data: {
			source: style[4] ? 'local' : 'remote',
			id: style[0],
			displayName: `${style[1]} · ${style[4] ? '[local]' : ''}`,
		},
		name: style[1],
		icon: svgIconText(style),
	}));
	// }
	result.setSuggestions(searchSuggestions(query, allTextStyleSuggestions));
}

let allGridStyleSuggestions: StyleSuggestion[] | null = null;
async function setGridSuggestions(result: SuggestionResults, query?: string) {
	const localStyles = figma.getLocalGridStyles().map(mapStyleToStorageLocal(mapGridStyleToStorage));
	const remoteStyles = await getLibraryGridStyles();
	allGridStyleSuggestions = [...localStyles, ...remoteStyles].map((style) => ({
		data: {
			source: style[4] ? 'local' : 'remote',
			id: style[0],
			displayName: `${style[1]} · ${style[4] ? '[local]' : ''}`,
		},
		name: style[1],
		icon: svgIconGrid(style),
	}));
	result.setSuggestions(searchSuggestions(query, allGridStyleSuggestions));
}

let allEffectStyleSuggestions: StyleSuggestion[] | null = null;
async function setEffectSuggestions(result: SuggestionResults, query?: string) {
	const localStyles = figma.getLocalEffectStyles().map(mapStyleToStorageLocal(mapEffectStyleToStorage));
	const remoteStyles = await getLibraryEffectStyles();
	allEffectStyleSuggestions = [...localStyles, ...remoteStyles].map((style) => ({
		data: {
			source: style[4] ? 'local' : 'remote',
			id: style[0],
			displayName: `${style[1]} · ${style[4] ? '[local]' : ''}`,
		},
		name: style[1],
		icon: svgIconEffect(style),
	}));
	result.setSuggestions(searchSuggestions(query, allEffectStyleSuggestions));
}
