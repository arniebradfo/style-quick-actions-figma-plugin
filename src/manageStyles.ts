import { svgIconCheckbox } from './svgIcon';
import { searchSuggestions } from './utils';

export async function publishStyles() {
	const styles: StyleClientStorage = {
		paint: figma.getLocalPaintStyles().map(mapStyleKey),
		text: figma.getLocalTextStyles().map(mapStyleKey),
		effect: figma.getLocalEffectStyles().map(mapStyleKey),
		grid: figma.getLocalGridStyles().map(mapStyleKey),
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

export async function toggleStyles(libraryStyleId: string) {
	// figma.root.getPluginData();
	const hasLibraryStyleId = toggleLocalStylesList(libraryStyleId);
	figma.notify(
		`Library Styles from '${libraryStyleId}' are toggled ${hasLibraryStyleId ? 'ON' : 'OFF'} in this file.`
	);
}

export async function setLibraryStyleSuggestions(result: SuggestionResults, query?: string, toggle = false) {
	result.setLoadingMessage('Loading available Styles');
	let allLibraryStyles = await figma.clientStorage.keysAsync();

	const libraryStyles = allLibraryStyles.map((libraryStyleId) => ({
		name: libraryStyleId,
		// data: libraryStyleId,
		icon: toggle ? svgIconCheckbox(isInLocalStylesList(libraryStyleId)) : undefined,
	}));

	console.log({ allLibraryStyles, libraryStyles });
	result.setSuggestions(searchSuggestions(query, libraryStyles));
}

export async function deleteStyles(libraryStyleId: string) {
	figma.notify(`Deleting Library Style '${libraryStyleId}'...`);
	await figma.clientStorage.deleteAsync(libraryStyleId);
	removeFromLocalStylesList(libraryStyleId);
	figma.notify(`Deleted Library Style '${libraryStyleId}'`);
}

export async function getLibraryStyles(libraryStyleId: string, type: StyleClientStorageType) {
	const styleClientStorage = (await figma.clientStorage.getAsync(libraryStyleId)) as StyleClientStorage;

	const styleType = styleClientStorage[type];
	const styles: BaseStyle[] = [];
	for (let i = 0; i < styleType.length; i++) {
		const styleKey = styleType[i];
		const style = await figma.importStyleByKeyAsync(styleKey);
		console.log({ style, i, t: styleType.length });
		styles.push(style);
		if (i > 50) break;
	}
	return styles;
}
export async function getLocalLibraryStyles(type: StyleClientStorageType) {
	const localStylesList = getLocalStylesList();
	console.log({ localStylesList });

	const styles: BaseStyle[] = [];
	for (let i = 0; i < localStylesList.length; i++) {
		const libraryStyleId = localStylesList[i];
		const style = await getLibraryStyles(libraryStyleId, type);
		// console.log({ style });

		styles.push(...style);
	}
	return styles;
}
export const getLibraryPaintStyles = async () => getLocalLibraryStyles('paint') as Promise<PaintStyle[]>;
export const getLibraryGridStyles = async () => getLocalLibraryStyles('grid') as Promise<GridStyle[]>;
export const getLibraryEffectStyles = async () => getLocalLibraryStyles('effect') as Promise<EffectStyle[]>;
export const getLibraryTextStyles = async () => getLocalLibraryStyles('text') as Promise<TextStyle[]>;
////////

export const localStylesListKey = 'thing';

export const getLocalStylesList = (): string[] => {
	const localStylesList = figma.root.getPluginData(localStylesListKey);
	return localStylesList ? JSON.parse(localStylesList) : [];
};

export const setLocalStylesList = (localStylesList: string[]) =>
	figma.root.setPluginData(localStylesListKey, JSON.stringify(localStylesList));

export const toggleLocalStylesList = (libraryStyleId: string) => {
	// use a set to prevent duplication
	const localStylesList = new Set(getLocalStylesList());
	if (localStylesList.has(libraryStyleId)) {
		localStylesList.delete(libraryStyleId);
	} else {
		localStylesList.add(libraryStyleId);
	}
	setLocalStylesList(Array.from(localStylesList.values()));
	return localStylesList.has(libraryStyleId);
};

export const isInLocalStylesList = (libraryStyleId: string) => {
	const localStylesList = new Set(getLocalStylesList());
	return localStylesList.has(libraryStyleId);
};
export const mapStyleKey = (style: BaseStyle) => style.key;

export const addToLocalStylesList = (libraryStyleId: string) => {
	// use a set to prevent duplication
	const localStylesList = new Set(getLocalStylesList());
	localStylesList.add(libraryStyleId);
	setLocalStylesList(Array.from(localStylesList.values()));
};
export const removeFromLocalStylesList = (libraryStyleId: string) => {
	// use a set to prevent duplication
	const localStylesList = new Set(getLocalStylesList());
	localStylesList.delete(libraryStyleId);
	setLocalStylesList(Array.from(localStylesList.values()));
};
