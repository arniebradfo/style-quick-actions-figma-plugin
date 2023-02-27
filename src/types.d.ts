interface SuggestionObj<Data = any> {
	name: string;
	data?: Data;
	icon?: string | Uint8Array;
	iconUrl?: string;
}

interface StyleClientStorage {
	paint: string[];
	text: string[];
	effect: string[];
	grid: string[];
	saved: number;
}

type Suggestion<Data = any> = SuggestionObj<Data> | string;
