// ============================================
// OpenLife — Integrated Life Simulation Data
// Ported & Enhanced from OpenLife (BitLife-inspired engine)
// ============================================

export interface OpenLifeDiet {
  id: string;
  name: string;
  healthDelta: number;     // e.g. +0.20, -0.60
  happinessDelta: number;  // e.g. +0.30, -1.00
  stressDelta: number;
  costPerShift: number;    // In cash currency (₵)
  description: string;
  icon: string;
}

export const OPENLIFE_DIETS: Record<string, OpenLifeDiet> = {
  standard: {
    id: 'standard',
    name: 'Balanced Home Cooking',
    healthDelta: 2,
    happinessDelta: 2,
    stressDelta: -2,
    costPerShift: 25,
    description: 'Fresh local produce, jollof rice, plantains, and lean protein.',
    icon: '🍲',
  },
  mediterranean: {
    id: 'mediterranean',
    name: 'Mediterranean Diet',
    healthDelta: 6,
    happinessDelta: 8,
    stressDelta: -6,
    costPerShift: 45,
    description: 'Olive oil, fresh fish, whole grains, and leafy greens. Top tier for longevity and mental clarity.',
    icon: '🥗',
  },
  vegetarian: {
    id: 'vegetarian',
    name: 'Vegetarian Lifestyle',
    healthDelta: 4,
    happinessDelta: 3,
    stressDelta: -3,
    costPerShift: 20,
    description: 'Nutrient-rich legumes, beans, vegetables, and fruit. Very economical and heart-healthy.',
    icon: '🥑',
  },
  vegan: {
    id: 'vegan',
    name: 'Plant-Based Vegan',
    healthDelta: 5,
    happinessDelta: 4,
    stressDelta: -2,
    costPerShift: 40,
    description: '100% plant-based diet. High antioxidants, ethical, and clean digestion.',
    icon: '🌱',
  },
  fastfood: {
    id: 'fastfood',
    name: 'Fast Food & Street Snacks',
    healthDelta: -12,
    happinessDelta: -8,
    stressDelta: 6,
    costPerShift: 70,
    description: 'Fried meat pies, oily takeout, and sodas. Drains vitality and tanks long-term health.',
    icon: '🍔',
  },
  caffeine_donut: {
    id: 'caffeine_donut',
    name: 'Coffee, Donut & Hustle',
    healthDelta: -8,
    happinessDelta: 1,
    stressDelta: 10,
    costPerShift: 18,
    description: 'Three espressos and a pastry. Quick morning burst of focus, followed by an afternoon crash.',
    icon: '☕',
  },
};

export interface OpenLifeDisease {
  id: string;
  name: string;
  cureChance: number;
  treatmentCost: number;
  symptoms: string;
  icon: string;
}

export const OPENLIFE_DISEASES: Record<string, OpenLifeDisease> = {
  commonCold: {
    id: 'commonCold',
    name: 'Common Viral Cold',
    cureChance: 0.95,
    treatmentCost: 30,
    symptoms: 'Nasal congestion, mild headache, fatigue.',
    icon: '🤧',
  },
  anxiety: {
    id: 'anxiety',
    name: 'Shift Work Anxiety',
    cureChance: 0.45,
    treatmentCost: 120,
    symptoms: 'Racing thoughts, tightness in chest during high-volume rush.',
    icon: '⚡',
  },
  depression: {
    id: 'depression',
    name: 'Clinical Depression',
    cureChance: 0.35,
    treatmentCost: 160,
    symptoms: 'Low motivation, persistent blues, poor sleep quality.',
    icon: '🌧️',
  },
  hbp: {
    id: 'hbp',
    name: 'Stage 1 Hypertension',
    cureChance: 0.25,
    treatmentCost: 190,
    symptoms: 'Elevated blood pressure, afternoon headaches.',
    icon: '❤️‍🩹',
  },
  insomnia: {
    id: 'insomnia',
    name: 'Chronic Insomnia',
    cureChance: 0.50,
    treatmentCost: 85,
    symptoms: 'Waking at 3 AM thinking about counter interactions and rent.',
    icon: '👁️',
  },
  burnout: {
    id: 'burnout',
    name: 'Severe Intern Burnout',
    cureChance: 0.40,
    treatmentCost: 140,
    symptoms: 'Exhaustion, cynicism, sluggish diagnostic speed.',
    icon: '🔥',
  },
};

export interface OpenLifeBook {
  id: string;
  title: string;
  author: string;
  category: 'clinical' | 'fiction' | 'self_improvement' | 'business';
  intelBonus: number;
  happinessBonus: number;
  stressRelief: number;
  pageCount: number;
}

