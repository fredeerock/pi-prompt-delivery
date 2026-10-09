# pi-prompt-delivery

A passive delivery hint above Pi's editor. It does not replace the editor or footer, intercept keystrokes, or change native message routing.

- Idle: hidden (no status row).
- Busy: **Steer · ent / Queue · opt+ent**. Steering reaches the next safe turn; follow-ups wait until after the current run.
- Reads active keybindings, including remapped or disabled shortcuts.
- Always uses one line, truncated to fit narrow terminals. Key labels abbreviate Enter to `ent` and Option to `opt`.
- **Queue** labels the follow-up shortcut; as in native Pi, that shortcut sends immediately when idle.
- Slash and shell input show a command-specific notice rather than a misleading message-routing promise.
- TUI only; no timers, model calls, or network access.

Defaults on macOS are Enter to send/steer and Option+Enter to queue a follow-up. Both keys send immediately when idle. During compaction, ordinary input waits for compaction to finish before native queue delivery resumes. Steering does not interrupt a tool in mid-call.

This reports the main Pi agent's state, not detached background tasks. It assumes native Pi routing; another extension that takes ownership of the composer or queues may change the behavior.

## Installation

```sh
pi install git:github.com/fredeerock/pi-prompt-delivery
```

Run `/reload` to activate it. Update with `pi update git:github.com/fredeerock/pi-prompt-delivery`.

For development, install a local checkout with `pi install ./pi-prompt-delivery` instead. Use only one installation method; remove any loose `~/.pi/agent/extensions/prompt-delivery.ts` copy to avoid loading it twice.

Use `/prompt-delivery` to hide or show the hint. The preference resets on reload.
