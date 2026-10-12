// ============================================
// PharmaSim — Game State Store (Zustand)
// Life-Sim RPG + Clinical Practice Systems
// ============================================

import { createStore } from 'zustand/vanilla';
import { type DayConfig, type PrescriptionTemplate, getDayConfig, dayConfigs } from '../data/dayConfigs';
import { getDrugById, checkInteractions, type Drug } from '../data/drugDatabase';
import { 
  PlayerProfile, 
  ReputationMatrix, 
  PlayerSkills, 
  SkillName, 
  ClinicalEncounter, 
  DoctorPhoneCall,
  StatDeltas,
  WorkstationState
} from './lifeSimTypes';
import { day1Encounters } from '../data/encountersDay1';
import { audioManager } from '../audio/AudioManager';
import { OpenLifeEngine, type OpenLifeState } from './openlife/OpenLifeEngine';
import { OPENLIFE_DIETS } from './openlife/openLifeData';

export type GamePhase =
  | 'loading'
  | 'menu'
  | 'briefing'
  | 'playing'
  | 'prescription'
  | 'drugSelection'
  | 'dialogue'
  | 'encounter'
  | 'phoneCall'
  | 'quiz'
  | 'interactionAlert'
  | 'daySummary'
  | 'reference'
  | 'openlifeHub';

export interface GameScore {
  prescriptionsCorrect: number;
  prescriptionsTotal: number;
  interactionsCaught: number;
  interactionsTotal: number;
  counselingCorrect: number;
  counselingTotal: number;
  quizCorrect: number;
  quizTotal: number;
}

export interface GameState {
  // Phase
  phase: GamePhase;
  previousPhase: GamePhase;

  // Day
  currentDay: number;
  dayConfig: DayConfig | null;

  // Life-Sim Player Profile
  player: PlayerProfile;
  reputation: ReputationMatrix;
  skills: PlayerSkills;

  // Life-Sim Encounters
  encounters: ClinicalEncounter[];
  activeEncounterIndex: number;
  activeEncounter: ClinicalEncounter | null;
  encounterNodeId: string | null;
  activePhoneCall: DoctorPhoneCall | null;
  phoneCallNodeId: string | null;
  encountersCompleted: number;

  // Prescription processing (Legacy / Clinical Dispense)
  currentPrescriptionIndex: number;
  currentPrescription: PrescriptionTemplate | null;
  selectedDrugId: string | null;
  selectedDrug: Drug | null;
  interactionChecked: boolean;
  drugCorrect: boolean;
  dispensed: boolean;

  // Dialogue & Quiz
  currentCounselingIndex: number;
  currentQuizIndex: number;
  quizAnswered: boolean;

  // Score
  score: GameScore;
  totalScore: number;
  drugsLearned: string[];

  // Notification queue
  pendingNotifications: Array<{ text: string; type: 'success' | 'warning' | 'error' | 'info' }>;

  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: (dayNumber?: number) => void;
  startDay: () => void;
  
  // Life-Sim Actions
  modifyEnergy: (delta: number) => void;
  modifyFocus: (delta: number) => void;
  modifyStress: (delta: number) => void;
  modifyCash: (delta: number) => void;
  modifyReputation: (deltas: Partial<ReputationMatrix>) => void;
  addSkillXp: (skill: SkillName, xp: number) => void;
  applyStatDeltas: (deltas: StatDeltas) => void;
  
  startEncounter: (index: number) => void;
  advanceDialogue: (optionId: string) => void;
  startPhoneCall: () => void;
  advancePhoneCall: (optionId: string) => void;
  closePhoneCall: () => void;
  resolveActiveEncounter: (status: 'SUCCESS' | 'COMPROMISE' | 'FAIL') => void;
  payRent: () => boolean;
  queueNotification: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  clearNotifications: () => void;

  // Physical Workstation Actions
  workstation: WorkstationState;
  addDrugToTray: (drugId: string) => void;
  removeDrugFromTray: (drugId: string) => void;
  clearTray: () => void;
  setRxInspected: (inspected: boolean) => void;
  setRxStatus: (status: 'pending' | 'verified' | 'flagged' | 'rejected') => void;
  scanDispensingTray: () => void;
  applyAuxiliaryLabel: (labelType?: string) => void;
  ringUpPosRegister: () => void;

  // Legacy Actions for compatibility
  loadPrescription: (index: number) => void;
  selectDrug: (drugId: string) => void;
  confirmDrugSelection: () => void;
  flagInteraction: () => void;
  dismissInteraction: () => void;
  answerCounseling: (optionIndex: number) => boolean;
  dispenseMedication: () => void;
  answerQuiz: (optionIndex: number) => boolean;
  nextQuizQuestion: () => void;
  nextPrescription: () => void;
  endDay: () => void;
  nextDay: () => void;
  // OpenLife Engine & State
  openLife: OpenLifeEngine;
  openLifeState: OpenLifeState;
  openLifeSetDiet: (dietId: string) => void;
  openLifeDoctor: (diseaseId: string) => void;
  openLifeGym: () => void;
  openLifeReadBook: (bookId: string) => void;
  openLifeBuyProperty: (propertyId: string) => void;
  openLifeBuyVehicle: (vehicleId: string) => void;
  openLifeTradeAsset: (symbol: string, shares: number) => void;
  openLifeLottery: () => void;
  openLifeRelationship: (relationId: string, action: 'spend_time' | 'compliment' | 'chat') => void;
  openLifeConsole: (command: string) => string;
  syncOpenLifeStats: () => void;

