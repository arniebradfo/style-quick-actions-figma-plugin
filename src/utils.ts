import * as fuzzy from 'fuzzy';

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

export const searchSuggestions = <OptionType extends Suggestion = string>(
	query = '',
	options: OptionType[] = []
): OptionType[] => {
	const matches = fuzzy
		.filter<OptionType>(query, options, { extract })
		// .sort((a, b) => a.score - b.score)
		.map((match) => match.original);
	return matches;
};
