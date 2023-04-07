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

export const figmaNotifyErrorOptions: NotificationOptions = {
	error: true,
	onDequeue: () => figma.closePlugin(),
	timeout: 5000,
};

/** https://stackoverflow.com/a/5515960/5648839 */
export function lengthInUtf8Bytes(string: string) {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	var m = encodeURIComponent(string).match(/%[89ABab]/g);
	return string.length + (m ? m.length : 0);
}