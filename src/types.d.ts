interface SuggestionObj<Data = any> {
	name: string;
	data?: Data;
	icon?: string | Uint8Array;
	iconUrl?: string;
}

type Suggestion<Data = any> = SuggestionObj<Data> | string
