
import { setLibrarySuggestions } from './suggestions/setLibrarySuggestions';
import { setEffectSuggestions, setGridSuggestions, setPaintSuggestions, setTextSuggestions } from './suggestions/setStyleSuggestions';
import { InputCommand, InputKey } from './utils';

export async function onInput({ parameters, key: _key, query, result }: ParameterInputEvent) {
	const key = _key as InputKey;
	result.setLoadingMessage('Loading Options'); // doesn't appear
	switch (key) {
		case InputCommand.Fill:
			await setPaintSuggestions(result, query);
			break;
		case InputCommand.Stroke:
			await setPaintSuggestions(result, query);
			break;
		case InputCommand.Text:
			await setTextSuggestions(result, query);
			break;
		case InputCommand.Effect:
			await setEffectSuggestions(result, query);
			break;
		case InputCommand.Grid:
			await setGridSuggestions(result, query);
			break;
		case InputCommand.ToggleStyle:
			await setLibrarySuggestions(result, query, true);
			break;
		case InputCommand.PublishStyle:
			// no input
			break;
		case InputCommand.DeleteStyle:
			await setLibrarySuggestions(result, query);
			break;
		default:
			break;
	}
}

