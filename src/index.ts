import { onRun } from './onRun';
import { onInput } from './onInput';

figma.on('run', onRun);
figma.parameters.on('input', onInput);

// figma.on('run', deleteAllPluginData); // select publish to run
