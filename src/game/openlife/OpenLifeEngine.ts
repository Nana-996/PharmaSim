// ============================================
// OpenLife — Integrated Life Simulation Engine
// Full BitLife-Style Mechanics & Console System
// ============================================

import {
  OPENLIFE_DIETS,
  OPENLIFE_DISEASES,
  OPENLIFE_BOOKS,
  OPENLIFE_PROPERTIES,
  OPENLIFE_VEHICLES,
  OPENLIFE_MARKET_ASSETS,
  INITIAL_OPENLIFE_RELATIONSHIPS,
  OPENLIFE_RANDOM_EVENTS,
  type OpenLifeDiet,
  type OpenLifeDisease,
  type OpenLifeBook,
  type OpenLifeProperty,
  type OpenLifeVehicle,
  type OpenLifeStock,
  type OpenLifeRelationship,
  type OpenLifeLifeEvent,
} from './openLifeData';

export interface OpenLifeStats {
  happiness: number; // 0 - 100
  health: number;    // 0 - 100
  intel: number;     // 0 - 100
  looks: number;     // 0 - 100
  karma: number;     // 0 - 100
  fame: number;      // 0 - 100
}

export interface OpenLifeState {
  stats: OpenLifeStats;
  currentDietId: string;
  activeDiseases: string[];
  readBookIds: string[];
  ownedProperties: Array<{ propertyId: string; purchasePrice: number; currentVal: number }>;
  ownedVehicles: Array<{ vehicleId: string; condition: number }>;
  portfolio: Record<string, number>; // symbol -> shares/coins
  marketAssets: OpenLifeStock[];
  relationships: OpenLifeRelationship[];
  lotteryHistory: { ticketsBought: number; totalWon: number };
  recentLifeEvent: OpenLifeLifeEvent | null;
  consoleHistory: Array<{ text: string; type: 'input' | 'output' | 'error' | 'success' }>;
  cheatsEnabled: boolean;
}

export class OpenLifeEngine {
  private state: OpenLifeState;

  constructor(initialCash: number = 420) {
    this.state = {
      stats: {
        happiness: 82,
        health: 88,
        intel: 85,
        looks: 78,
        karma: 90,
        fame: 10,
      },
      currentDietId: 'standard',
      activeDiseases: [],
      readBookIds: ['bnf86'],
      ownedProperties: [],
      ownedVehicles: [],
      portfolio: {
        PHRM: 5,
        VN500: 2,
      },
      marketAssets: JSON.parse(JSON.stringify(OPENLIFE_MARKET_ASSETS)),
      relationships: JSON.parse(JSON.stringify(INITIAL_OPENLIFE_RELATIONSHIPS)),
      lotteryHistory: { ticketsBought: 0, totalWon: 0 },
      recentLifeEvent: null,
      consoleHistory: [
        { text: 'OpenLife Simulation Engine v2.4 initialized.', type: 'output' },
        { text: "Type 'help' for available life console commands.", type: 'output' },
      ],
      cheatsEnabled: false,
    };
  }

  public getState(): OpenLifeState {
    return this.state;
  }

  // --- STAT MODIFIERS ---
  public modifyStat(stat: keyof OpenLifeStats, delta: number): void {
    const val = Math.max(0, Math.min(100, this.state.stats[stat] + delta));
    this.state.stats[stat] = Math.round(val);
  }

  // --- DIET MANAGEMENT ---
  public setDiet(dietId: string): { success: boolean; message: string; diet: OpenLifeDiet } {
    const diet = OPENLIFE_DIETS[dietId];
    if (!diet) {
      return { success: false, message: 'Invalid diet selection.', diet: OPENLIFE_DIETS.standard };
    }
    this.state.currentDietId = dietId;
    return {
      success: true,
      message: `Adopted ${diet.name}. Daily cost: ₵${diet.costPerShift}.`,
      diet,
    };
  }

  public getCurrentDiet(): OpenLifeDiet {
    return OPENLIFE_DIETS[this.state.currentDietId] || OPENLIFE_DIETS.standard;
  }

  // --- HEALTHCARE & CLINIC ---
  public visitDoctor(diseaseId: string, playerCash: number): { success: boolean; cured: boolean; cost: number; message: string } {
    const disease = OPENLIFE_DISEASES[diseaseId];
    if (!disease) {
      return { success: false, cured: false, cost: 0, message: 'Unknown condition.' };
    }

    if (playerCash < disease.treatmentCost) {
      return { success: false, cured: false, cost: 0, message: `Insufficient funds. Treatment requires ₵${disease.treatmentCost}.` };
    }

    const cured = Math.random() < disease.cureChance;
    if (cured) {
      this.state.activeDiseases = this.state.activeDiseases.filter(d => d !== diseaseId);
      this.modifyStat('health', 15);
      this.modifyStat('happiness', 12);
      return {
        success: true,
        cured: true,
        cost: disease.treatmentCost,
        message: `Great news! Dr. Okon successfully treated your ${disease.name}!`,
      };
    } else {
      this.modifyStat('health', 4);
      return {
        success: true,
        cured: false,
        cost: disease.treatmentCost,
        message: `Treated ${disease.name}, but symptoms persist. You need further follow-up.`,
      };
    }
  }

