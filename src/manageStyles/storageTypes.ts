export interface StyleClientStorage {
	paint: StoragePaintStyle[];
	text: StorageTextStyle[];
	effect: StorageEffectStyle[];
	grid: StorageGridStyle[];
	saved: number;
	bytes: number;
}

export type StyleClientStorageType = keyof Omit<StyleClientStorage, 'saved' | 'bytes'>;

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
	VARIABLE,
	GRADIENT_RADIAL,
	GRADIENT_DIAMOND,
	GRADIENT_LINEAR,
	GRADIENT_ANGULAR,
}

export const paintStyleTypeMap = {
	SOLID: PaintStyleType.SOLID,
	IMAGE: PaintStyleType.IMAGE,
	VIDEO: PaintStyleType.VIDEO,
	VARIABLE: PaintStyleType.VARIABLE,
	GRADIENT_RADIAL: PaintStyleType.GRADIENT_RADIAL,
	GRADIENT_DIAMOND: PaintStyleType.GRADIENT_DIAMOND,
	GRADIENT_LINEAR: PaintStyleType.GRADIENT_LINEAR,
	GRADIENT_ANGULAR: PaintStyleType.GRADIENT_ANGULAR,
};

export type PaintSolidStyleType =
	| PaintStyleType.SOLID //
	| PaintStyleType.IMAGE
	| PaintStyleType.VARIABLE
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

export const gridStyleTypeMap = {
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

export const effectStyleTypeMap = {
	DROP_SHADOW: EffectStyleType.DROP_SHADOW,
	INNER_SHADOW: EffectStyleType.INNER_SHADOW,
	LAYER_BLUR: EffectStyleType.LAYER_BLUR,
	BACKGROUND_BLUR: EffectStyleType.BACKGROUND_BLUR,
};

export type CssColor = string;
export type Offset = number;
export type Opacity = number;
export type GradientStop = [CssColor, Offset, Opacity?];

export type StoragePaintSolidSubStyle = [PaintSolidStyleType, CssColor, Opacity];

export type StoragePaintGradientSubStyle = [PaintGradientStyleType, GradientStop[], Opacity];

export type StoragePaintSubStyle = StoragePaintSolidSubStyle | StoragePaintGradientSubStyle;

export type TextStyleMeta = string;

/** true means 'local', otherwise, the string is the Library name */
export type StorageSource = true | string;

export type StorageBaseStyle = [BaseStyle['key'] | BaseStyle['id'], BaseStyle['name']];

export type StoragePaintStyle = [...StorageBaseStyle, StyleType.PAINT, StoragePaintSubStyle[], StorageSource?];
export type StorageEffectStyle = [...StorageBaseStyle, StyleType.EFFECT, EffectStyleType, StorageSource?];
export type StorageGridStyle = [...StorageBaseStyle, StyleType.GRID, GridStyleType, StorageSource?];
export type StorageTextStyle = [...StorageBaseStyle, StyleType.TEXT, TextStyleMeta, StorageSource?];

export type StorageTypeStyle = StoragePaintStyle | StorageEffectStyle | StorageGridStyle | StorageTextStyle;

export type StorageStyle = StorageBaseStyle | StorageTypeStyle;
