// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Invoke the command
setTimeout(() => {
  console.log("invoking command");
  invoke('greet', { name: `
BeginProblem
Condition Isardam
Pieces
White Bh8 Kg4 Pf2 Re1
Black Bd4 Ke5 Re6
Stipulation HS#3
Option NoBoard Try Set Variation
EndProblem
  ` });
}, 1000);
// Listen for progress updates
listen('progress-update', (event) => {
  console.log(`Progress: ${event.payload}%`);
});
