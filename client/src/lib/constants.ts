export const PROFILE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    alt: "Profile image of a woman with blonde hair",
  },
  {
    url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    alt: "Profile image of a man with dark hair",
  },
  {
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    alt: "Profile image of a woman with curly hair",
  },
];

export const BACKGROUND_OPTIONS = [
  {
    id: 0,
    className: "bg-gradient-to-br from-white to-secondary",
    color: "from-white to-secondary",
  },
  {
    id: 1,
    className: "bg-gradient-to-br from-primary/10 to-accent/10",
    color: "from-primary to-accent",
  },
];

export const GRADIENT_PRESETS = [
  {
    id: "blue-purple",
    name: "Blue to Purple",
    colorFrom: "#3b82f6",
    colorTo: "#8b5cf6",
    direction: "to-br",
  },
  {
    id: "green-emerald",
    name: "Green to Emerald",
    colorFrom: "#10b981",
    colorTo: "#059669",
    direction: "to-r",
  },
  {
    id: "amber-rose",
    name: "Amber to Rose",
    colorFrom: "#f59e0b",
    colorTo: "#fb7185",
    direction: "to-br",
  },
  {
    id: "sky-indigo",
    name: "Sky to Indigo",
    colorFrom: "#0ea5e9",
    colorTo: "#4f46e5",
    direction: "to-tr",
  },
  {
    id: "teal-lime",
    name: "Teal to Lime",
    colorFrom: "#14b8a6",
    colorTo: "#84cc16",
    direction: "to-r",
  },
  {
    id: "fuchsia-pink",
    name: "Fuchsia to Pink",
    colorFrom: "#d946ef",
    colorTo: "#ec4899",
    direction: "to-bl",
  },
];

export const GRADIENT_DIRECTIONS = [
  { id: "to-r", name: "Left to Right", value: "to-r" },
  { id: "to-l", name: "Right to Left", value: "to-l" },
  { id: "to-b", name: "Top to Bottom", value: "to-b" },
  { id: "to-t", name: "Bottom to Top", value: "to-t" },
  { id: "to-tr", name: "Bottom Left to Top Right", value: "to-tr" },
  { id: "to-tl", name: "Bottom Right to Top Left", value: "to-tl" },
  { id: "to-br", name: "Top Left to Bottom Right", value: "to-br" },
  { id: "to-bl", name: "Top Right to Bottom Left", value: "to-bl" },
];
