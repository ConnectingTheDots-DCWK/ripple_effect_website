---
title: How to build a campaign with no Python
description: Turn Python off in a project's settings so the app flags every card that needs the interpreter, and export a campaign for a player built without it.
---

Use this when the campaign is for a game or a player built without the Python interpreter, and you want the app to tell you everything that would need it.

1. Open the project's settings and go to the **Capabilities** page.
2. Turn **Python** off.
3. Open **Messages**. Each Script node and each passage with a `{{ … }}` or a `ripple` block is listed there and marked as an error on its card:
   - [`E.EX.01`](/reference/diagnostics/#eex01) is a Script node.
   - [`E.EX.02`](/reference/diagnostics/#eex02) is a passage that runs Python, in any of its languages.
4. Replace each one with cards that do not need Python, such as a console variable set and read by its own nodes, or a branch on a value. Until none are left, the campaign will not play or export.
5. [Export the campaign](/how-to/export-for-a-player-without-python/). **Needs no Python** is ticked in the export dialog and cannot be unticked while the project has Python off.

To go back, turn **Python** on again. Nothing about the project has changed, and it plays and exports as before.

:::note
What a player built without Python does with a campaign that still has Python in it is covered in [the export guide](/how-to/export-for-a-player-without-python/).
:::

## Related

- [How to export for a player without Python](/how-to/export-for-a-player-without-python/)
- [How to run Python in a story](/how-to/script-a-passage/)
- [Python in a story](/explanation/python-in-a-story/)
- [Diagnostics](/reference/diagnostics/)
