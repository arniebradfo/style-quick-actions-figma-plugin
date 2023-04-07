import { StyleClientStorage, figmaPluginMemoryAllotment, libraryStats } from "./manageStyles";

export const totalMemoryUsed = async () => {
	let libraryIds = await figma.clientStorage.keysAsync();
	let totalBytes = 0;
	for (let i = 0; i < libraryIds.length; i++) {
		const libraryId = libraryIds[i];
		const { bytes } = await libraryStats(libraryId);
		totalBytes += bytes;
	}
	return totalBytes;
};

/// STRESS TESTING ///

export const fillClientStorage = async (styles: StyleClientStorage) => {
	try {
		let i = 0;
		let memoryUsed = 0;
		while (memoryUsed < figmaPluginMemoryAllotment) {
			await figma.clientStorage.setAsync('fill' + i, styles);
			memoryUsed = await totalMemoryUsed();
			console.log({ i, memoryUsed });
			i++;
		}
	} catch (error) {
		console.log({ error });
	}
};

export const deleteAllPluginData = async () => {
	let globalKeys = await figma.clientStorage.keysAsync();
	for (let i = 0; i < globalKeys.length; i++) {
		const globalKey = globalKeys[i];
		await figma.clientStorage.deleteAsync(globalKey);
	}
	const localKeys = figma.root.getPluginDataKeys();
	for (let i = 0; i < localKeys.length; i++) {
		const localKey = localKeys[i];
		figma.root.setPluginData(localKey, '');
	}
	console.log('deleted all plugin data');
	console.log({ localKeys, globalKeys });
	figma.closePlugin();
};


