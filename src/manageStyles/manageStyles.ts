import {
	mapPaintStyleToStorage,
	mapGridStyleToStorage,
	mapEffectStyleToStorage,
	mapTextStyleToStorage,
} from './mapStyleToStorage';
import { figmaNotifyErrorOptions, lengthInUtf8Bytes } from '../utils';
import { StyleClientStorage } from './storageTypes';

export async function publishLibraryStyles() {
	const styles: StyleClientStorage = {
		paint: figma.getLocalPaintStyles().filter(isPublicStyle).map(mapPaintStyleToStorage),
		text: figma.getLocalTextStyles().filter(isPublicStyle).map(mapTextStyleToStorage),
		effect: figma.getLocalEffectStyles().filter(isPublicStyle).map(mapEffectStyleToStorage),
		grid: figma.getLocalGridStyles().filter(isPublicStyle).map(mapGridStyleToStorage),
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

export async function toggleLibraryStyles(libraryId: string) {
	const hasLibraryId = toggleActiveLibraryId(libraryId);
	figma.notify(`Library Styles from '${libraryId}' are toggled ${hasLibraryId ? 'ON' : 'OFF'} in this file.`);
}

export async function removeLibraryStyles(libraryId: string) {
	figma.notify(`Deleting Library Style '${libraryId}'...`);
	await figma.clientStorage.deleteAsync(libraryId);
	removeLibraryId(libraryId);
	figma.notify(`Deleted Library Style '${libraryId}'`);
}

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

function isPublicStyle<TStyle extends BaseStyle>(style: TStyle): boolean {
	return isPublicStyleName(style.name);
}

// https://help.figma.com/hc/en-us/articles/360039238193-Hide-styles-components-and-variables-when-publishing#Hide_a_variable_collection
// Styles are meant to be public if they or the group begins with a . or _
export const isPublicStyleName = (name: string) =>
	!(name[0] === '.' || name[0] === '_' || name.includes('/.') || name.includes('/_'));