  public addDisease(diseaseId: string): void {
    if (!this.state.activeDiseases.includes(diseaseId) && OPENLIFE_DISEASES[diseaseId]) {
      this.state.activeDiseases.push(diseaseId);
      this.modifyStat('happiness', -10);
      this.modifyStat('health', -8);
    }
  }

  // --- GYM & FITNESS ---
  public visitGym(playerCash: number): { success: boolean; cost: number; message: string } {
    const cost = 25;
    if (playerCash < cost) {
      return { success: false, cost: 0, message: `Gym day pass costs ₵${cost}. Insufficient cash.` };
    }

    this.modifyStat('health', 6);
    this.modifyStat('looks', 4);
    this.modifyStat('happiness', 6);

    return {
      success: true,
      cost,
      message: 'Completed an intense 45-minute workout session! Vitality and looks increased.',
    };
  }

  // --- LIBRARY & BOOKS ---
  public readBook(bookId: string): { success: boolean; message: string; book: OpenLifeBook } {
    const book = OPENLIFE_BOOKS.find(b => b.id === bookId);
    if (!book) {
      return { success: false, message: 'Book not found.', book: OPENLIFE_BOOKS[0] };
    }

    if (!this.state.readBookIds.includes(bookId)) {
      this.state.readBookIds.push(bookId);
    }

    this.modifyStat('intel', book.intelBonus);
    this.modifyStat('happiness', book.happinessBonus);

    return {
      success: true,
      message: `Finished reading "${book.title}" by ${book.author}! +${book.intelBonus}% Intel.`,
      book,
    };
  }

  // --- REAL ESTATE & PROPERTY ---
  public buyProperty(propertyId: string, playerCash: number): { success: boolean; cost: number; message: string } {
    const prop = OPENLIFE_PROPERTIES.find(p => p.id === propertyId);
    if (!prop) return { success: false, cost: 0, message: 'Property not found.' };

    const downPayment = Math.round(prop.price * 0.20);
    if (playerCash < downPayment) {
      return { success: false, cost: 0, message: `Requires a 20% down payment of ₵${downPayment.toLocaleString()}.` };
    }

    this.state.ownedProperties.push({
      propertyId: prop.id,
      purchasePrice: prop.price,
      currentVal: prop.price,
    });

    this.modifyStat('happiness', 15);
    return {
      success: true,
      cost: downPayment,
      message: `Congratulations! Purchased ${prop.name}! Down payment of ₵${downPayment.toLocaleString()} settled.`,
    };
  }

  // --- VEHICLES & DEALERSHIP ---
  public buyVehicle(vehicleId: string, playerCash: number): { success: boolean; cost: number; message: string } {
    const veh = OPENLIFE_VEHICLES.find(v => v.id === vehicleId);
    if (!veh) return { success: false, cost: 0, message: 'Vehicle not found.' };

    if (playerCash < veh.price) {
      return { success: false, cost: 0, message: `Vehicle costs ₵${veh.price.toLocaleString()}. Insufficient funds.` };
    }

    this.state.ownedVehicles.push({
      vehicleId: veh.id,
      condition: veh.condition,
    });

    this.modifyStat('happiness', 12);
    this.modifyStat('looks', 6);

    return {
      success: true,
      cost: veh.price,
      message: `Purchased ${veh.name}! Keys in hand. +12% Happiness, +6% Looks.`,
    };
  }

  // --- INVESTMENTS (STOCKS & CRYPTO) ---
  public tradeAsset(symbol: string, shares: number, playerCash: number): { success: boolean; total: number; message: string } {
    const asset = this.state.marketAssets.find(a => a.symbol === symbol);
    if (!asset) return { success: false, total: 0, message: 'Asset not found.' };

    const totalCost = asset.price * shares;

    if (shares > 0) {
      // Buy
      if (playerCash < totalCost) {
        return { success: false, total: 0, message: `Need ₵${totalCost.toFixed(2)} to buy ${shares} shares of ${symbol}.` };
      }
      this.state.portfolio[symbol] = (this.state.portfolio[symbol] || 0) + shares;
      return {
        success: true,
        total: totalCost,
        message: `Bought ${shares} unit(s) of ${asset.name} (${symbol}) at ₵${asset.price.toFixed(2)} each.`,
      };
    } else {
      // Sell
      const sellShares = Math.abs(shares);
      const currentlyOwned = this.state.portfolio[symbol] || 0;
      if (currentlyOwned < sellShares) {
        return { success: false, total: 0, message: `You only own ${currentlyOwned} shares of ${symbol}.` };
      }
      this.state.portfolio[symbol] = currentlyOwned - sellShares;
      const earnings = asset.price * sellShares;
      return {
        success: true,
        total: -earnings, // negative cost means cash incoming
        message: `Sold ${sellShares} unit(s) of ${symbol} for ₵${earnings.toFixed(2)}.`,
      };
    }
  }