  goToMenu: () => void;
  openReference: () => void;
  closeReference: () => void;
  getGrade: () => string;
}

const emptyScore: GameScore = {
  prescriptionsCorrect: 0,
  prescriptionsTotal: 0,
  interactionsCaught: 0,
  interactionsTotal: 0,
  counselingCorrect: 0,
  counselingTotal: 0,
  quizCorrect: 0,
  quizTotal: 0,
};

const initialPlayer: PlayerProfile = {
  name: 'Pharm. Tobi',
  title: 'Junior Pharmacist',
  avatar: '👨🏾‍⚕️',
  portraitUrl: '/images/characters/tobi.jpg',
  energy: 85,
  maxEnergy: 100,
  focus: 90,
  stress: 15,
  cash: 420,
  bankBalance: 1200,
  rentDueInDays: 5,
  rentAmount: 600,
  dailySalary: 150,
  shiftBonusEarned: 0,
  happiness: 82,
  health: 88,
  intel: 85,
  looks: 78,
  currentDiet: 'Balanced Home Cooking',
};

const initialReputation: ReputationMatrix = {
  patientTrust: 52,
  doctorRespect: 46,
  supervisorRating: 65,
  boardStanding: 100,
};

const initialSkills: PlayerSkills = {
  clinicalIntuition: { level: 1, xp: 0, xpToNextLevel: 100 },
  patientCare: { level: 1, xp: 0, xpToNextLevel: 100 },
  dispensingPrecision: { level: 1, xp: 0, xpToNextLevel: 100 },
  communication: { level: 1, xp: 0, xpToNextLevel: 100 },
  businessAcumen: { level: 1, xp: 0, xpToNextLevel: 100 },
};

const openLifeEngine = new OpenLifeEngine(initialPlayer.cash);

