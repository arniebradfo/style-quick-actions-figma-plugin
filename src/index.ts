import { onRun } from './onRun';
import { onInput } from './onInput';

figma.on('run', onRun);
figma.parameters.on('input', onInput);
