import { GradientStop, PaintStyleType, StoragePaintStyle } from '../manageStyles/storageTypes';

export function svgIconPaint(style: StoragePaintStyle) {
	const paints = style[3];
	const [firstType, firstFill, firstOpacity] = paints[0];

	if (firstType === PaintStyleType.VARIABLE) {
		return variablePreviewSvg(firstFill, firstOpacity);
	}

	const paintChipsSvg: string[] = paints.map((paint, i) => {
		const [type, fill, opacity] = paint;
		if (type === PaintStyleType.SOLID) {
			return solidFillSvg(i, fill, opacity); // color
		} else if (type === PaintStyleType.IMAGE) {
			return imageFillIconSvg(i, undefined, opacity); // color
		} else if (type === PaintStyleType.VIDEO) {
			return videoFillIconSvg(i, undefined, opacity); // color
		} else {
			// (type === PaintStyleType.GRADIENT_SOMETHING)
			const gradientStops = fill as GradientStop[];
			const colorStops = gradientStops.map(([color, offset, opacity]) => ({ color, offset } as SvgColorStop));
			if (type === PaintStyleType.GRADIENT_RADIAL || type === PaintStyleType.GRADIENT_DIAMOND) {
				return radialGradientFillSvg(i, colorStops, opacity);
			} else {
				// (type === PaintStyleType.GRADIENT_LINEAR || type === PaintStyleType.GRADIENT_ANGULAR)
				return linearGradientFillSvg(i, colorStops, opacity);
			}
		}
	});

	const checkerBoxes =
		paints.length === 1 && firstType === PaintStyleType.SOLID && firstOpacity != null && firstOpacity < 1;

	return paintPreviewSvg(paintChipsSvg, { checkerBoxes });
}

const paintPreviewSvg = (fillSvg: string[], options: { checkerBoxes?: boolean } = {}) => /*svg*/ `
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		${options.checkerBoxes ? checkerBoxesSvg() : ''}
		${fillSvg.join('\n')}
		${outlineSvg['circle']}
	</svg>
`;

const variablePreviewSvg = (fill: string, opacity = 1) => /*svg*/ `
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		${squareSvg(1, fill)}
		${opacity !== 1 ? checkerBoxesSvg('semiSquare', 1 - opacity) : ''}
		${outlineSvg['square']}
	</svg>
`;

const videoFillIconSvg = (id: string | number, iconColor = '#000000', opacity = 1) => /*svg*/ `
	<g id="video-icon-${id}" opacity="${opacity}">
		<circle cx="8" cy="8" r="8" fill="gray" />
		<path 
			fill-rule="evenodd" 
			clip-rule="evenodd"
			fill="${iconColor}" 
			d="M4 4H12V12H4V4ZM3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 
				4V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V4ZM6 5.5L10 
				8L6 10.5V5.5Z"
		/>
	</g>
`;

const imageFillIconSvg = (id: string | number, iconColor = '#000000', opacity = 1) => /*svg*/ `
	<g id="image-icon-${id}" opacity="${opacity}">
		<circle cx="8" cy="8" r="8" fill="gray" />
		<path 
			fill-rule="evenodd" 
			clip-rule="evenodd"
			fill="${iconColor}" 
			d="M12 4H4V8.2929L6.00001 6.29289L11.7071 12H12V4ZM10.2929 12L6.00001 7.70711L4 
				9.70711V12H10.2929ZM4 3C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 
				13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3H4ZM9.5 7C9.77614 7 
				10 6.77614 10 6.5C10 6.22386 9.77614 6 9.5 6C9.22386 6 9 6.22386 9 6.5C9 6.77614 
				9.22386 7 9.5 7ZM9.5 8C10.3284 8 11 7.32843 11 6.5C11 5.67157 10.3284 5 9.5 
				5C8.67157 5 8 5.67157 8 6.5C8 7.32843 8.67157 8 9.5 8Z"
			/>
	</g>
`;

const linearGradientFillSvg = (id: string | number, colorStops: SvgColorStop[], opacity = 1) => /*svg*/ `
	<circle cx="8" cy="8" r="8" fill="url(#linear-gradient-${id})" opacity="${opacity}" />
	<defs>
		<linearGradient id="linear-gradient-${id}" x1="8" y1="0" x2="8" y2="16" gradientUnits="userSpaceOnUse">
			${gradientColorStopsSvg(colorStops)}
		</linearGradient>
	</defs>
`;

const radialGradientFillSvg = (id: string | number, colorStops: SvgColorStop[], opacity = 1) => /*svg*/ `
	<circle cx="8" cy="8" r="8" fill="url(#radial-gradient-${id})" opacity="${opacity}" />
	<defs>
		<radialGradient id="radial-gradient-${id}" cx="0" cy="0" r="1" 
			gradientUnits="userSpaceOnUse" gradientTransform="translate(8 8) rotate(90) scale(8)">
			${gradientColorStopsSvg(colorStops)}
		</radialGradient>
	</defs>
`;

