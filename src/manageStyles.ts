import { svgIconCheckbox } from './svgIcon';
import { searchSuggestions } from './utils';

const mapStyleToClientStorage = (style: BaseStyle) => [style.key, style.name] as StorageStyle;

export async function publishLibraryStyles() {
	const styles: StyleClientStorage = {
		paint: figma.getLocalPaintStyles().map(mapStyleToClientStorage),
		text: figma.getLocalTextStyles().map(mapStyleToClientStorage),
		effect: figma.getLocalEffectStyles().map(mapStyleToClientStorage),
		grid: figma.getLocalGridStyles().map(mapStyleToClientStorage),
		saved: Date.now(),
	};

	const fileName = figma.root.name;
	console.log({ fileName, styles });
	console.log(JSON.stringify(styles)); // to test file size

	const isUpdating = (await figma.clientStorage.getAsync(fileName)) != null;
	await figma.clientStorage.setAsync(fileName, styles);

	figma.notify(
		`${isUpdating ? 'Updating ' : ''}Published Library Style as '${fileName}'. Now available in 'Toggle Styles'.`
	);
}

export async function toggleLibrary(libraryId: string) {
	// figma.root.getPluginData();
	const hasLibraryId = toggleActiveLibraryId(libraryId);
	figma.notify(`Library Styles from '${libraryId}' are toggled ${hasLibraryId ? 'ON' : 'OFF'} in this file.`);
}

export async function setLibrarySuggestions(result: SuggestionResults, query?: string, toggle = false) {
	result.setLoadingMessage('Loading available Styles');
	let allLibraries = await figma.clientStorage.keysAsync();

	const libraries = allLibraries.map((libraryId) => ({
		name: libraryId,
		// data: libraryId,
		icon: toggle ? svgIconCheckbox(isLibraryActive(libraryId)) : undefined,
	}));

	console.log({ allLibraries, libraries });
	result.setSuggestions(searchSuggestions(query, libraries));
}

export async function removeLibrary(libraryId: string) {
	figma.notify(`Deleting Library Style '${libraryId}'...`);
	await figma.clientStorage.deleteAsync(libraryId);
	removeLibraryId(libraryId);
	figma.notify(`Deleted Library Style '${libraryId}'`);
}

export async function getLibraryStyles(libraryStyleId: string, type: StyleClientStorageType) {
	const styleClientStorage = (await figma.clientStorage.getAsync(libraryStyleId)) as StyleClientStorage;
	const styleType = styleClientStorage[type];
	
	const styles: BaseStyle[] = [];
	for (let i = 0; i < styleType.length; i++) {
		const styleKey = styleType[i][0];
		const style = await figma.importStyleByKeyAsync(styleKey);
		console.log({ style, i, t: styleType.length });
		styles.push(style);
		if (i > 50) break; // too slow, gets slower...
	}
	return styles;
}
export async function getAllActiveLibraryStyles(type: StyleClientStorageType) {
	const localStylesList = getActiveLibraryIds();
	const styles: BaseStyle[] = [];
	for (let i = 0; i < localStylesList.length; i++) {
		const libraryStyleId = localStylesList[i];
		const style = await getLibraryStyles(libraryStyleId, type);
		styles.push(...style);
	}
	return styles;
}
export const getLibraryPaintStyles = async () => getAllActiveLibraryStyles('paint') as Promise<PaintStyle[]>;
export const getLibraryGridStyles = async () => getAllActiveLibraryStyles('grid') as Promise<GridStyle[]>;
export const getLibraryEffectStyles = async () => getAllActiveLibraryStyles('effect') as Promise<EffectStyle[]>;
export const getLibraryTextStyles = async () => getAllActiveLibraryStyles('text') as Promise<TextStyle[]>;

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
