import {
	StorageEffectStyle,
	StorageGridStyle,
	StoragePaintStyle,
	StorageTextStyle,
	mapPaintStyleToStorage,
	mapGridStyleToStorage,
	mapEffectStyleToStorage,
	mapTextStyleToStorage,
	StorageStyle,
} from './mapStyle';
import { svgIconCheckbox } from './svgIcon';
import { StorageSuggestion, mapDisplayName, searchSuggestions } from './suggestion';
import { figmaNotifyErrorOptions, lengthInUtf8Bytes } from './utils';

export interface StyleClientStorage {
	paint: StoragePaintStyle[];
	text: StorageTextStyle[];
	effect: StorageEffectStyle[];
	grid: StorageGridStyle[];
	saved: number;
	bytes: number;
}

export type StyleClientStorageType = keyof Omit<StyleClientStorage, 'saved' | 'bytes'>;

export async function publishLibraryStyles() {
	const styles: StyleClientStorage = {
		paint: figma.getLocalPaintStyles().map(mapPaintStyleToStorage),
		text: figma.getLocalTextStyles().map(mapTextStyleToStorage),
		effect: figma.getLocalEffectStyles().map(mapEffectStyleToStorage),
		grid: figma.getLocalGridStyles().map(mapGridStyleToStorage),
		saved: Date.now(),
		bytes: 0,
	};

	const bytes = lengthInUtf8Bytes(JSON.stringify(styles));
	styles.bytes = bytes;
	const styleCount = styles.paint.length + styles.text.length + styles.effect.length + styles.grid.length;
	const filePercentOfAllotment = percentOfAllotment(bytes);

	const fileName = figma.root.name;

	const isUpdating = (await figma.clientStorage.getAsync(fileName)) != null;

	try {
		await figma.clientStorage.setAsync(fileName, styles);
	} catch (error) {
		console.error(error);
		figma.notify(
			`Cannot Publish. Plugin storage full. Please 'Remove Library Styles' to free up space.`,
			figmaNotifyErrorOptions
		);
		return;
	}

	// const stats = `${styleCount} styles, ${filePercentOfAllotment}% of available storage`;
	const updating = isUpdating ? 'Updating ' : '';
	figma.notify(`${updating}Published Library Style as '${fileName}'. Now available in 'Toggle Library Styles'.`, {
		timeout: 5000,
	});
}

export async function toggleLibrary(libraryId: string) {
	const hasLibraryId = toggleActiveLibraryId(libraryId);
	figma.notify(`Library Styles from '${libraryId}' are toggled ${hasLibraryId ? 'ON' : 'OFF'} in this file.`);
}

export async function setLibrarySuggestions(result: SuggestionResults, query?: string, toggle = false) {
	result.setLoadingMessage('Loading available Styles');
	let allLibraryIds = await figma.clientStorage.keysAsync();

	const libraries: StorageSuggestion[] = [];
	for (let i = 0; i < allLibraryIds.length; i++) {
		const libraryId = allLibraryIds[i];
		if (!toggle || isLibraryRemote(libraryId)) {
			const { percent, styleCount } = await libraryStats(libraryId);
			const suggestion: StorageSuggestion = {
				data: {
					id: libraryId,
					displayName: `${libraryId} · [${styleCount} styles · ${percent}%]`,
					source: isLibraryRemote(libraryId) ? 'remote' : 'local',
				},
				name: libraryId,
				icon: toggle ? svgIconCheckbox(isLibraryActive(libraryId)) : undefined,
			};
			libraries.push(suggestion);
		}
	}

	if (libraries.length === 0) {
		result.setLoadingMessage(
			toggle ? `'Publish Library Styles' in other files to see them here.` : 'No Published Libraries to remove...'
		);
		return;
	}
	
	result.setSuggestions(searchSuggestions(query, libraries, mapDisplayName));
}

export async function removeLibrary(libraryId: string) {
	figma.notify(`Deleting Library Style '${libraryId}'...`);
	await figma.clientStorage.deleteAsync(libraryId);
	removeLibraryId(libraryId);
	figma.notify(`Deleted Library Style '${libraryId}'`);
}

export async function getLibraryStyles(libraryStyleId: string, type: StyleClientStorageType) {
	const styleClientStorage = (await figma.clientStorage.getAsync(libraryStyleId)) as StyleClientStorage;
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
			const styles = await getLibraryStyles(activeLibraryId, type);
			allStyles.push(...styles);
		}
	}
	return allStyles;
}

export const getLibraryPaintStyles = async () => getAllActiveLibraryStyles('paint') as Promise<StoragePaintStyle[]>;
export const getLibraryGridStyles = async () => getAllActiveLibraryStyles('grid') as Promise<StorageGridStyle[]>;
export const getLibraryEffectStyles = async () => getAllActiveLibraryStyles('effect') as Promise<StorageEffectStyle[]>;
export const getLibraryTextStyles = async () => getAllActiveLibraryStyles('text') as Promise<StorageTextStyle[]>;

//////// SUPPORT ////////

export const activeLibrariesKey = 'activeLibraries'; // will need to reset storage to change this

export function getActiveLibraryIds(): string[] {
	const activeLibraries = figma.root.getPluginData(activeLibrariesKey);
	return activeLibraries ? JSON.parse(activeLibraries) : [];
}

export function setActiveLibraryIds(libraryIds: string[]) {
	return figma.root.setPluginData(activeLibrariesKey, JSON.stringify(libraryIds));
}

export function toggleActiveLibraryId(libraryId: string) {
	// use a set to prevent duplication
	const activeLibraryIds = new Set(getActiveLibraryIds());
	if (activeLibraryIds.has(libraryId)) {
		activeLibraryIds.delete(libraryId);
	} else {
		activeLibraryIds.add(libraryId);
	}
	setActiveLibraryIds(Array.from(activeLibraryIds.values()));
	return activeLibraryIds.has(libraryId);
}

export function isLibraryActive(libraryId: string) {
	const activeLibraryIds = new Set(getActiveLibraryIds());
	return activeLibraryIds.has(libraryId);
}

export function addLibraryId(libraryId: string) {
	// use a set to prevent duplication
	const activeLibraryIds = new Set(getActiveLibraryIds());
	activeLibraryIds.add(libraryId);
	setActiveLibraryIds(Array.from(activeLibraryIds.values()));
}
export function removeLibraryId(libraryId: string) {
	// use a set to prevent duplication
	const activeLibraryIds = new Set(getActiveLibraryIds());
	activeLibraryIds.delete(libraryId);
	setActiveLibraryIds(Array.from(activeLibraryIds.values()));
}

/** is the library not a published version of the current file */
export function isLibraryRemote(libraryId: string) {
	return libraryId !== figma.root.name;
}

/** https://www.figma.com/plugin-docs/api/figma-clientStorage/#:~:text=Each%20plugin%20gets%20a%20total%20of%201MB%20of%20storage */
export const figmaPluginMemoryAllotment = 1000000; // 1MB = 1 million bytes // 1e6

export function percentOfAllotment(bytes: number) {
	return Math.round((bytes / figmaPluginMemoryAllotment) * 100 * 10) / 10;
}

export async function libraryStats(libraryId: string) {
	const styles = (await figma.clientStorage.getAsync(libraryId)) as StyleClientStorage;
	const styleCount = styles.paint.length + styles.text.length + styles.effect.length + styles.grid.length;
	const percent = percentOfAllotment(styles.bytes);
	return {
		styleCount,
		percent,
		bytes: styles.bytes,
	};
}
