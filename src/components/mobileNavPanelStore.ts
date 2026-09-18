export type MobilePanel = "none" | "search" | "menu";

let panel: MobilePanel = "none";
const listeners = new Set<() => void>();

export function getMobilePanel(): MobilePanel {
  return panel;
}

export function subscribeMobilePanel(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setPanel(next: MobilePanel) {
  panel = next;
  listeners.forEach((listener) => listener());
}

export function toggleMobilePanel(target: MobilePanel) {
  setPanel(panel === target ? "none" : target);
}

export function closeMobilePanel() {
  if (panel !== "none") setPanel("none");
}
