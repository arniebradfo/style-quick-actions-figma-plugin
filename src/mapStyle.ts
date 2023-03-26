// We need to map styles into as small a data footprint as possible to not fill our 1MB per plugin figma.clientStorage limit:
// https://www.figma.com/plugin-docs/api/figma-clientStorage/#:~:text=Each%20plugin%20gets%20a%20total%20of%201MB%20of%20storage
// We are saving only what we need for the suggestion: id, name, and svg icon data

export function mapPaintStyleToStorage(style: PaintStyle): StoragePaintStyle {
	const paintChips = style.paints.map((paint, i) => {
		const paintStyleType = paintStyleTypeMap[paint.type];
		if (paint.type === 'SOLID') {
			const cssColor = rgbPaintToCssSolid(paint.color);
			return [paintStyleType, cssColor, paint.opacity] as StoragePaintSolidSubStyle;
		} else if (paint.type === 'IMAGE' || paint.type === 'VIDEO') {
			return [paintStyleType, '', paint.opacity] as StoragePaintSolidSubStyle;
		} else {
			const colorStops = paint.gradientStops.map(
				(gradientStop) => [rgbPaintToCss(gradientStop.color), gradientStop.position] as GradientStop
			);
			return [paintStyleType, colorStops, paint.opacity] as StoragePaintGradientSubStyle;
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
	return [style.key, style.name, StyleType.TEXT];
}

export const rgbPaintToCss = (rgb: RGB | RGBA): CssColor => {
	const { r, g, b, a = 1 } = rgb as RGBA;
	return `rgb(${r * 255},${g * 255},${b * 255},${a})`;
};

export const rgbPaintToCssSolid = (rgb: RGB | RGBA): CssColor => rgbPaintToCss({ ...rgb, a: undefined });

export enum StyleType {
	PAINT,
	GRID,
	EFFECT,
	TEXT,
}

export enum PaintStyleType {
	SOLID,
	IMAGE,
	VIDEO,
	GRADIENT_RADIAL,
	GRADIENT_DIAMOND,
	GRADIENT_LINEAR,
	GRADIENT_ANGULAR,
}
const paintStyleTypeMap = {
	SOLID: PaintStyleType.SOLID,
	IMAGE: PaintStyleType.IMAGE,
	VIDEO: PaintStyleType.VIDEO,
	GRADIENT_RADIAL: PaintStyleType.GRADIENT_RADIAL,
	GRADIENT_DIAMOND: PaintStyleType.GRADIENT_DIAMOND,
	GRADIENT_LINEAR: PaintStyleType.GRADIENT_LINEAR,
	GRADIENT_ANGULAR: PaintStyleType.GRADIENT_ANGULAR,
};

export type PaintSolidStyleType =
	| PaintStyleType.SOLID //
	| PaintStyleType.IMAGE
	| PaintStyleType.VIDEO;
export type PaintGradientStyleType =
	| PaintStyleType.GRADIENT_RADIAL
	| PaintStyleType.GRADIENT_DIAMOND
	| PaintStyleType.GRADIENT_LINEAR
	| PaintStyleType.GRADIENT_ANGULAR;

export enum GridStyleType {
	GRID,
	ROWS,
	COLUMNS,
}
const gridStyleTypeMap = {
	GRID: GridStyleType.GRID,
	ROWS: GridStyleType.ROWS,
	COLUMNS: GridStyleType.COLUMNS,
};

export enum EffectStyleType {
	DROP_SHADOW,
	INNER_SHADOW,
	LAYER_BLUR,
	BACKGROUND_BLUR,
}
const effectStyleTypeMap = {
	DROP_SHADOW: EffectStyleType.DROP_SHADOW,
	INNER_SHADOW: EffectStyleType.INNER_SHADOW,
	LAYER_BLUR: EffectStyleType.LAYER_BLUR,
	BACKGROUND_BLUR: EffectStyleType.BACKGROUND_BLUR,
};

type CssColor = string;
type Offset = number;
type Opacity = number;
export type GradientStop = [CssColor, Offset, Opacity?];

export type StoragePaintSolidSubStyle = [PaintSolidStyleType, CssColor, Opacity];

export type StoragePaintGradientSubStyle = [PaintGradientStyleType, GradientStop[], Opacity];

export type StoragePaintSubStyle = StoragePaintSolidSubStyle | StoragePaintGradientSubStyle;

export type StorageBaseStyle = [BaseStyle['key'], BaseStyle['name']];
export type StoragePaintStyle = [...StorageBaseStyle, StyleType.PAINT, StoragePaintSubStyle[]];
export type StorageEffectStyle = [...StorageBaseStyle, StyleType.EFFECT, EffectStyleType];
export type StorageGridStyle = [...StorageBaseStyle, StyleType.GRID, GridStyleType];
export type StorageTextStyle = [...StorageBaseStyle, StyleType.TEXT];
export type StorageStyle =
	| StorageBaseStyle
	| StoragePaintStyle
	| StorageEffectStyle
	| StorageGridStyle
	| StorageTextStyle;