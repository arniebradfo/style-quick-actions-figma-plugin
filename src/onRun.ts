import { removeLibrary, publishLibraryStyles, toggleLibrary } from './manageStyles';
import { InputCommand } from './types';

export const onRun = async (event: RunEvent) => {
	const { selection } = figma.currentPage;
	const { command, parameters } = event as _RunEvent;
	const styleId = parameters?.[command] || '';

	console.log({
		command,
		parameters,
		style: figma.getStyleById(styleId),
		selection,
	});

	switch (command) {
		case InputCommand.Fill:
			selection.forEach((node) => {
				if ('fillStyleId' in node) node.fillStyleId = styleId;
			});
			break;
		case InputCommand.Stroke:
			selection.forEach((node) => {
				if ('strokeStyleId' in node) node.strokeStyleId = styleId;
			});
			break;
		case InputCommand.Text:
			selection.forEach((node) => {
				if ('textStyleId' in node) node.textStyleId = styleId;
			});
			break;
		case InputCommand.Effect:
			selection.forEach((node) => {
				if ('effectStyleId' in node) node.effectStyleId = styleId;
			});
			break;
		case InputCommand.Grid:
			selection.forEach((node) => {
				if ('gridStyleId' in node) node.gridStyleId = styleId;
			});
			break;
		case InputCommand.ToggleStyle:
			await toggleLibrary(styleId);
			break;
		case InputCommand.PublishStyle:
			await publishLibraryStyles();
			break;
		case InputCommand.DeleteStyle:
			await removeLibrary(styleId);
			break;
		default:
			figma.notify('Error: Invalid Command', { error: true });
			break;
	}

	figma.closePlugin();
};

type _RunEvent = {
	command: InputCommand;
	parameters: Record<InputCommand, string>;
};
