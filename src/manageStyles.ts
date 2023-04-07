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
	console.log({ fileName, styles, styleCount, bytes, filePercentOfAllotment });

	const isUpdating = (await figma.clientStorage.getAsync(fileName)) != null;
	await figma.clientStorage.setAsync(fileName, styles);

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

	console.log({ allLibraryIds, libraries });
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

////////

export const activeLibrariesKey = 'thing'; // will need to reset storage to change this

export const getActiveLibraryIds = (): string[] => {
	const activeLibraries = figma.root.getPluginData(activeLibrariesKey);
	return activeLibraries ? JSON.parse(activeLibraries) : [];
};

export const setActiveLibraryIds = (libraryIds: string[]) =>
	figma.root.setPluginData(activeLibrariesKey, JSON.stringify(libraryIds));

export const toggleActiveLibraryId = (libraryId: string) => {
	// use a set to prevent duplication
	const activeLibraryIds = new Set(getActiveLibraryIds());
	if (activeLibraryIds.has(libraryId)) {
		activeLibraryIds.delete(libraryId);
	} else {
		activeLibraryIds.add(libraryId);
	}
	setActiveLibraryIds(Array.from(activeLibraryIds.values()));
	return activeLibraryIds.has(libraryId);
};

export const isLibraryActive = (libraryId: string) => {
	const activeLibraryIds = new Set(getActiveLibraryIds());
	return activeLibraryIds.has(libraryId);
};

export const addLibraryId = (libraryId: string) => {
	// use a set to prevent duplication
	const activeLibraryIds = new Set(getActiveLibraryIds());
	activeLibraryIds.add(libraryId);
	setActiveLibraryIds(Array.from(activeLibraryIds.values()));
};
export const removeLibraryId = (libraryId: string) => {
	// use a set to prevent duplication
	const activeLibraryIds = new Set(getActiveLibraryIds());
	activeLibraryIds.delete(libraryId);
	setActiveLibraryIds(Array.from(activeLibraryIds.values()));
};

/** is the library not a published version of the current file */
export const isLibraryRemote = (libraryId: string) => libraryId !== figma.root.name;

/** https://stackoverflow.com/a/5515960/5648839 */
function lengthInUtf8Bytes(string: string) {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	var m = encodeURIComponent(string).match(/%[89ABab]/g);
	return string.length + (m ? m.length : 0);
}

/** https://www.figma.com/plugin-docs/api/figma-clientStorage/#:~:text=Each%20plugin%20gets%20a%20total%20of%201MB%20of%20storage */
const figmaPluginMemoryAllotment = 1000000; // 1MB = 1 million bytes // 1e6

const percentOfAllotment = (bytes: number) => {
	// const percent =
	return Math.round((bytes / figmaPluginMemoryAllotment) * 100 * 10) / 10;
	// const extraZero = percent < 10 ? '0' : '';
	// return extraZero + percent + '%';
};

const totalMemoryUsed = () => {};

const libraryStats = async (libraryId: string) => {
	const styles = (await figma.clientStorage.getAsync(libraryId)) as StyleClientStorage;
	const styleCount = styles.paint.length + styles.text.length + styles.effect.length + styles.grid.length;
	const percent = percentOfAllotment(styles.bytes);
	return {
		styleCount,
		percent,
		bytes: styles.bytes,
	};
};