export const useGameStore = createStore<GameState>((set, get) => ({
  phase: 'loading',
  previousPhase: 'loading',

  openLife: openLifeEngine,
  openLifeState: openLifeEngine.getState(),

  currentDay: 1,
  dayConfig: null,

  player: { ...initialPlayer },
  reputation: { ...initialReputation },
  skills: { ...initialSkills },

  encounters: day1Encounters,
  activeEncounterIndex: 0,
  activeEncounter: null,
  encounterNodeId: null,
  activePhoneCall: null,
  phoneCallNodeId: null,
  encountersCompleted: 0,

  currentPrescriptionIndex: 0,
  currentPrescription: null,
  selectedDrugId: null,
  selectedDrug: null,
  interactionChecked: false,
  drugCorrect: false,
  dispensed: false,

  currentCounselingIndex: 0,
  currentQuizIndex: 0,
  quizAnswered: false,

  score: { ...emptyScore },
  totalScore: 0,
  drugsLearned: [],
  pendingNotifications: [],

  // Physical Workstation
  workstation: {
    dispensingTray: [],
    rxInspected: false,
    rxStatus: 'pending',
    scannerAlert: null,
    auxiliaryLabelApplied: false,
    posReceiptTotal: 0,
  },

  setPhase: (phase) => set((s) => ({ phase, previousPhase: s.phase })),

  queueNotification: (text, type = 'info') => {
    set((s) => ({
      pendingNotifications: [...s.pendingNotifications, { text, type }]
    }));
  },

  clearNotifications: () => set({ pendingNotifications: [] }),

  startGame: (dayNumber = 1) => {
    const config = getDayConfig(dayNumber);
    set({
      currentDay: dayNumber,
      dayConfig: config || null,
      phase: 'briefing',
      player: {
        ...get().player,
        energy: Math.max(70, get().player.energy),
        focus: 90,
        stress: Math.max(10, get().player.stress - 20),
        shiftBonusEarned: 0,
      },
      encounters: day1Encounters,
      activeEncounterIndex: 0,
      activeEncounter: null,
      encounterNodeId: null,
      activePhoneCall: null,
      phoneCallNodeId: null,
      encountersCompleted: 0,
      score: { ...emptyScore },
      totalScore: 0,
      currentPrescriptionIndex: 0,
      currentPrescription: null,
      selectedDrugId: null,
      selectedDrug: null,
      interactionChecked: false,
      drugCorrect: false,
      dispensed: false,
      currentCounselingIndex: 0,
      currentQuizIndex: 0,
      quizAnswered: false,
      drugsLearned: [],
    });
  },

  startDay: () => {
    const { encounters } = get();
    set({ phase: 'playing' });
    // Automatically load first clinical encounter after arrival
    setTimeout(() => {
      if (encounters.length > 0) {
        get().startEncounter(0);
      } else {
        get().loadPrescription(0);
      }
    }, 1500);
  },

  // ----------------------------------------------------------------------
  // Life-Sim Stat Modifications
  // ----------------------------------------------------------------------
  modifyEnergy: (delta) => {
    set((s) => {
      const energy = Math.max(0, Math.min(s.player.maxEnergy, s.player.energy + delta));
      return { player: { ...s.player, energy } };
    });
  },

  modifyFocus: (delta) => {
    set((s) => {
      const focus = Math.max(0, Math.min(100, s.player.focus + delta));
      return { player: { ...s.player, focus } };
    });
  },

  modifyStress: (delta) => {
    set((s) => {
      const stress = Math.max(0, Math.min(100, s.player.stress + delta));
      return { player: { ...s.player, stress } };
    });
  },

  modifyCash: (delta) => {
    set((s) => {
      const cash = Math.max(0, s.player.cash + delta);
      const shiftBonusEarned = delta > 0 ? s.player.shiftBonusEarned + delta : s.player.shiftBonusEarned;
      return { player: { ...s.player, cash, shiftBonusEarned } };
    });
  },

  modifyReputation: (deltas) => {
    set((s) => {
      const rep = { ...s.reputation };
      if (deltas.patientTrust !== undefined) {
        rep.patientTrust = Math.max(0, Math.min(100, rep.patientTrust + deltas.patientTrust));
      }
      if (deltas.doctorRespect !== undefined) {
        rep.doctorRespect = Math.max(0, Math.min(100, rep.doctorRespect + deltas.doctorRespect));
      }
      if (deltas.supervisorRating !== undefined) {
        rep.supervisorRating = Math.max(0, Math.min(100, rep.supervisorRating + deltas.supervisorRating));
      }
      if (deltas.boardStanding !== undefined) {
        rep.boardStanding = Math.max(0, Math.min(100, rep.boardStanding + deltas.boardStanding));
      }
      return { reputation: rep };
    });
  },

  addSkillXp: (skill, xp) => {
    set((s) => {
      const sk = s.skills[skill];
      let currentXp = sk.xp + xp;
      let level = sk.level;
      let xpToNext = sk.xpToNextLevel;

      while (currentXp >= xpToNext) {
        currentXp -= xpToNext;
        level += 1;
        xpToNext = Math.round(xpToNext * 1.5);
        get().queueNotification(`Level Up! ${skill} is now Level ${level}! 🎉`, 'success');
        audioManager.playFanfare();
      }

      return {
        skills: {
          ...s.skills,
          [skill]: { level, xp: currentXp, xpToNextLevel: xpToNext },
        },
      };
    });
  },

  applyStatDeltas: (deltas) => {
    if (deltas.energyDelta) get().modifyEnergy(deltas.energyDelta);
    if (deltas.focusDelta) get().modifyFocus(deltas.focusDelta);
    if (deltas.stressDelta) get().modifyStress(deltas.stressDelta);
    if (deltas.cashBonus) {
      get().modifyCash(deltas.cashBonus);
      audioManager.playRegister();
    }
    if (deltas.reputationDeltas) get().modifyReputation(deltas.reputationDeltas);
    if (deltas.skillXp) get().addSkillXp(deltas.skillXp.skill, deltas.skillXp.xp);
    if (deltas.notification) {
      get().queueNotification(deltas.notification, 'info');
    }
  },

  // ----------------------------------------------------------------------
  // Clinical Encounter Engine
  // ----------------------------------------------------------------------
  startEncounter: (index) => {
    const { encounters } = get();
    if (index >= encounters.length) {
      // All day 1 encounters finished, go to shift end summary
      get().endDay();
      return;
    }

    const encounter = encounters[index];
    set({
      activeEncounterIndex: index,
      activeEncounter: encounter,
      encounterNodeId: encounter.initialNodeId,
      phase: 'encounter',
      workstation: {
        dispensingTray: [],
        rxInspected: false,
        rxStatus: 'pending',
        scannerAlert: null,
        auxiliaryLabelApplied: false,
        posReceiptTotal: 0,
      },
    });
    audioManager.playPickup();
  },

  advanceDialogue: (optionId) => {
    const { activeEncounter, encounterNodeId } = get();
    if (!activeEncounter || !encounterNodeId) return;

    const currentNode = activeEncounter.dialogueNodes[encounterNodeId];
    if (!currentNode) return;

    const option = currentNode.options.find((o) => o.id === optionId);
    if (!option) return;

    // Apply effects
    if (option.effects) {
      get().applyStatDeltas(option.effects);
    }

    // Branching logic
    if (option.category === 'phone_doctor' && activeEncounter.doctorPhoneCall) {
      get().startPhoneCall();
      return;
    }

    // Physical Simulation Actions
    if (option.nextStepId === 'ACTION_SHELF') {
      audioManager.playPickup();
      set({ phase: 'drugSelection' });
      return;
    }
    if (option.nextStepId === 'ACTION_INSPECT_RX') {
      audioManager.playPickup();
      get().setRxInspected(true);
      set({ phase: 'prescription' });
      return;
    }
    if (option.nextStepId === 'ACTION_PHONE') {
      get().startPhoneCall();
      return;
    }
    if (option.nextStepId === 'ACTION_SCANNER') {
      get().scanDispensingTray();
      return;
    }
    if (option.nextStepId === 'ACTION_REGISTER') {
      get().ringUpPosRegister();
      return;
    }

    if (option.nextStepId === 'RESOLVE_SUCCESS') {
      audioManager.playSuccess();
      get().resolveActiveEncounter('SUCCESS');
    } else if (option.nextStepId === 'RESOLVE_COMPROMISE') {
      audioManager.playWarning();
      get().resolveActiveEncounter('COMPROMISE');
    } else if (option.nextStepId === 'RESOLVE_FAIL') {
      audioManager.playBuzz();
      get().resolveActiveEncounter('FAIL');
    } else {
      audioManager.playClick();
      set({ encounterNodeId: option.nextStepId });
    }
  },

  startPhoneCall: () => {
    const { activeEncounter } = get();
    if (!activeEncounter || !activeEncounter.doctorPhoneCall) return;

    audioManager.playWarning();
    set({
      activePhoneCall: activeEncounter.doctorPhoneCall,
      phoneCallNodeId: activeEncounter.doctorPhoneCall.initialNodeId,
      phase: 'phoneCall',
    });
  },

  advancePhoneCall: (optionId) => {
    const { activePhoneCall, phoneCallNodeId, activeEncounter } = get();
    if (!activePhoneCall || !phoneCallNodeId) return;

    const node = activePhoneCall.dialogueNodes[phoneCallNodeId];
    if (!node) return;

    const opt = node.options.find((o) => o.id === optionId);
    if (!opt) return;

    if (opt.effects) {
      get().applyStatDeltas(opt.effects);
    }

    if (opt.nextStepId === 'RESOLVE_SUCCESS' || opt.nextStepId === 'RESOLVE_FAIL') {
      audioManager.playClick();
      get().closePhoneCall();
      // Resume encounter after call
      if (activeEncounter && activeEncounter.dialogueNodes['chidi_after_call']) {
        set({ encounterNodeId: 'chidi_after_call', phase: 'encounter' });
      }
    } else {
      audioManager.playClick();
      set({ phoneCallNodeId: opt.nextStepId });
    }
  },

  closePhoneCall: () => {
    set({
      activePhoneCall: null,
      phoneCallNodeId: null,
      phase: 'encounter',
    });
  },

  resolveActiveEncounter: (status) => {
    const { encountersCompleted, activeEncounterIndex, encounters, player } = get();
    const newCount = encountersCompleted + 1;
    
    // Add base shift earnings
    const baseWagePerEncounter = Math.round(player.dailySalary / Math.max(1, encounters.length));
    get().modifyCash(baseWagePerEncounter);

    set({
      activeEncounter: null,
      encounterNodeId: null,
      encountersCompleted: newCount,
      phase: 'playing',
    });

    get().queueNotification(
      `Consultation completed (${status}). +₵${baseWagePerEncounter} wage credited.`,
      status === 'SUCCESS' ? 'success' : 'warning'
    );

    // Next patient walks in after a short pause
    setTimeout(() => {
      const nextIdx = activeEncounterIndex + 1;
      if (nextIdx < encounters.length) {
        get().startEncounter(nextIdx);
      } else {
        get().endDay();
      }
    }, 2000);
  },

  payRent: () => {
    const { player } = get();
    if (player.cash + player.bankBalance >= player.rentAmount) {
      let remaining = player.rentAmount;
      let cash = player.cash;
      let bank = player.bankBalance;

      if (cash >= remaining) {
        cash -= remaining;
      } else {
        remaining -= cash;
        cash = 0;
        bank -= remaining;
      }

      set({
        player: {
          ...player,
          cash,
          bankBalance: bank,
          rentDueInDays: 30, // resets to next month!
        },
      });

      audioManager.playFanfare();
      get().queueNotification('🏠 Rent Paid! Landlord sends his blessings. 30 days secured.', 'success');
      return true;
    } else {
      audioManager.playBuzz();
      get().queueNotification('❌ Insufficient funds to pay rent! Keep hustling at the counter.', 'error');
      return false;
    }
  },

  // ----------------------------------------------------------------------
  // Physical Workstation Simulation Methods
  // ----------------------------------------------------------------------
  addDrugToTray: (drugId) => {
    const { workstation } = get();
    if (workstation.dispensingTray.includes(drugId)) return;
    const tray = [...workstation.dispensingTray, drugId];

    let total = 0;
    for (const id of tray) {
      if (id.includes('augmentin') || id.includes('amoxicillin')) total += 85;
      else if (id.includes('ciprofloxacin')) total += 45;
      else if (id.includes('dextromethorphan')) total += 35;
      else if (id.includes('menthol')) total += 15;
      else if (id.includes('paracetamol')) total += 10;
      else if (id.includes('codeine')) total += 120;
      else if (id.includes('diazepam')) total += 90;
      else total += 25;
    }

    const drug = getDrugById(drugId);
    set({
      workstation: {
        ...workstation,
        dispensingTray: tray,
        scannerAlert: null,
        posReceiptTotal: total,
      },
    });
    audioManager.playPickup();
    get().queueNotification(`Added ${drug?.genericName || drugId} to counter dispensing tray.`, 'info');
  },

  removeDrugFromTray: (drugId) => {
    const { workstation } = get();
    const tray = workstation.dispensingTray.filter(id => id !== drugId);
    let total = 0;
    for (const id of tray) {
      if (id.includes('augmentin') || id.includes('amoxicillin')) total += 85;
      else if (id.includes('ciprofloxacin')) total += 45;
      else if (id.includes('dextromethorphan')) total += 35;
      else if (id.includes('menthol')) total += 15;
      else if (id.includes('paracetamol')) total += 10;
      else if (id.includes('codeine')) total += 120;
      else if (id.includes('diazepam')) total += 90;
      else total += 25;
    }
    set({
      workstation: {
        ...workstation,
        dispensingTray: tray,
        scannerAlert: null,
        posReceiptTotal: total,
      },
    });
  },

  clearTray: () => {
    const { workstation } = get();
    set({
      workstation: {
        ...workstation,
        dispensingTray: [],
        scannerAlert: null,
        auxiliaryLabelApplied: false,
        posReceiptTotal: 0,
      },
    });
  },

  setRxInspected: (inspected) => {
    set((s) => ({ workstation: { ...s.workstation, rxInspected: inspected } }));
  },

  setRxStatus: (status) => {
    set((s) => ({ workstation: { ...s.workstation, rxStatus: status } }));
  },

  scanDispensingTray: () => {
    const { workstation, activeEncounter } = get();
    const tray = workstation.dispensingTray;
    audioManager.playPickup();

    if (tray.length === 0) {
      set({
        workstation: {
          ...workstation,
          scannerAlert: {
            severity: 'warning',
            title: 'Dispensing Tray Empty',
            message: 'No medicines placed on the counter. Browse pharmacy shelves to pick items first.',
          },
        },
      });
      return;
    }

    if (!activeEncounter) return;
    const pName = activeEncounter.patientName.toLowerCase();

    // Amina
    if (pName.includes('amina')) {
      const hasAntibiotic = tray.some(id => id.includes('amoxicillin') || id.includes('augmentin') || id.includes('ciprofloxacin'));
      const hasOTC = tray.some(id => id.includes('dextromethorphan') || id.includes('menthol') || id.includes('paracetamol'));

      if (hasAntibiotic) {
        audioManager.playWarning();
        set({
          workstation: {
            ...workstation,
            scannerAlert: {
              severity: 'danger',
              title: 'Clinical Alert: Inappropriate Antibiotic for Viral Bronchitis',
              message: 'Patient presents with acute viral bronchitis (1-day dry hacking cough, runny nose, afebrile). Antibiotics will not treat viral illness, cause severe GI nausea/diarrhea during her pitch, and drive AMR.',
              requiredAction: 'Remove antibiotic from tray. Dispense non-drowsy cough suppressant & vocal lozenges instead.',
            },
          },
        });
      } else if (hasOTC) {
        audioManager.playSuccess();
        set({
          workstation: {
            ...workstation,
            scannerAlert: {
              severity: 'safe',
              title: 'Clinical Clearance: Optimal Symptom Therapy',
              message: 'Non-drowsy Dextromethorphan suppresses throat reflex; menthol lozenges soothe pharynx; Paracetamol relieves inflammation without daytime sedation.',
              requiredAction: 'Safe to dispense. Ready for POS checkout.',
            },
          },
        });
      }
      return;
    }

    // Adeleke
    if (pName.includes('adeleke')) {
      const hasCipro = tray.some(id => id.includes('ciprofloxacin'));
      if (hasCipro) {
        audioManager.playWarning();
        set({
          workstation: {
            ...workstation,
            scannerAlert: {
              severity: 'warning',
              title: 'Severe Drug Interaction: Multivalent Cation Chelation!',
              message: 'Patient routinely takes Ferrous Sulphate (Iron) and Calcium-Magnesium antacids. Iron and Antacid cations bind Ciprofloxacin into an unabsorbable complex (bioavailability reduced by 85%).',
              requiredAction: 'Counsel patient and attach specialized 2-hour spacing auxiliary sticker.',
              auxiliaryLabelType: 'Separate from antacids/iron by 2+ hours',
            },
          },
        });
      } else {
        set({
          workstation: {
            ...workstation,
            scannerAlert: {
              severity: 'safe',
              title: 'Medication Ready',
              message: 'Tray prepared.',
            },
          },
        });
      }
      return;
    }

    // Chidi
    if (pName.includes('chidi')) {
      const hasControlled = tray.some(id => id.includes('codeine') || id.includes('diazepam'));
      if (hasControlled) {
        audioManager.playWarning();
        set({
          workstation: {
            ...workstation,
            scannerAlert: {
              severity: 'danger',
              title: 'Schedule II Narcotic: Prescriber Verification Required',
              message: 'Controlled Substances Act requires authenticated verified prescriber license. Stolen or forged slips cannot be dispensed.',
              requiredAction: 'Phone Dr. Okon at Apex General to verify or refuse dispense.',
            },
          },
        });
      }
      return;
    }
  },

  applyAuxiliaryLabel: (labelType = 'Separate from antacids/iron by 2+ hours') => {
    const { workstation } = get();
    audioManager.playSuccess();
    get().applyStatDeltas({
      skillXp: { skill: 'dispensingPrecision', xp: 25 },
      reputationDeltas: { patientTrust: 15, supervisorRating: 15 },
      notification: `🏷️ Auxiliary Warning Sticker attached to bottle: "${labelType}"`,
    });
    set({
      workstation: {
        ...workstation,
        auxiliaryLabelApplied: true,
        scannerAlert: {
          severity: 'safe',
          title: 'Auxiliary Warning Label Affixed',
          message: `Sticker attached: "${labelType}". Ciprofloxacin safely protected from chelation failure! Ready to ring up.`,
        },
      },
    });
  },

  ringUpPosRegister: () => {
    const { workstation, activeEncounter } = get();
    const tray = workstation.dispensingTray;

    if (!activeEncounter) return;
    const pName = activeEncounter.patientName.toLowerCase();

    // Amina
    if (pName.includes('amina')) {
      const hasAntibiotic = tray.some(id => id.includes('amoxicillin') || id.includes('augmentin'));
      const hasOTC = tray.some(id => id.includes('dextromethorphan') || id.includes('menthol') || id.includes('paracetamol'));

      if (hasAntibiotic) {
        audioManager.playWarning();
        get().applyStatDeltas({
          cashBonus: 85,
          reputationDeltas: { supervisorRating: -15, boardStanding: -10 },
          stressDelta: 10,
          notification: '⚠️ Sold Prescription-Only Antibiotic Without Rx! Supervisor frowning.',
        });
        set({ encounterNodeId: 'amina_sold_antibiotic', phase: 'encounter' });
      } else if (hasOTC || tray.length === 0) {
        audioManager.playRegister();
        const saleAmount = Math.max(35, workstation.posReceiptTotal || 35);
        get().applyStatDeltas({
          cashBonus: saleAmount,
          reputationDeltas: { patientTrust: 25, supervisorRating: 20 },
          skillXp: { skill: 'communication', xp: 30 },
          notification: `✓ Ring Up Complete: Collected ₵${saleAmount} for symptom-targeted OTC cough relief.`,
        });
        set({ encounterNodeId: 'amina_delighted_outcome', phase: 'encounter' });
      }
      return;
    }

    // Adeleke
    if (pName.includes('adeleke')) {
      if (workstation.auxiliaryLabelApplied) {
        audioManager.playRegister();
        get().applyStatDeltas({
          cashBonus: 45,
          reputationDeltas: { patientTrust: 25, supervisorRating: 20, doctorRespect: 15 },
          skillXp: { skill: 'dispensingPrecision', xp: 30 },
          notification: '✓ Ring Up Complete: Collected ₵45. Ciprofloxacin safely dispensed with chelation guidance!',
        });
        set({ encounterNodeId: 'adeleke_delighted', phase: 'encounter' });
      } else {
        audioManager.playWarning();
        get().applyStatDeltas({
          cashBonus: 45,
          reputationDeltas: { patientTrust: -5, supervisorRating: -10 },
          notification: '⚠️ Dispensed Ciprofloxacin without spacing counseling or auxiliary warning label.',
        });
        set({ encounterNodeId: 'adeleke_missed_interaction', phase: 'encounter' });
      }
      return;
    }

    // Chidi
    if (pName.includes('chidi')) {
      audioManager.playWarning();
      get().applyStatDeltas({
        cashBonus: 280,
        reputationDeltas: { supervisorRating: -40, boardStanding: -50 },
        stressDelta: 30,
        notification: '🚨 Severe Violation: Dispensed Forged Controlled Substance for Cash Bribe!',
      });
      set({ encounterNodeId: 'chidi_illegal_sale', phase: 'encounter' });
      return;
    }
  },

  // ----------------------------------------------------------------------
  // Legacy / Prescription flow compatibility
  // ----------------------------------------------------------------------
  loadPrescription: (index) => {
    const { dayConfig } = get();
    if (!dayConfig || index >= dayConfig.prescriptions.length) {
      get().endDay();
      return;
    }
    const prescription = dayConfig.prescriptions[index];
    const interactionsTotal = prescription.hasInteraction ? get().score.interactionsTotal + 1 : get().score.interactionsTotal;
    set({
      currentPrescriptionIndex: index,
      currentPrescription: prescription,
      selectedDrugId: null,
      selectedDrug: null,
      interactionChecked: false,
      drugCorrect: false,
      dispensed: false,
      currentCounselingIndex: 0,
      phase: 'prescription',
      score: { ...get().score, interactionsTotal },
    });
  },

  selectDrug: (drugId) => {
    const drug = getDrugById(drugId);
    set({ selectedDrugId: drugId, selectedDrug: drug || null });
  },

  confirmDrugSelection: () => {
    const { currentPrescription, activeEncounter, selectedDrugId } = get();
    if (!selectedDrugId) return;

    // Handle physical shelf selection during active life-sim clinical encounters
    if (activeEncounter) {
      get().addDrugToTray(selectedDrugId);
      set({ phase: 'encounter' });
      return;
    }

    if (!currentPrescription) return;

    const isCorrect = selectedDrugId === currentPrescription.prescribedDrugId;
    const drugsLearned = [...get().drugsLearned];
    if (!drugsLearned.includes(selectedDrugId)) {
      drugsLearned.push(selectedDrugId);
    }

    set({
      drugCorrect: isCorrect,
      phase: 'prescription',
      drugsLearned,
    });

    if (currentPrescription.hasInteraction && currentPrescription.interactionDrugIds.length > 0) {
      const allDrugs = [selectedDrugId, ...currentPrescription.patient.currentMedications];
      const interactions = checkInteractions(allDrugs);
      if (interactions.length > 0) {
        setTimeout(() => {
          set({ phase: 'interactionAlert' });
        }, 500);
      }
    }
  },

  flagInteraction: () => {
    const { score } = get();
    set({
      interactionChecked: true,
      score: { ...score, interactionsCaught: score.interactionsCaught + 1 },
      phase: 'prescription',
    });
  },

  dismissInteraction: () => {
    set({ interactionChecked: true, phase: 'prescription' });
  },

  answerCounseling: (optionIndex) => {
    const { currentPrescription, currentCounselingIndex, score } = get();
    if (!currentPrescription) return false;

    const question = currentPrescription.counselingQuestions[currentCounselingIndex];
    if (!question) return false;

    const isCorrect = question.options[optionIndex]?.isCorrect || false;
    set({
      score: {
        ...score,
        counselingCorrect: score.counselingCorrect + (isCorrect ? 1 : 0),
        counselingTotal: score.counselingTotal + 1,
      },
    });

    return isCorrect;
  },

  dispenseMedication: () => {
    const { currentPrescription, drugCorrect, score } = get();
    if (!currentPrescription) return;

    set({
      dispensed: true,
      score: {
        ...score,
        prescriptionsCorrect: score.prescriptionsCorrect + (drugCorrect ? 1 : 0),
        prescriptionsTotal: score.prescriptionsTotal + 1,
      },
    });

    if (currentPrescription.counselingQuestions.length > 0) {
      setTimeout(() => {
        set({ phase: 'dialogue', currentCounselingIndex: 0 });
      }, 800);
    } else {
      setTimeout(() => {
        get().nextPrescription();
      }, 1000);
    }
  },

  answerQuiz: (optionIndex) => {
    const { dayConfig, currentQuizIndex, score } = get();
    if (!dayConfig) return false;

    const question = dayConfig.quizQuestions[currentQuizIndex];
    if (!question) return false;

    const isCorrect = optionIndex === question.correctIndex;
    set({
      quizAnswered: true,
      score: {
        ...score,
        quizCorrect: score.quizCorrect + (isCorrect ? 1 : 0),
        quizTotal: score.quizTotal + 1,
      },
    });

    return isCorrect;
  },

  nextQuizQuestion: () => {
    const { dayConfig, currentQuizIndex } = get();
    if (!dayConfig) return;

    const nextIndex = currentQuizIndex + 1;
    if (nextIndex >= dayConfig.quizQuestions.length) {
      get().endDay();
    } else {
      set({ currentQuizIndex: nextIndex, quizAnswered: false });
    }
  },

  nextPrescription: () => {
    const { currentPrescriptionIndex } = get();
    get().loadPrescription(currentPrescriptionIndex + 1);
  },

  endDay: () => {
    const { score, encountersCompleted, encounters, player, openLife } = get();
    const prescriptionPct = score.prescriptionsTotal > 0 ? score.prescriptionsCorrect / score.prescriptionsTotal : 1;
    const interactionPct = score.interactionsTotal > 0 ? score.interactionsCaught / score.interactionsTotal : 1;
    const counselingPct = score.counselingTotal > 0 ? score.counselingCorrect / score.counselingTotal : 1;
    const encounterPct = encounters.length > 0 ? encountersCompleted / encounters.length : 1;

    const totalScore = Math.round(((prescriptionPct + interactionPct + counselingPct + encounterPct) / 4) * 100);

    // OpenLife shift settlement (diet expenses, health effects, market movement, random life event)
    const shiftSummary = openLife.processShiftEnd();
    const olState = openLife.getState();

    // Deduct diet cost from player cash
    const netCash = Math.max(0, player.cash - shiftSummary.dietExpense);
    const newRentDays = Math.max(0, player.rentDueInDays - 1);

    if (shiftSummary.eventTriggered) {
      get().queueNotification(`🌍 OpenLife Event: ${shiftSummary.eventTriggered.title}`, 'info');
      if (shiftSummary.eventTriggered.statDeltas.cash) {
        get().modifyCash(shiftSummary.eventTriggered.statDeltas.cash);
      }
    }

    set({
      player: {
        ...player,
        cash: netCash,
        rentDueInDays: newRentDays,
        happiness: olState.stats.happiness,
        health: olState.stats.health,
        intel: olState.stats.intel,
        looks: olState.stats.looks,
        currentDiet: openLife.getCurrentDiet().name,
      },
      openLifeState: { ...olState },
      phase: 'daySummary',
      totalScore,
    });
    audioManager.playFanfare();
  },

  // OpenLife Actions
  syncOpenLifeStats: () => {
    const { openLife, player } = get();
    const olState = openLife.getState();
    set({
      openLifeState: { ...olState },
      player: {
        ...player,
        happiness: olState.stats.happiness,
        health: olState.stats.health,
        intel: olState.stats.intel,
        looks: olState.stats.looks,
        currentDiet: openLife.getCurrentDiet().name,
      },
    });
  },

  openLifeSetDiet: (dietId) => {
    const { openLife } = get();
    const res = openLife.setDiet(dietId);
    get().syncOpenLifeStats();
    get().queueNotification(res.message, res.success ? 'success' : 'error');
  },

  openLifeDoctor: (diseaseId) => {
    const { openLife, player } = get();
    const res = openLife.visitDoctor(diseaseId, player.cash);
    if (res.success) {
      get().modifyCash(-res.cost);
      get().syncOpenLifeStats();
      get().queueNotification(res.message, res.cured ? 'success' : 'info');
    } else {
      get().queueNotification(res.message, 'warning');
    }
  },

  openLifeGym: () => {
    const { openLife, player } = get();
    const res = openLife.visitGym(player.cash);
    if (res.success) {
      get().modifyCash(-res.cost);
      get().modifyEnergy(-15);
      get().modifyStress(-10);
      get().syncOpenLifeStats();
      get().queueNotification(res.message, 'success');
    } else {
      get().queueNotification(res.message, 'warning');
    }
  },

  openLifeReadBook: (bookId) => {
    const { openLife } = get();
    const res = openLife.readBook(bookId);
    if (res.success) {
      get().modifyFocus(5);
      get().modifyStress(-5);
      get().syncOpenLifeStats();
      get().queueNotification(res.message, 'success');
    }
  },

  openLifeBuyProperty: (propertyId) => {
    const { openLife, player } = get();
    const res = openLife.buyProperty(propertyId, player.cash);
    if (res.success) {
      get().modifyCash(-res.cost);
      get().syncOpenLifeStats();
      get().queueNotification(res.message, 'success');
    } else {
      get().queueNotification(res.message, 'warning');
    }
  },

  openLifeBuyVehicle: (vehicleId) => {
    const { openLife, player } = get();
    const res = openLife.buyVehicle(vehicleId, player.cash);
    if (res.success) {
      get().modifyCash(-res.cost);
      get().syncOpenLifeStats();
      get().queueNotification(res.message, 'success');
    } else {
      get().queueNotification(res.message, 'warning');
    }
  },

  openLifeTradeAsset: (symbol, shares) => {
    const { openLife, player } = get();
    const res = openLife.tradeAsset(symbol, shares, player.cash);
    if (res.success) {
      get().modifyCash(-res.total);
      get().syncOpenLifeStats();
      get().queueNotification(res.message, 'success');
    } else {
      get().queueNotification(res.message, 'warning');
    }
  },

  openLifeLottery: () => {
    const { openLife, player } = get();
    const res = openLife.buyLotteryTicket(player.cash);
    if (res.success) {
      get().modifyCash(-res.cost);
      if (res.prize > 0) {
        get().modifyCash(res.prize);
        get().queueNotification(res.message, 'success');
      } else {
        get().queueNotification(res.message, 'info');
      }
      get().syncOpenLifeStats();
    } else {
      get().queueNotification(res.message, 'warning');
    }
  },

  openLifeRelationship: (relationId, action) => {
    const { openLife } = get();
    const res = openLife.interactRelationship(relationId, action);
    if (res.success) {
      get().syncOpenLifeStats();
      get().queueNotification(res.message, 'success');
    }
  },

  openLifeConsole: (command) => {
    const { openLife } = get();
    const response = openLife.executeConsoleCommand(command, (amt) => {
      get().modifyCash(amt);
    });
    get().syncOpenLifeStats();
    return response;
  },

  nextDay: () => {
    const { currentDay } = get();
    const nextDayNum = currentDay + 1;
    if (nextDayNum > dayConfigs.length) {
      set({ phase: 'menu' });
    } else {
      get().startGame(nextDayNum);
    }
  },

  goToMenu: () => set({ phase: 'menu' }),
  openReference: () => set((s) => ({ phase: 'reference', previousPhase: s.phase })),
  closeReference: () => set((s) => ({ phase: s.previousPhase })),

  getGrade: () => {
    const { totalScore } = get();
    if (totalScore >= 90) return 'A';
    if (totalScore >= 80) return 'B';
    if (totalScore >= 70) return 'C';
    if (totalScore >= 60) return 'D';
    return 'F';
  },
}));
