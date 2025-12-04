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
