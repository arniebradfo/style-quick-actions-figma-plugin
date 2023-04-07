// We need to map styles into as small a data footprint as possible to not fill our 1MB per plugin figma.clientStorage limit:
// https://www.figma.com/plugin-docs/api/figma-clientStorage/#:~:text=Each%20plugin%20gets%20a%20total%20of%201MB%20of%20storage
// We are saving only what we need for the suggestion: id, name, and svg icon data

import {
	CssColor,
	GradientStop,
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

export function mapStyleToStorageLocal<TStyle extends BaseStyle, TStorage extends StorageTypeStyle>(
	mapStyleToStorage: (style: TStyle) => TStorage
): (style: TStyle) => TStorage {
	return (style: TStyle) => {
		const storageStyleLocal = mapStyleToStorage(style);
		storageStyleLocal[0] = style.id;
		storageStyleLocal[4] = true;
		return storageStyleLocal;
	};
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

export const rgbPaintToCssSolid = (rgb: RGB | RGBA): CssColor => rgbPaintToCss({ ...rgb, a: undefined });