export const OPENLIFE_BOOKS: OpenLifeBook[] = [
  {
    id: 'bnf86',
    title: 'British National Formulary (BNF)',
    author: 'Royal Pharmaceutical Society',
    category: 'clinical',
    intelBonus: 12,
    happinessBonus: 2,
    stressRelief: -2,
    pageCount: 1450,
  },
  {
    id: 'grays_anatomy',
    title: "Gray's Anatomy of the Human Body",
    author: 'Henry Gray',
    category: 'clinical',
    intelBonus: 10,
    happinessBonus: 1,
    stressRelief: 0,
    pageCount: 1240,
  },
  {
    id: 'tale_two_cities',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    category: 'fiction',
    intelBonus: 5,
    happinessBonus: 8,
    stressRelief: 6,
    pageCount: 438,
  },
  {
    id: 'great_gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'fiction',
    intelBonus: 4,
    happinessBonus: 9,
    stressRelief: 5,
    pageCount: 208,
  },
  {
    id: 'atomic_habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'self_improvement',
    intelBonus: 7,
    happinessBonus: 10,
    stressRelief: 8,
    pageCount: 320,
  },
  {
    id: 'fast_and_slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'self_improvement',
    intelBonus: 11,
    happinessBonus: 6,
    stressRelief: 4,
    pageCount: 499,
  },
  {
    id: 'intelligent_investor',
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    category: 'business',
    intelBonus: 9,
    happinessBonus: 5,
    stressRelief: 3,
    pageCount: 640,
  },
];

export interface OpenLifeProperty {
  id: string;
  name: string;
  type: string;
  price: number;
  monthlyRent: number;
  appreciationRate: number;
  icon: string;
  description: string;
}

export const OPENLIFE_PROPERTIES: OpenLifeProperty[] = [
  {
    id: 'studio_yaba',
    name: 'Studio Apartment (Yaba Tech District)',
    type: 'Studio Apartment',
    price: 35000,
    monthlyRent: 400,
    appreciationRate: 0.05,
    icon: '🏢',
    description: 'Cozy modern studio close to university clinics and commuter buses.',
  },
  {
    id: 'duplex_surulere',
    name: '3-Bedroom Duplex (Surulere)',
    type: 'Duplex',
    price: 110000,
    monthlyRent: 950,
    appreciationRate: 0.06,
    icon: '🏡',
    description: 'Spacious family duplex with private generator hookup and secure compound.',
  },
  {
    id: 'villa_lekki',
    name: 'Waterfront Villa (Lekki Phase 1)',
    type: 'Luxury Villa',
    price: 360000,
    monthlyRent: 2600,
    appreciationRate: 0.07,
    icon: '🏛️',
    description: 'Executive residence with garden, swimming pool, and solar inverter array.',
  },
  {
    id: 'penthouse_vi',
    name: 'Apex Sky Penthouse (Victoria Island)',
    type: 'High-Rise Penthouse',
    price: 850000,
    monthlyRent: 5800,
    appreciationRate: 0.08,
    icon: '🏙️',
    description: 'Panoramic skyline views overlooking the Atlantic coast and business towers.',
  },
  {
    id: 'country_farm',
    name: 'Medicinal Herb Farm Estate',
    type: 'Agricultural Estate',
    price: 520000,
    monthlyRent: 3400,
    appreciationRate: 0.06,
    icon: '🌾',
    description: 'Productive farmland growing high-yield botanical ingredients and aloe vera.',
  },
];

export interface OpenLifeVehicle {
  id: string;
  name: string;
  brand: string;
  price: number;
  condition: number; // 0 - 100
  runningCostPerShift: number;
  icon: string;
}

export const OPENLIFE_VEHICLES: OpenLifeVehicle[] = [
  {
    id: 'smart_mini',
    name: 'Smart Mini Urban Runabout',
    brand: 'Mini Motors',
    price: 18000,
    condition: 92,
    runningCostPerShift: 12,
    icon: '🚗',
  },
  {
    id: 'holder_civil',
    name: 'Holder Civil 1.8L Sedan',
    brand: 'Holder',
    price: 28000,
    condition: 98,
    runningCostPerShift: 16,
    icon: '🚘',
  },
  {
    id: 'holder_accorda',
    name: 'Holder Accorda Executive',
    brand: 'Holder',
    price: 42000,
    condition: 95,
    runningCostPerShift: 22,
    icon: '🏎️',
  },
  {
    id: 'merchant_c',
    name: 'Merchant C-Class Luxury',
    brand: 'Merchant',
    price: 58000,
    condition: 99,
    runningCostPerShift: 30,
    icon: '✨',
  },
  {
    id: 'openmotors_ev',
    name: 'OpenMotors Model 3000 EV',
    brand: 'OpenMotors',
    price: 76000,
    condition: 100,
    runningCostPerShift: 8,
    icon: '⚡',
  },
];

