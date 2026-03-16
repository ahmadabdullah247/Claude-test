const adjectives = [
  "Silent",
  "Swift",
  "Brave",
  "Calm",
  "Bold",
  "Wise",
  "Keen",
  "Dark",
  "Wild",
  "Bright",
  "Cool",
  "Sharp",
  "Fierce",
  "Noble",
  "Quiet",
  "Clever",
  "Daring",
  "Epic",
  "Mystic",
  "Sonic",
];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function generateUsername(name: string): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${capitalize(adjective)}${capitalize(name)}${suffix}`;
}
