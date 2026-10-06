/**
 * The tools the MCP server exposes, by their wire names.
 *
 * **Thirty-nine, and the number is worth being exact about** — it is the one
 * claim in that section a reader can check in an afternoon. Thirty-two landed
 * with the server, 1.3.2 added three — `node_types`, `campaign_trace` and
 * `campaign_answer` — and 1.4 added the four soundscape tools. They are transcribed from the app's dispatch table rather
 * than counted off the spec, because the spec describes the surface and the
 * table *is* it. `board` and `passage` look like tool names in a naive grep of
 * that directory and are not: they are resource URI segments,
 * `ripple://board/{id}` and `ripple://passage/{id}`, and counting them gives
 * thirty-seven.
 *
 * The grouping is the app's own, and the split that matters is the last one:
 * everything under `write` is unreachable unless the author has turned on
 * *Agents may edit*, which is a second switch subordinate to the first.
 */
export interface ToolGroup {
  label: string;
  tools: string[];
}

export const mcpToolGroups: ToolGroup[] = [
  {
    label: "Orientation and reading",
    tools: [
      "project_info",
      "project_outline",
      "catalog_find",
      "board_read",
      "board_links",
      "passage_read",
      "component_read",
      "soundscape_read",
      "diagnostics_read",
    ],
  },
  {
    label: "Analysis",
    tools: [
      "trace_between",
      "trace_into",
      "translation_status",
      "node_types",
      "python_capabilities",
      "python_eval",
    ],
  },
  {
    label: "Playtesting",
    tools: [
      "campaign_start",
      "campaign_state",
      "campaign_choose",
      "campaign_answer",
      "campaign_trace",
      "campaign_autoplay",
      "campaign_end",
    ],
  },
  {
    label: "Writing",
    tools: [
      "passage_create",
      "passage_write",
      "component_write",
      "board_add_passage",
      "board_add_node",
      "board_connect",
      "file_create",
      "save",
    ],
  },
  {
    label: "Editing",
    tools: [
      "board_set_node",
      "board_set_choice",
      "board_disconnect",
      "board_remove_node",
      "file_move",
      "file_delete",
    ],
  },
  {
    label: "Sound",
    tools: ["soundscape_set", "soundscape_add_clip", "soundscape_set_clip"],
  },
];

export const mcpTools: string[] = mcpToolGroups.flatMap((g) => g.tools);
