import { keyText, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

const WIDGET = "pi-prompt-delivery";

function compactKey(key: string): string {
	return key.replace(/\benter\b/g, "ent").replace(/\boption\b/g, "opt");
}

/** Preview native Pi delivery without intercepting input or replacing the editor/footer. */
export default function promptDelivery(pi: ExtensionAPI) {
	let enabled = true;
	let requestRender: (() => void) | undefined;

	function install(ctx: ExtensionContext) {
		if (ctx.mode !== "tui") return;
		if (!enabled) {
			ctx.ui.setWidget(WIDGET, undefined);
			return;
		}

		ctx.ui.setWidget(WIDGET, (tui, theme) => {
			const refresh = () => tui.requestRender();
			requestRender = refresh;
			return {
				invalidate() {},
				dispose() {
					if (requestRender === refresh) requestRender = undefined;
				},
				render(width: number): string[] {
					if (width <= 0) return [];
					// Read live state: don't infer idleness from agent_end, which may
					// precede retries, compaction, or another queued continuation.
					if (ctx.isIdle()) return [];
					const submit = compactKey(keyText("tui.input.submit"));
					const followUp = compactKey(keyText("app.message.followUp"));
					const draft = ctx.ui.getEditorText().trimStart();
					const special = draft.startsWith("/") || draft.startsWith("!");
					const parts: string[] = [];
					if (special) {
						// Commands and shell input have special handling; do not claim
						// they'll follow the ordinary chat-message queue rules.
						parts.push(theme.fg("muted", "Command input: delivery depends on command"));
					} else {
						if (submit) parts.push(theme.fg("accent", `Steer · ${submit}`));
						if (followUp) parts.push(theme.fg("muted", `Queue · ${followUp}`));
					}
					if (parts.length === 0) parts.push(theme.fg("muted", "No submit shortcuts bound"));
					const line = parts.join(theme.fg("dim", " / "));
					return [truncateToWidth(line, width)];
				},
			};
		}, { placement: "aboveEditor" });
	}

	pi.on("session_start", (_event, ctx) => install(ctx));
	pi.on("agent_start", () => requestRender?.());
	pi.on("agent_end", () => requestRender?.());
	pi.on("agent_settled", () => requestRender?.());
	pi.on("session_compact", () => requestRender?.());
	pi.on("session_compact_failed", () => requestRender?.());
	pi.on("session_shutdown", () => { requestRender = undefined; });

	pi.registerCommand("prompt-delivery", {
		description: "Toggle the send/steer/follow-up hint above the editor",
		handler: async (_args, ctx) => {
			if (ctx.mode !== "tui") return;
			enabled = !enabled;
			install(ctx);
			ctx.ui.notify(`Prompt delivery hint ${enabled ? "enabled" : "hidden"}`, "info");
		},
	});
}
