import * as fuzzy from 'fuzzy';

export enum Command {
	Fill = 'fill',
	Stroke = 'stroke',
	Text = 'text',
	Effect = 'effect',
	Grid = 'grid',
	ToggleStyle = 'toggle',
	PublishStyle = 'publish',
	DeleteStyle = 'delete',
}
export type Key = Command;

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
