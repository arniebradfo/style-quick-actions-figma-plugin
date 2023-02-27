export const publishStyles = () => {
	const styles = {
		paint: figma.getLocalPaintStyles(),
		text: figma.getLocalTextStyles(),
		effect: figma.getLocalEffectStyles(),
		grid: figma.getLocalGridStyles(),
		saved: Date.now(),
	};

	const fileName = figma.root.name;
	figma.clientStorage.setAsync(fileName, styles);

	console.log({ fileName, styles });

	figma.notify(
		`Published Library Style as '${fileName}'. To use these styles in another file, select the name in 'Toggle Styles'.`
	);
};

export function toggleStyles(styleId: string) {
	figma.notify("Styles from 'Filename' are now available in this file");
}

export function setToggleStyleSuggestions(result: SuggestionResults, query?: string) {}

export function deleteStyles(styleId: string) {
	figma.notify('Deleted Style');
}
