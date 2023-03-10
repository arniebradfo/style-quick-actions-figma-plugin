export const svgIconPaint = (style: PaintStyle) => {
	const paintChipsSvg: string[] = style.paints.map((paint, i) => {
		if (paint.type === 'SOLID') {
			const cssColor = rgbPaintToCssSolid(paint.color);
			return solidFillSvg(i, cssColor, paint.opacity); // color
		} else if (paint.type === 'IMAGE') {
			return imageFillIconSvg(i, undefined, paint.opacity); // color
		} else if (paint.type === 'VIDEO') {
			return videoFillIconSvg(i, undefined, paint.opacity); // color
		} else {
			// (paint.type === 'GRADIENT_SOMETHING')
			const colorStops = paint.gradientStops.map(
				(gradientStop) =>
					({ color: rgbPaintToCss(gradientStop.color), offset: gradientStop.position } as SvgColorStop)
			);
			if (paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_DIAMOND') {
				return radialGradientFillSvg(i, colorStops, paint.opacity);
			} else {
				// (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_ANGULAR')
				return linearGradientFillSvg(i, colorStops, paint.opacity);
			}
		}
	});

	// const sumOpacity = style.paints.reduce((accumulator, paint) => accumulator + (paint.opacity || 1), 0);
	// const outline = sumOpacity < 0.2;
	const outline = true; // to be sure

	const checkerBoxes =
		style.paints.length === 1 &&
		style.paints[0].type === 'SOLID' &&
		style.paints[0].opacity != null &&
        style.paints[0].opacity < 1;
    
	// stack paint chips
	return paintPreviewSvg(paintChipsSvg, { outline, checkerBoxes });
};

const rgbPaintToCss = (rgb: RGB | RGBA) => {
	const { r, g, b, a = 1 } = rgb as RGBA;
	return `rgb(${r * 255},${g * 255},${b * 255},${a})`;
};
const rgbPaintToCssSolid = (rgb: RGB | RGBA) => rgbPaintToCss({ ...rgb, a: undefined });

const paintPreviewSvg = (fillSvg: string[], options: { outline?: boolean; checkerBoxes?: boolean } = {}) => /*svg*/ `
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		${options.checkerBoxes ? checkerBoxesSvg() : ''}
		${fillSvg.join('\n')}
		${options.outline ? outlineSvg() : ''}
	</svg>
`;

const videoFillIconSvg = (id: string | number, iconColor = '#000000', opacity = 1) => /*svg*/ `
	<g id="video-icon-${id}"  opacity="${opacity}">
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
const solidFillSvg = (id: string | number, color: string, opacity = 1) => /*svg*/ `
	<circle id="main-fill-${id}" cx="8" cy="8" r="8" fill="${color}" opacity="${opacity}" />
	<!--<path id="half-fill-${id}" d="${semiCircleBottomPathD}" fill="${color}" />-->
`;

const outlineSvg = (outlineColor = 'gray') => /*svg*/ `
	<circle id="outline" cx="8" cy="8" r="7.75" stroke="${outlineColor}" stroke-width="0.5" opacity="0.2"  />
`;

const checkerBoxesSvg = (checkerBoxColor = '#E1E1E1', isFull = false) => /*svg*/ `
	<mask id="checker-box-mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
		${
			isFull
				? /*svg*/ `<circle id="checker-box-mask-circle" cx="8" cy="8" r="8" fill="black" />`
				: /*svg*/ `<path id="checker-box-mask-semicircle" d="${semiCircleTopPathD}" fill="black" />`
		}
	</mask>
	<g id="checker-box" mask="url(#checker-box-mask)">
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
