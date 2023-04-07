import { StorageSuggestion, mapDisplayName, searchSuggestions } from './suggestion';
import { svgIconCheckbox } from '../svgIcons/svgIcon';
import { isLibraryActive, isLibraryRemote, libraryStats } from '../manageStyles/manageStyles';

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
