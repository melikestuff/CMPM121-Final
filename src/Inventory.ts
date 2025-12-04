export class Inventory {
  private items: Set<string> = new Set();

  constructor() {
    // load data if exists
    const saved = localStorage.getItem("inventory");
    if (saved) {
      this.items = new Set(JSON.parse(saved));
    }
  }

  has(item: string): boolean {
    return this.items.has(item);
  }

  add(item: string) {
    this.items.add(item);
    this.save();
  }

  remove(item: string) {
    this.items.delete(item);
    this.save();
  }

  clear() {
    this.items.clear();
    this.save();
  }

  save() {
    localStorage.setItem("inventory", JSON.stringify([...this.items]));
  }
  
}

// Export a singleton instance so all scenes share the same inventory
export const inventory = new Inventory();

export function updateInventoryLabel() {
    let label = document.getElementById("inventory-label");

    if (!label) return;

    const items = [];

    if (inventory.has("GoldenBadge")) items.push("Golden Badge");
    if (inventory.has("PlatinumBadge")) items.push("Platinum Badge");

    label.textContent = items.length > 0 ?
        `Items: ${items.join(", ")}` :
        "Items: (none)";
}
