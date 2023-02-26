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
		"(Updated) Published styles as 'File Name'. To use these styles in another file, select the name in 'Manage Styles'."
	);
};