export interface OpenLifeStock {
  symbol: string;
  name: string;
  category: 'pharma' | 'tech' | 'energy' | 'etf' | 'crypto';
  price: number;
  changePercent: number;
  sharesOwned: number;
  icon: string;
}

export const OPENLIFE_MARKET_ASSETS: OpenLifeStock[] = [
  {
    symbol: 'PHRM',
    name: 'Apex PharmaCorp',
    category: 'pharma',
    price: 142.50,
    changePercent: 2.4,
    sharesOwned: 0,
    icon: '💊',
  },
  {
    symbol: 'BIO',
    name: 'BioGenetics Therapeutics',
    category: 'pharma',
    price: 88.20,
    changePercent: -1.2,
    sharesOwned: 0,
    icon: '🧬',
  },
  {
    symbol: 'MEDX',
    name: 'Medix Health Clinics',
    category: 'pharma',
    price: 64.00,
    changePercent: 3.8,
    sharesOwned: 0,
    icon: '🏥',
  },
  {
    symbol: 'VN500',
    name: 'Metropolis Vanguard Index',
    category: 'etf',
    price: 420.00,
    changePercent: 0.8,
    sharesOwned: 0,
    icon: '📊',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin (BTC)',
    category: 'crypto',
    price: 64200.00,
    changePercent: 4.1,
    sharesOwned: 0,
    icon: '🪙',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum (ETH)',
    category: 'crypto',
    price: 3450.00,
    changePercent: -2.3,
    sharesOwned: 0,
    icon: '💎',
  },
];

export interface OpenLifeRelationship {
  id: string;
  name: string;
  relationship: 'mother' | 'father' | 'partner' | 'friend' | 'colleague';
  affinity: number; // 0 - 100
  status: string;
  avatar: string;
}

export const INITIAL_OPENLIFE_RELATIONSHIPS: OpenLifeRelationship[] = [
  {
    id: 'mama_tobi',
    name: 'Mama Tobi',
    relationship: 'mother',
    affinity: 88,
    status: 'Calls every Sunday after church to pray for your shifts.',
    avatar: '👵🏾',
  },
  {
    id: 'papa_tobi',
    name: 'Papa Tobi',
    relationship: 'father',
    affinity: 80,
    status: 'Retired civil engineer. Proud of your clinical registration.',
    avatar: '👴🏾',
  },
  {
    id: 'simi_dr',
    name: 'Dr. Simi Adeleke',
    relationship: 'partner',
    affinity: 92,
    status: 'Senior resident at Apex Teaching Hospital. Your supportive fiancee.',
    avatar: '👩🏾‍⚕️',
  },
  {
    id: 'emeka_pharma',
    name: 'Emeka Okafor',
    relationship: 'friend',
    affinity: 75,
    status: 'Faculty classmate who launched an independent wholesale pharma agency.',
    avatar: '👨🏾‍💼',
  },
];

export interface OpenLifeLifeEvent {
  id: string;
  title: string;
  description: string;
  statDeltas: {
    happiness?: number;
    health?: number;
    intel?: number;
    looks?: number;
    cash?: number;
    stress?: number;
  };
}

export const OPENLIFE_RANDOM_EVENTS: OpenLifeLifeEvent[] = [
  {
    id: 'rent_kindness',
    title: 'Landlord Goodwill Discount',
    description: 'Your landlord noticed how quiet and professional you are. They knocked ₵80 off your upcoming rent!',
    statDeltas: { happiness: 10, stress: -8, cash: 80 },
  },
  {
    id: 'lottery_scratcher',
    title: 'Lucky Corner Kiosk Scratch-off',
    description: 'You bought a ₵5 scratcher with your morning tea and hit a ₵150 bonus prize!',
    statDeltas: { happiness: 12, cash: 150 },
  },
  {
    id: 'research_article',
    title: 'Pharmacotherapy Journal Feature',
    description: 'Your clinical note on antibiotic stewardship was accepted into the National Pharmacists Digest!',
    statDeltas: { intel: 8, happiness: 10, stress: -4 },
  },
  {
    id: 'family_care_package',
    title: 'Mama’s Care Package',
    description: 'Mama Tobi sent over a cooler with frozen beef stew, smoked fish, and fried plantains. You saved grocery cash!',
    statDeltas: { happiness: 14, health: 5, cash: 45, stress: -6 },
  },
  {
    id: 'gym_milestone',
    title: 'Morning 5K Personal Best',
    description: 'You woke up at 6:00 AM and set a new running record along the marina promenade before your shift.',
    statDeltas: { health: 8, looks: 5, stress: -8, happiness: 6 },
  },
];
