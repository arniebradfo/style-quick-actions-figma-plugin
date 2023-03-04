import { Command } from './utils';
import { removeLibrary, publishLibraryStyles, toggleLibrary } from './manageStyles';

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
		case Command.Fill:
			selection.forEach((node) => {
				if ('fillStyleId' in node) node.fillStyleId = styleId;
			});
			break;
		case Command.Stroke:
			selection.forEach((node) => {
				if ('strokeStyleId' in node) node.strokeStyleId = styleId;
			});
			break;
		case Command.Text:
			selection.forEach((node) => {
				if ('textStyleId' in node) node.textStyleId = styleId;
			});
			break;
		case Command.Effect:
			selection.forEach((node) => {
				if ('effectStyleId' in node) node.effectStyleId = styleId;
			});
			break;
		case Command.Grid:
			selection.forEach((node) => {
				if ('gridStyleId' in node) node.gridStyleId = styleId;
			});
			break;
		case Command.ToggleStyle:
			await toggleLibrary(styleId);
			break;
		case Command.PublishStyle:
			await publishLibraryStyles();
			break;
		case Command.DeleteStyle:
			await removeLibrary(styleId);
			break;
		default:
			figma.notify('Error: Invalid Command', { error: true });
			break;
	}

	figma.closePlugin();
};

type _RunEvent = {
	command: Command;
	parameters: Record<Command, string>;
};
