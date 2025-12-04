// =====================================
// UIInventoryDisplay.ts
// Persistent UI showing inventory state
// =====================================

import { inventory } from "./Inventory";

let displayEl: HTMLDivElement | null = null;

export function updateInventoryUI() {
    // Create UI once
    if (!displayEl) {
        displayEl = document.createElement("div");
        displayEl.style.position = "absolute";
        displayEl.style.top = "40px";          
        displayEl.style.right = "10px";
        displayEl.style.padding = "6px 12px";
        displayEl.style.background = "rgba(0,0,0,0.6)";
        displayEl.style.color = "white";
        displayEl.style.fontSize = "16px";
        displayEl.style.fontFamily = "sans-serif";
        displayEl.style.borderRadius = "6px";
        displayEl.style.zIndex = "3000";

        document.body.appendChild(displayEl);
    }

    // Collect badge states
    let lines: string[] = [];

    lines.push(
        inventory.has("GoldenBadge")
            ? "Golden Badge ✔"
            : "Golden Badge ✘"
    );

    lines.push(
        inventory.has("PlatinumBadge")
            ? "Platinum Badge ✔"
            : "Platinum Badge ✘"
    );

    // Display multi-line UI
    displayEl.innerHTML = lines.join("<br>");
}