  // --- LOTTERY ---
  public buyLotteryTicket(playerCash: number): { success: boolean; cost: number; prize: number; message: string } {
    const cost = 10;
    if (playerCash < cost) {
      return { success: false, cost: 0, prize: 0, message: 'A lottery ticket costs ₵10.' };
    }

    this.state.lotteryHistory.ticketsBought += 1;
    const roll = Math.random();

    let prize = 0;
    let message = 'Tore open your ticket... Better luck next time!';

    if (roll < 0.001) {
      prize = 100000;
      message = '🎉 JACKPOT WINNER! You matched all 6 numbers for the ₵100,000 grand prize!';
      this.modifyStat('happiness', 40);
    } else if (roll < 0.03) {
      prize = 1200;
      message = '⭐ Tier 2 Winner! You matched 4 numbers and won ₵1,200!';
      this.modifyStat('happiness', 20);
    } else if (roll < 0.18) {
      prize = 50;
      message = 'Lucky scratch! You matched the bonus symbol and won ₵50.';
      this.modifyStat('happiness', 6);
    }

    if (prize > 0) {
      this.state.lotteryHistory.totalWon += prize;
    }

    return {
      success: true,
      cost,
      prize,
      message,
    };
  }

  // --- RELATIONSHIPS ---
  public interactRelationship(relationId: string, action: 'spend_time' | 'compliment' | 'chat'): { success: boolean; message: string } {
    const rel = this.state.relationships.find(r => r.id === relationId);
    if (!rel) return { success: false, message: 'Person not found.' };

    if (action === 'spend_time') {
      rel.affinity = Math.min(100, rel.affinity + 8);
      this.modifyStat('happiness', 6);
      return {
        success: true,
        message: `Spent quality time with ${rel.name}. Affinity is now ${rel.affinity}%.`,
      };
    } else if (action === 'compliment') {
      rel.affinity = Math.min(100, rel.affinity + 5);
      this.modifyStat('happiness', 4);
      return {
        success: true,
        message: `Complimented ${rel.name}. They blushed warmly!`,
      };
    } else {
      rel.affinity = Math.min(100, rel.affinity + 4);
      this.modifyStat('happiness', 3);
      return {
        success: true,
        message: `Had a long, thoughtful conversation with ${rel.name}.`,
      };
    }
  }

  // --- DAILY SHIFT SETTLEMENT & LIFE PROGRESSION ---
  public processShiftEnd(): {
    dietExpense: number;
    healthDelta: number;
    happinessDelta: number;
    eventTriggered: OpenLifeLifeEvent | null;
  } {
    const diet = this.getCurrentDiet();
    this.modifyStat('health', diet.healthDelta);
    this.modifyStat('happiness', diet.happinessDelta);

    // Random market movement
    for (const asset of this.state.marketAssets) {
      const swing = (Math.random() - 0.48) * 0.08;
      asset.price = Math.max(1, Math.round(asset.price * (1 + swing) * 100) / 100);
      asset.changePercent = Math.round(swing * 1000) / 10;
    }

    // Property appreciation
    for (const prop of this.state.ownedProperties) {
      prop.currentVal = Math.round(prop.currentVal * 1.002);
    }

    // Random life scenario (40% chance per shift)
    let eventTriggered: OpenLifeLifeEvent | null = null;
    if (Math.random() < 0.45) {
      const idx = Math.floor(Math.random() * OPENLIFE_RANDOM_EVENTS.length);
      const ev = OPENLIFE_RANDOM_EVENTS[idx];
      eventTriggered = ev;
      this.state.recentLifeEvent = ev;

      if (ev.statDeltas.happiness) this.modifyStat('happiness', ev.statDeltas.happiness);
      if (ev.statDeltas.health) this.modifyStat('health', ev.statDeltas.health);
      if (ev.statDeltas.intel) this.modifyStat('intel', ev.statDeltas.intel);
      if (ev.statDeltas.looks) this.modifyStat('looks', ev.statDeltas.looks);
    }

    return {
      dietExpense: diet.costPerShift,
      healthDelta: diet.healthDelta,
      happinessDelta: diet.happinessDelta,
      eventTriggered,
    };
  }