interface SvgColorStop {
	color?: string;
	offset?: number;
	opacity?: number;
}

const gradientColorStopsSvg = (colorStops: SvgColorStop[]) =>
	colorStops
		.map(
			({ color = '#000000', offset = 0, opacity = 1 }) =>
				/*svg*/ `<stop stop-color="${color}" offset="${offset}" stop-opacity="${opacity}" />`
		)
		.join('\n');

const semiCircleBottomPathD = `M13.6568 13.6569C10.5326 16.781 5.46733 16.781 2.34313 
	13.6569C-0.781061 10.5327 -0.781061 5.46734 2.34313 2.34315L13.6568 13.6569Z`;

const semiCircleTopPathD = `M13.6568 2.34315C16.781 5.46734 16.781 10.5327 13.6568 
	13.6569L2.34314 2.34315C5.46733 -0.781047 10.5327 -0.781047 13.6568 2.34315Z`;

const solidFillSvg = (id: string | number, color = 'black', opacity = 1) => /*svg*/ `
	<circle id="main-fill-${id}" cx="8" cy="8" r="8" fill="${color}" opacity="${opacity}" />
	<!--<path id="half-fill-${id}" d="${semiCircleBottomPathD}" fill="${color}" />-->
`;

const squareSvg = (id: string | number, color = 'black', opacity = 1) =>
	/*svg*/ `<rect id="main-fill-${id}" height="16" width="16" rx="1" fill="${color}" opacity="${opacity}" />`;

const outlineColor = 'gray';
const outlineSvg = {
	circle: /*svg*/ `<circle id="outline" cx="8" cy="8" r="7.75" stroke="${outlineColor}" stroke-width="0.5" opacity="0.2" />`,
	square: /*svg*/ `<rect id="outline" height="15.5" width="15.5" rx="1.5" x="0.25" y="0.25" stroke="${outlineColor}" stroke-width="0.5" opacity="0.2" />`,
};
type OutlineShape = keyof typeof outlineSvg;

const checkboxMaskShapesSvg = {
	circle: /*svg*/ `<circle id="checker-box-mask-circle" cx="8" cy="8" r="8" fill="black" />`,
	semiCircle: /*svg*/ `<path id="checker-box-mask-semicircle" d="${semiCircleTopPathD}" fill="black" />`,
	square: /*svg*/ `<rect id="checker-box-mask-square" height="16" width="16" rx="1" fill="black" />`,
	semiSquare: /*svg*/ `<rect id="checker-box-mask-square" height="16" width="8" x="8" fill="black" />`,
};
type MaskShape = keyof typeof checkboxMaskShapesSvg;

const checkerBoxColor = '#E1E1E1';
const checkerBoxesSvg = (shape: MaskShape = 'semiCircle', opacity = 1) => /*svg*/ `
	<mask id="checker-box-mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
		${checkboxMaskShapesSvg[shape]}
	</mask>
	<g id="checker-box" mask="url(#checker-box-mask)" opacity="${opacity}">
		<rect width="16" height="16" fill="white" />
		<path d="M0 0H3V3H0V0Z" fill="${checkerBoxColor}" />
		<path d="M0 6H3V9H0V6Z" fill="${checkerBoxColor}" />
		<path d="M0 12H3V15H0V12Z" fill="${checkerBoxColor}" />
		<path d="M6 0H9V3H6V0Z" fill="${checkerBoxColor}" />
		<path d="M6 6H9V9H6V6Z" fill="${checkerBoxColor}" />
		<path d="M6 12H9V15H6V12Z" fill="${checkerBoxColor}" />
		<path d="M12 0H15V3H12V0Z" fill="${checkerBoxColor}" />
		<path d="M12 6H15V9H12V6Z" fill="${checkerBoxColor}" />
		<path d="M12 12H15V15H12V12Z" fill="${checkerBoxColor}" />
		<path d="M3 3H6V6H3V3Z" fill="${checkerBoxColor}" />
		<path d="M3 9H6V12H3V9Z" fill="${checkerBoxColor}" />
		<path d="M3 15H6V18H3V15Z" fill="${checkerBoxColor}" />
		<path d="M9 3H12V6H9V3Z" fill="${checkerBoxColor}" />
		<path d="M9 9H12V12H9V9Z" fill="${checkerBoxColor}" />
		<path d="M9 15H12V18H9V15Z" fill="${checkerBoxColor}" />
		<path d="M15 3H18V6H15V3Z" fill="${checkerBoxColor}" />
		<path d="M15 9H18V12H15V9Z" fill="${checkerBoxColor}" />
		<path d="M15 15H18V18H15V15Z" fill="${checkerBoxColor}" />
	</g>
`;

const backgroundSvg = /*svg*/ `<circle id="checker-box-mask-circle" cx="8" cy="8" r="8" fill="white" />`;
