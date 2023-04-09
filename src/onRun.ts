import { removeLibraryStyles, publishLibraryStyles, toggleLibraryStyles } from './manageStyles/manageStyles';
import { SuggestionData } from './suggestions/suggestion';
import { figmaNotifyErrorOptions, InputCommand } from './utils';

export async function onRun(event: RunEvent) {
	const { command, parameters } = event as _RunEvent;
	const parameterData = parameters?.[command];

	if (
		command === InputCommand.PublishStyle ||
		command === InputCommand.ToggleStyle ||
		command === InputCommand.DeleteStyle
	) {
		const { id: libraryId } = (parameterData as SuggestionData) ?? {};
		switch (command) {
			case InputCommand.ToggleStyle:
				await toggleLibraryStyles(libraryId);
				break;
			case InputCommand.PublishStyle:
				await publishLibraryStyles();
				break;
			case InputCommand.DeleteStyle:
				await removeLibraryStyles(libraryId);
				break;
		}
	} else {
		const { selection } = figma.currentPage;

		if (selection.length === 0) {
			figma.notify('No Layers Selected');
			figma.closePlugin();
			return;
		}

		const nodes = flattenGroupChildren(selection);

		const { id: styleIdOrKey, source } = (parameterData as SuggestionData) ?? {};

		let style: BaseStyle | null = null;
		try {
			style =
				source === 'remote'
					? await figma.importStyleByKeyAsync(styleIdOrKey)
					: figma.getStyleById(styleIdOrKey);
		} catch (error) {
			console.error(`Style not available`, { command, id: styleIdOrKey, source, error });
			figma.notify(
				'Style not available... Style must also be published from a Figma Library',
				figmaNotifyErrorOptions
			);
			return;
		}

		if (style == null) {
			console.error(`Style not found`, { command, id: styleIdOrKey, source });
			figma.notify('Style not found...', figmaNotifyErrorOptions);
			return;
		}

		const styleId = style.id as BaseStyle['id'];

		switch (command) {
			case InputCommand.Fill:
				nodes.forEach((node) => {
					if ('fillStyleId' in node) node.fillStyleId = styleId;
				});
				break;
			case InputCommand.Stroke:
				nodes.forEach((node) => {
					if ('strokeStyleId' in node) node.strokeStyleId = styleId;
				});
				break;
			case InputCommand.Text:
				nodes.forEach((node) => {
					if ('textStyleId' in node) node.textStyleId = styleId;
				});
				break;
			case InputCommand.Effect:
				nodes.forEach((node) => {
					if ('effectStyleId' in node) node.effectStyleId = styleId;
				});
				break;
			case InputCommand.Grid:
				nodes.forEach((node) => {
					if ('gridStyleId' in node) node.gridStyleId = styleId;
				});
				break;
			default:
				figma.notify('Error: Invalid Command', figmaNotifyErrorOptions);
				break;
		}
	}

	figma.closePlugin();
}

type _RunEvent = {
	command: InputCommand;
	parameters: Record<InputCommand, SuggestionData | string>;
};

function flattenGroupChildren(nodes: readonly SceneNode[]): SceneNode[] {
	return nodes.flatMap((node) => (node.type === 'GROUP' ? flattenGroupChildren(node.children) : node));
}