  // --- OPENLIFE DEVELOPER CONSOLE ---
  public executeConsoleCommand(input: string, setCashCb?: (delta: number) => void): string {
    const clean = input.trim();
    this.state.consoleHistory.push({ text: `> ${clean}`, type: 'input' });

    const parts = clean.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let response = '';
    let resType: 'output' | 'error' | 'success' = 'output';

    switch (cmd) {
      case 'help':
        response = `Available OpenLife Commands:
• cheats — Toggle God Mode / Elevated privileges
• stat — Print core life attributes (Health, Happiness, Intel, Looks)
• maxstat — Max out all 4 core stats to 100%
• minstat — Zero out all stats
• randstat — Randomize life stats
• money <amount> — Add or adjust cash balance (₵)
• diet <name> — Switch diet (standard, mediterranean, vegetarian, vegan, fastfood)
• cure — Cure all active diseases immediately
• lotto — Free spin on the metropolitan lottery
• assets — List portfolio and properties
• debug — Print full OpenLife state JSON dump`;
        break;

      case 'cheats':
        this.state.cheatsEnabled = !this.state.cheatsEnabled;
        response = `God Mode Cheats: ${this.state.cheatsEnabled ? 'ENABLED [Elevated Console]' : 'DISABLED'}`;
        resType = 'success';
        break;

      case 'stat':
        response = `[OpenLife Stats]
❤️ Health: ${this.state.stats.health}%
😊 Happiness: ${this.state.stats.happiness}%
🧠 Intel: ${this.state.stats.intel}%
✨ Looks: ${this.state.stats.looks}%
⭐ Karma: ${this.state.stats.karma}% | Fame: ${this.state.stats.fame}%
🥗 Current Diet: ${this.getCurrentDiet().name}`;
        break;

      case 'maxstat':
        this.state.stats.health = 100;
        this.state.stats.happiness = 100;
        this.state.stats.intel = 100;
        this.state.stats.looks = 100;
        response = 'All core attributes maxed to 100%!';
        resType = 'success';
        break;

      case 'minstat':
        this.state.stats.health = 10;
        this.state.stats.happiness = 10;
        this.state.stats.intel = 10;
        this.state.stats.looks = 10;
        response = 'All core attributes reduced to 10%.';
        resType = 'output';
        break;

      case 'randstat':
        this.state.stats.health = Math.floor(Math.random() * 100);
        this.state.stats.happiness = Math.floor(Math.random() * 100);
        this.state.stats.intel = Math.floor(Math.random() * 100);
        this.state.stats.looks = Math.floor(Math.random() * 100);
        response = `Stats randomized: H:${this.state.stats.health}%, Hap:${this.state.stats.happiness}%, Int:${this.state.stats.intel}%, L:${this.state.stats.looks}%`;
        break;

      case 'money': {
        const amt = parseInt(args[0], 10);
        if (isNaN(amt)) {
          response = 'Usage: money <amount>';
          resType = 'error';
        } else {
          if (setCashCb) setCashCb(amt);
          response = `Granted ₵${amt.toLocaleString()} to player balance.`;
          resType = 'success';
        }
        break;
      }

      case 'diet': {
        const dId = args[0] ? args[0].toLowerCase() : 'mediterranean';
        const res = this.setDiet(dId);
        response = res.message;
        resType = res.success ? 'success' : 'error';
        break;
      }

      case 'cure':
        this.state.activeDiseases = [];
        this.modifyStat('health', 25);
        response = 'All active illnesses and ailments cured immediately!';
        resType = 'success';
        break;

      case 'lotto': {
        const res = this.buyLotteryTicket(999999);
        response = res.message;
        resType = res.prize > 0 ? 'success' : 'output';
        break;
      }

      case 'assets': {
        const lines: string[] = ['[Assets & Investments]'];
        for (const [sym, qty] of Object.entries(this.state.portfolio)) {
          if (qty > 0) lines.push(`• ${sym}: ${qty} units`);
        }
        lines.push(`Properties owned: ${this.state.ownedProperties.length}`);
        lines.push(`Vehicles owned: ${this.state.ownedVehicles.length}`);
        response = lines.join('\n');
        break;
      }

      case 'debug':
        response = JSON.stringify(this.state, null, 2);
        break;

      default:
        response = `Unknown command '${cmd}'. Type 'help' for command list.`;
        resType = 'error';
        break;
    }

    this.state.consoleHistory.push({ text: response, type: resType });
    return response;
  }
}
