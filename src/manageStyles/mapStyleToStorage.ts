// We need to map styles into as small a data footprint as possible to not fill our 1MB per plugin figma.clientStorage limit:
// https://www.figma.com/plugin-docs/api/figma-clientStorage/#:~:text=Each%20plugin%20gets%20a%20total%20of%201MB%20of%20storage
// We are saving only what we need for the suggestion: id, name, and svg icon data

import {
	CssColor,
	GradientStop,
	PaintStyleType,
	StorageEffectStyle,
	StorageGridStyle,
	StoragePaintGradientSubStyle,
	StoragePaintSolidSubStyle,
	StoragePaintStyle,
	StorageTextStyle,
	StorageTypeStyle,
	StyleType,
	TextStyleMeta,
	effectStyleTypeMap,
	gridStyleTypeMap,
	paintStyleTypeMap,
} from './storageTypes';

export function mapStyleToStorageLocal<TStyleOrVar extends BaseStyle | Variable, TStorage extends StorageTypeStyle>(
	mapStyleToStorage: (style: TStyleOrVar) => TStorage
): (style: TStyleOrVar) => TStorage {
	return (style: TStyleOrVar) => {
		const storageStyleLocal = mapStyleToStorage(style);
		storageStyleLocal[0] = style.id;
		storageStyleLocal[4] = true;
		return storageStyleLocal;
	};
}

export function mapColorVariableToStorage(variable: Variable): StoragePaintStyle {

	


	let variableValue: VariableValue | null = Object.values(variable.valuesByMode)[0];
	
	// call recursively till alias is resolved...
	while ((variableValue as VariableAlias)?.type === 'VARIABLE_ALIAS') {
		const aliasedVariable = figma.variables.getVariableById((variableValue as VariableAlias).id);
		variableValue = aliasedVariable != null ? Object.values(aliasedVariable.valuesByMode)[0] : null;
	}
	
	const solidPaint = variableValue === null || variable.resolvedType !== 'COLOR' ? grayRGBA : (variableValue as RGBA);

	return [
		variable.key,
		variable.name,
		StyleType.PAINT,
		[[PaintStyleType.VARIABLE, rgbPaintToCssSolid(solidPaint), solidPaint.a || 1]],
	];
}

export function mapPaintStyleToStorage(style: PaintStyle): StoragePaintStyle {
	const paintChips = style.paints.map((paint, i) => {
		const paintStyleType = paintStyleTypeMap[paint.type];
		if (paint.type === 'SOLID') {
			const cssColor = rgbPaintToCssSolid(paint.color);
			return [paintStyleType, cssColor, paint.opacity] as StoragePaintSolidSubStyle;
		} else if (paint.type === 'IMAGE' || paint.type === 'VIDEO') {
			return [paintStyleType, '', paint.opacity] as StoragePaintSolidSubStyle;
		} else {
			// (paint.type === 'GRADIENT*')
			const colorStops = paint.gradientStops.map(
				(gradientStop) => [rgbPaintToCss(gradientStop.color), gradientStop.position] as GradientStop
			);
			return [paintStyleType, colorStops, roundOpacity(paint.opacity || 1)] as StoragePaintGradientSubStyle;
		}
	});
	return [style.key, style.name, StyleType.PAINT, paintChips];
}

export function mapGridStyleToStorage(style: GridStyle): StorageGridStyle {
	// Figma seems to pick the icon of the last grid pattern type in the stack
	// which is the first in the array
	const { pattern } = style.layoutGrids[0];
	return [style.key, style.name, StyleType.GRID, gridStyleTypeMap[pattern]];
}

export function mapEffectStyleToStorage(style: EffectStyle): StorageEffectStyle {
	// Figma seems to pick the icon of the last effect type in the stack
	// which is the first in the array
	const { type } = style.effects[0];
	return [style.key, style.name, StyleType.EFFECT, effectStyleTypeMap[type]];
}

export function mapTextStyleToStorage(style: TextStyle): StorageTextStyle {
	return [style.key, style.name, StyleType.TEXT, textStyleMeta(style)];
}

function textStyleMeta(style: TextStyle): TextStyleMeta {
	const fontSize = Math.round(style.fontSize);
	const lineHeight = style.lineHeight.unit === 'AUTO' ? 'Auto' : Math.round(style.lineHeight.value);
	return `${fontSize}/${lineHeight}`;
}

export function rgbPaintToCss(rgb: RGB | RGBA): CssColor {
	const { r, g, b, a = 1 } = rgb as RGBA;
	const alpha = a >= 1 ? '' : ',' + roundOpacity(a);
	return `rgb(${to256(r)},${to256(g)},${to256(b)}${alpha})`;
}

const to256 = (percent: number) => Math.round(percent * 255);

const roundOpacity = (opacity: number) => Math.round(opacity * 100) / 100;

const grayRGBA: RGBA = {
	r: 125,
	g: 125,
	b: 125,
	a: 1,
};

export const rgbPaintToCssSolid = (rgb: RGB | RGBA): CssColor => rgbPaintToCss({ ...rgb, a: undefined });
