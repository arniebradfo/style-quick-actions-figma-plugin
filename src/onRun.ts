import { removeLibrary, publishLibraryStyles, toggleLibrary } from './manageStyles';
import { SuggestionData } from './suggestion';
import { InputCommand } from './types';

export const onRun = async (event: RunEvent) => {
	const { selection } = figma.currentPage;
	const { command, parameters } = event as _RunEvent;
	const parameterData = parameters?.[command];

	if (
		command === InputCommand.PublishStyle ||
		command === InputCommand.ToggleStyle ||
		command === InputCommand.DeleteStyle
	) {
		const libraryId = parameterData as string;
		switch (command) {
			case InputCommand.ToggleStyle:
				await toggleLibrary(libraryId);
				break;
			case InputCommand.PublishStyle:
				await publishLibraryStyles();
				break;
			case InputCommand.DeleteStyle:
				await removeLibrary(libraryId);
				break;
		}
	} else {
		const { id: styleIdOrKey, source } = parameterData as SuggestionData;
		const style =
			source === 'remote' ? await figma.importStyleByKeyAsync(styleIdOrKey) : figma.getStyleById(styleIdOrKey);

		console.log({
			command,
			parameters,
			styleIdOrKey,
			source,
			style,
			selection,
		});

		if (style == null) {
			console.error(`Style not found`, { command, id: styleIdOrKey, source });
			figma.notify('Style not found...', { error: true });
			figma.closePlugin();
			return;
		}

		switch (command) {
			case InputCommand.Fill:
				selection.forEach((node) => {
					if ('fillStyleId' in node) node.fillStyleId = style.id;
				});
				break;
			case InputCommand.Stroke:
				selection.forEach((node) => {
					if ('strokeStyleId' in node) node.strokeStyleId = style.id;
				});
				break;
			case InputCommand.Text:
				selection.forEach((node) => {
					if ('textStyleId' in node) node.textStyleId = style.id;
				});
				break;
			case InputCommand.Effect:
				selection.forEach((node) => {
					if ('effectStyleId' in node) node.effectStyleId = style.id;
				});
				break;
			case InputCommand.Grid:
				selection.forEach((node) => {
					if ('gridStyleId' in node) node.gridStyleId = style.id;
				});
				break;
			default:
				figma.notify('Error: Invalid Command', { error: true });
				break;
		}
	}

	figma.closePlugin();
};

type _RunEvent = {
	command: InputCommand;
	parameters: Record<InputCommand, SuggestionData | string>;
};
