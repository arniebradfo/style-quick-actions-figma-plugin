interface SuggestionObj<Data = any> {
	name: string;
	data?: Data;
	icon?: string | Uint8Array;
	iconUrl?: string;
}

type StorageStyle = [BaseStyle['key'], BaseStyle['name']];
interface StyleClientStorage {
	paint: StorageStyle[];
	text: StorageStyle[];
	effect: StorageStyle[];
	grid: StorageStyle[];
	saved: number;
}
type StyleClientStorageType = keyof Omit<StyleClientStorage, 'saved'>;

type Suggestion<Data = any> = SuggestionObj<Data> | string;
