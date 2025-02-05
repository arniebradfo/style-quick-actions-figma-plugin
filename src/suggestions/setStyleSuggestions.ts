import {
	getActiveLibraryIds,
	getLocalColorVariables,
	isLibraryRemote,
	isPublicStyleName,
	isStyleVariable,
} from '../manageStyles/manageStyles';
import {
	mapEffectStyleToStorage,
	mapGridStyleToStorage,
	mapPaintStyleToStorage,
	mapStyleToStorageLocal,
	mapTextStyleToStorage,
	mapColorVariableToStorage,
} from '../manageStyles/mapStyleToStorage';
import {
	StorageEffectStyle,
	StorageGridStyle,
	StoragePaintStyle,
	StorageStyle,
	StorageTextStyle,
	StorageTypeStyle,
	StyleClientStorage,
	StyleClientStorageType,
} from '../manageStyles/storageTypes';
import { StyleSuggestion, mapDisplayName, searchSuggestions } from './suggestion';
import { svgIconEffect, svgIconGrid, svgIconText } from '../svgIcons/svgIcon';
import { svgIconPaint } from '../svgIcons/svgIconPaint';

/////

export async function getLibraryStyles(libraryStyleId: string, type: StyleClientStorageType) {
	const styleClientStorage = (await figma.clientStorage.getAsync(libraryStyleId)) as StyleClientStorage | undefined;
	if (styleClientStorage == null) {
		// libraryStyleId is orphaned run // validateActiveLibraryIds(); // but only works onRun
		return [];
	}
	return styleClientStorage[type].map((style) => {
		style[4] = libraryStyleId;
		return style;
	});
}

export async function getAllActiveLibraryStyles(type: StyleClientStorageType) {
	const activeLibraryIds = getActiveLibraryIds();
	const allStyles: StorageStyle[] = [];
	for (let i = 0; i < activeLibraryIds.length; i++) {
		const activeLibraryId = activeLibraryIds[i];
		if (isLibraryRemote(activeLibraryId)) {
			let styles = await getLibraryStyles(activeLibraryId, type);
			styles = styles.filter((style) => isPublicStyleName(style[1])); // shouldn't be published, but just in case
			allStyles.push(...styles);
		}
	}
	return allStyles;
}

export const getLibraryPaintStyles = async () => getAllActiveLibraryStyles('paint') as Promise<StoragePaintStyle[]>;
export const getLibraryGridStyles = async () => getAllActiveLibraryStyles('grid') as Promise<StorageGridStyle[]>;
export const getLibraryEffectStyles = async () => getAllActiveLibraryStyles('effect') as Promise<StorageEffectStyle[]>;
export const getLibraryTextStyles = async () => getAllActiveLibraryStyles('text') as Promise<StorageTextStyle[]>;

/////

function setStyleSuggestions<BaseStyleT extends BaseStyle, StorageTypeStyleT extends StorageTypeStyle>({
	getLocalVariables,
	mapVariableToStorage,
	getLocalStyles,
	mapStyleToStorage,
	getLibraryStyles,
	svgIconFn,
	displayName = defaultDisplayName,
}: {
	getLocalVariables?: () => Variable[];
	mapVariableToStorage?: (style: Variable) => StorageTypeStyleT;
	getLocalStyles: () => BaseStyleT[];
	mapStyleToStorage: (style: BaseStyleT) => StorageTypeStyleT;
	getLibraryStyles: () => Promise<StorageTypeStyleT[]>;
	svgIconFn: (style: StorageTypeStyleT) => string;
	displayName?: (style: StorageTypeStyleT) => string;
}) {
	let allStyleSuggestionsMemo: StyleSuggestion[] | null = null;
	return async (result: SuggestionResults, query?: string) => {
		if (allStyleSuggestionsMemo == null) {
			const localStyles = getLocalStyles().map(mapStyleToStorageLocal(mapStyleToStorage));
			const localVariables =
				getLocalVariables && mapVariableToStorage
					? getLocalVariables().map(mapStyleToStorageLocal(mapVariableToStorage))
					: [];
			const remoteStyles = await getLibraryStyles();
			// TODO: const remoteVariables = await getLibraryVariables(); // doesn't exist
			allStyleSuggestionsMemo = [...localStyles, ...remoteStyles, ...localVariables].map((style) => ({
				data: {
					source: style[4] === true ? 'local' : 'remote',
					id: style[0],
					displayName: displayName(style),
					isVariable: isStyleVariable(style),
				},
				name: style[1],
				icon: svgIconFn(style),
			}));
		}
		if (allStyleSuggestionsMemo.length === 0) {
			result.setLoadingMessage('No styles available in this file');
			return;
		}
		result.setSuggestions(searchSuggestions(query, allStyleSuggestionsMemo, mapDisplayName));
	};
}

function sourceDisplayName(source?: string | true) {
	return `${source === true ? '[local]' : source ? `[${source}]` : ''}`;
}

function defaultDisplayName<StorageTypeStyleT extends StorageTypeStyle>(style: StorageTypeStyleT) {
	return `${style[1]} · ${sourceDisplayName(style[4])}`;
}

function textDisplayName(style: StorageTextStyle) {
	return `${style[1]} · ${style[3]} · ${sourceDisplayName(style[4])}`;
}

/////

export const setPaintSuggestions = setStyleSuggestions({
	getLocalVariables: getLocalColorVariables,
	mapVariableToStorage: mapColorVariableToStorage,
	getLocalStyles: figma.getLocalPaintStyles,
	mapStyleToStorage: mapPaintStyleToStorage,
	getLibraryStyles: getLibraryPaintStyles,
	svgIconFn: svgIconPaint,
});

export const setTextSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalTextStyles,
	mapStyleToStorage: mapTextStyleToStorage,
	getLibraryStyles: getLibraryTextStyles,
	svgIconFn: svgIconText,
	displayName: textDisplayName,
});

export const setGridSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalGridStyles,
	mapStyleToStorage: mapGridStyleToStorage,
	getLibraryStyles: getLibraryGridStyles,
	svgIconFn: svgIconGrid,
});

export const setEffectSuggestions = setStyleSuggestions({
	getLocalStyles: figma.getLocalEffectStyles,
	mapStyleToStorage: mapEffectStyleToStorage,
	getLibraryStyles: getLibraryEffectStyles,
	svgIconFn: svgIconEffect,
});
