import {
	getLibraryEffectStyles,
	getLibraryGridStyles,
	getLibraryPaintStyles,
	getLibraryTextStyles,
	setLibrarySuggestions,
} from './manageStyles';
import {
	StorageTypeStyle,
	mapEffectStyleToStorage,
	mapGridStyleToStorage,
	mapPaintStyleToStorage,
	mapStyleToStorageLocal,
	mapTextStyleToStorage,
} from './mapStyle';
import { svgIconEffect, svgIconGrid, svgIconText } from './svgIcon';
import { svgIconPaint } from './svgIconPaint';
import { InputCommand, InputKey } from './types';
import { mapDisplayName, searchSuggestions, StyleSuggestion } from './suggestion';

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

function setStyleSuggestions<BaseStyleT extends BaseStyle, StorageTypeStyleT extends StorageTypeStyle>({
	getLocalStyles,
	mapStyleToStorage,
	getLibraryStyles,
	svgIconFn,
}: {
	getLocalStyles: () => BaseStyleT[];
	mapStyleToStorage: (style: BaseStyleT) => StorageTypeStyleT;
	getLibraryStyles: () => Promise<StorageTypeStyleT[]>;
	svgIconFn: (style: StorageTypeStyleT) => string;
}) {
	let allStyleSuggestionsMemo: StyleSuggestion[] | null = null;
	return async (result: SuggestionResults, query?: string) => {
		if (allStyleSuggestionsMemo == null) {
			const localStyles = getLocalStyles().map(mapStyleToStorageLocal(mapStyleToStorage));
			const remoteStyles = await getLibraryStyles();
			allStyleSuggestionsMemo = [...localStyles, ...remoteStyles].map((style) => ({
				data: {
					source: style[4] === true ? 'local' : 'remote',
					id: style[0],
					displayName: `${style[1]} · ${style[4] === true ? '[local]' : style[4] ?? ''}`,
				},
				name: style[1],
				icon: svgIconFn(style),
			}));
		}
		if (allStyleSuggestionsMemo.length === 0) {
			result.setLoadingMessage('No styles available in this file')
			return;
		}
		result.setSuggestions(searchSuggestions(query, allStyleSuggestionsMemo, mapDisplayName));
	};
}

const setPaintSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalPaintStyles,
	mapStyleToStorage: mapPaintStyleToStorage,
	getLibraryStyles: getLibraryPaintStyles,
	svgIconFn: svgIconPaint,
});

const setTextSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalTextStyles,
	mapStyleToStorage: mapTextStyleToStorage,
	getLibraryStyles: getLibraryTextStyles,
	svgIconFn: svgIconText,
});

const setGridSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalGridStyles,
	mapStyleToStorage: mapGridStyleToStorage,
	getLibraryStyles: getLibraryGridStyles,
	svgIconFn: svgIconGrid,
});

const setEffectSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalEffectStyles,
	mapStyleToStorage: mapEffectStyleToStorage,
	getLibraryStyles: getLibraryEffectStyles,
	svgIconFn: svgIconEffect,
});
