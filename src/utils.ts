import * as fuzzy from 'fuzzy';

/** https://www.figma.com/plugin-docs/api/figma-parameters/#suggestionresults */
export interface SuggestionObj<DataT = any> {
	name: string;
	data?: DataT;
	icon?: string | Uint8Array;
	iconUrl?: string;
}
export type Suggestion<Data = any> = SuggestionObj<Data> | string;

const extract = (suggestion: Suggestion) => {
	return typeof suggestion === 'string' ? suggestion : suggestion.name;
};

export const searchSuggestions = <OptionType extends Suggestion>(
	query = '',
	options: OptionType[] = [],
	postMap: (option: OptionType) => OptionType = (option) => option
): OptionType[] => {
	const matches = fuzzy
		.filter<OptionType>(query, options, { extract })
		// .sort((a, b) => a.score - b.score)
		.map((match) => postMap(match.original));
	return matches;
};

// alter the name after fuzzy search
export const mapDisplayName = (d: StyleSuggestion) => (d.data?.displayName ? { ...d, name: d.data.displayName } : d);

export type SuggestionData = {
	source: 'local' | 'remote';
	id: string;
	displayName?: string;
};

export type StyleSuggestion = SuggestionObj<SuggestionData>;
