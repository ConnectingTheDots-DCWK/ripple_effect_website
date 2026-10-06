/**
 * Every node type the app registers — the wire names `board_add_node` takes
 * and `node_types` lists — with the name on the card.
 *
 * **Generated** by `melos run editor:docs:nodes` in the app repository, out
 * of `buildNarrativeRegistry()` and `buildMacroRegistry()`, beside the
 * nodes reference itself. Do not edit it by hand.
 *
 * Previews live at `src/assets/screenshots/nodes/<type>-<dark|light>.png` —
 * the card alone on the canvas, every port visible, nothing wired, at the
 * canvas's default zoom.
 */
export const nodeTypes = {
  'start': 'Start',
  'macro': 'Macro',
  'jump': 'Jump',
  'while': 'While',
  'for': 'For',
  'switch': 'Switch',
  'flow.if': 'If',
  'flow.all': 'Do all',
  'fsm': 'State machine',
  'cvar.branch': 'Variable branch',
  'flow.delay': 'Delay',
  'flow.flipflop': 'FlipFlop',
  'flow.once': 'Once',
  'end': 'End',
  'narration': 'Narration',
  'display': 'Output',
  'input': 'Input',
  'flow.sound': 'Play sound',
  'math.operator': 'Operator',
  'logic.comparator': 'Comparator',
  'list.insert': 'Insert',
  'list.at': 'At',
  'list.remove': 'Remove',
  'list.size': 'Size',
  'map.get': 'Get',
  'map.set': 'Set',
  'map.remove': 'Remove',
  'map.keys': 'Keys',
  'map.values': 'Values',
  'map.merge': 'Merge',
  'map.size': 'Size',
  'component': 'Component',
  'component.spawn': 'Spawn',
  'component.delete': 'Delete Entity',
  'component.exists': 'Entity Exists',
  'component.names': 'Entity Names',
  'script': 'Script',
  'cvar.get': 'Get variable',
  'cvar.set': 'Set variable',
  'random.number': 'Random number',
  'random.string': 'Random string',
  'value.number': 'number',
  'value.bool': 'bool',
  'value.string': 'string',
  'value.numberList': 'list<number>',
  'value.boolList': 'list<bool>',
  'value.stringList': 'list<string>',
  'random.dice': 'Dice roller',
  'random.check': 'Percentile check',
  'random.weighted': 'Weighted branch',
  'macro.in': 'Macro In',
  'macro.out': 'Macro Out',
} as const;

export type NodeType = keyof typeof nodeTypes;
