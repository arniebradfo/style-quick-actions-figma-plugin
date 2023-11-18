import * as fuzzy from 'fuzzy';

/** https://www.figma.com/plugin-docs/api/figma-parameters/#suggestionresults */
export interface SuggestionObj<DataT = any> {
	name: string;
	data?: DataT;
	icon?: string | Uint8Array;
	iconUrl?: string;
}

export type Suggestion<Data = any> = SuggestionObj<Data> | string;

function extract(suggestion: Suggestion) {
	return typeof suggestion === 'string' ? suggestion : suggestion.name;
}

export function searchSuggestions<OptionType extends Suggestion>(
	query = '',
	options: OptionType[] = [],
	postMap: (option: OptionType) => OptionType = (option) => option
): OptionType[] {
	const matches = fuzzy
		.filter<OptionType>(query, options, { extract })
		// .sort((a, b) => a.score - b.score)
		.map((match) => postMap(match.original));
	return matches;
}

// alter the name after fuzzy search
export function mapDisplayName(d: StyleSuggestion) {
	return d.data?.displayName ? { ...d, name: d.data.displayName } : d;
}

export type SuggestionData = {
	source: 'local' | 'remote';
	id: string;
	displayName?: string;
	isVariable?: boolean;
};

export type StyleSuggestion = SuggestionObj<SuggestionData>;

export type StorageSuggestion = SuggestionObj<SuggestionData>;
