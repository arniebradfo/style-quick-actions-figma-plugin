import { SuggestionObj } from './utils';

export enum InputCommand {
	Fill = 'fill',
	Stroke = 'stroke',
	Text = 'text',
	Effect = 'effect',
	Grid = 'grid',
	ToggleStyle = 'toggle',
	PublishStyle = 'publish',
	DeleteStyle = 'delete',
}
export type InputKey = InputCommand;
