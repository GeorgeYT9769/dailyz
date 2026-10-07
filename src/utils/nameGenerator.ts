// Generator for fun, charismatic, and interesting adventurer names
const adjectives = [
  'Cosmic', 'Astral', 'Mystic', 'Neon', 'Quantum', 'Starlight', 'Obsidian',
  'Radiant', 'Solar', 'Lunar', 'Echo', 'Cyber', 'Velvet', 'Shadow', 'Glitch',
  'Phoenix', 'Chrono', 'Spark', 'Prism', 'Thunder', 'Silver', 'Frost',
  'Celestial', 'Ember', 'Zenith', 'Crimson', 'Hyperion', 'Zephyr', 'Iron',
  'Nova', 'Rune', 'Vortex', 'Golden', 'Twilight', 'Emerald', 'Storm',
  'Swift', 'Electric', 'Phantom', 'Apex', 'Lucid', 'Stellar', 'Arcane',
  'Drift', 'Starforged', 'Dawn', 'Midnight', 'Atlas', 'Solitary', 'Wild'
];

const nouns = [
  'Voyager', 'Nomad', 'Seeker', 'Wanderer', 'Ranger', 'Pioneer', 'Alchemist',
  'Knight', 'Strider', 'Walker', 'Ronin', 'Pilgrim', 'Dreamer', 'Maverick',
  'Scout', 'Wayfarer', 'Pathfinder', 'Champion', 'Striker', 'Sage', 'Corsair',
  'Drake', 'Falcon', 'Lynx', 'Hawk', 'Fox', 'Shaman', 'Glider', 'Hunter',
  'Sentinel', 'Sparrow', 'Wolf', 'Raven', 'Weaver', 'Pilot', 'Explorer',
  'Otter', 'Capybara', 'Rogue', 'Guardian', 'Drifter', 'Crafter', 'Specter'
];

const curatedIconicNames = [
  'Cosmic Wanderer',
  'Starlight Nomad',
  'Shadow Whisperer',
  'Quantum Seeker',
  'Nebula Fox',
  'Echo Ranger',
  'Mystic Voyager',
  'Cyber Falcon',
  'Solar Pioneer',
  'Lunar Rogue',
  'Drift Alchemist',
  'Vortex Knight',
  'Zenith Traveler',
  'Astral Pathfinder',
  'Chrono Drifter',
  'Spark Weaver',
  'Nova Pilgrim',
  'Atlas Horizon',
  'Phoenix Drift',
  'Pixel Maverick',
  'Glitch Ronin',
  'Radiant Mirage',
  'Velvet Storm',
  'Neon Lynx',
  'Obsidian Strider',
  'Dawn Striker',
  'Silver Vanguard',
  'Frost Drake',
  'Phantom Dreamer',
  'Zephyr Walker',
  'Prism Nomad',
  'Starforged Scout',
  'Arcane Finch',
  'Hyperion Seeker'
];

export function getRandomInterestingName(): string {
  // 40% chance curated favorite, 60% dynamic combination
  if (Math.random() < 0.4) {
    const idx = Math.floor(Math.random() * curatedIconicNames.length);
    return curatedIconicNames[idx];
  }
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}
