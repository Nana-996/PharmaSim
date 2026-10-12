// ============================================
// PharmaSim — Life-Sim RPG Types & Data Contracts
// Inspired by LagosLife career progression & clinical realism
// ============================================

export type CharacterMood = 
  | 'neutral' 
  | 'worried' 
  | 'impatient' 
  | 'relieved' 
  | 'grateful' 
  | 'skeptical' 
  | 'angry';

export interface PlayerProfile {
  name: string;
  title: string;                 // e.g. 'Junior Pharmacist', 'Clinical Specialist', 'Pharmacy Partner'
  avatar: string;                // Emoji or character token
  portraitUrl?: string;          // High-res character portrait artwork
  energy: number;                // 0 - 100
  maxEnergy: number;
  focus: number;                 // 0 - 100 (diagnostic acuity)
  stress: number;                // 0 - 100
  cash: number;                  // Pocket money (₵ or ₦)
  bankBalance: number;           // Savings account
  rentDueInDays: number;         // Countdown to monthly rent
  rentAmount: number;            // Rent cost
  dailySalary: number;           // Base pay per shift
  shiftBonusEarned: number;      // Earned during current shift
  happiness: number;             // OpenLife: 0 - 100
  health: number;                // OpenLife: 0 - 100
  intel: number;                 // OpenLife: 0 - 100
  looks: number;                 // OpenLife: 0 - 100
  currentDiet: string;           // OpenLife: current diet name
}

export interface ReputationMatrix {
  patientTrust: number;          // ❤️ 0 - 100 (repeat business, patient compliance)
  doctorRespect: number;         // 🩺 0 - 100 (doctors accept your clinical interventions)
  supervisorRating: number;      // ⭐ 0 - 100 (boss evaluation, promotions, bonuses)
  boardStanding: number;         // ⚖️ 0 - 100 (clean regulatory record, no Council strikes)
}

export type SkillName = 
  | 'clinicalIntuition'
  | 'patientCare'
  | 'dispensingPrecision'
  | 'communication'
  | 'businessAcumen';

export interface SkillDetail {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export type PlayerSkills = Record<SkillName, SkillDetail>;

export interface StatDeltas {
  energyDelta?: number;
  focusDelta?: number;
  stressDelta?: number;
  cashBonus?: number;
  reputationDeltas?: {
    patientTrust?: number;
    doctorRespect?: number;
    supervisorRating?: number;
    boardStanding?: number;
  };
  skillXp?: {
    skill: SkillName;
    xp: number;
  };
  notification?: string;
}

export type DialogueActionType = 
  | 'triage'
  | 'clinical_counsel'
  | 'phone_doctor'
  | 'recommend_otc'
  | 'dispense_rx'
  | 'refusal'
  | 'casual';

export interface DialogueOption {
  id: string;
  label: string;
  category: DialogueActionType;
  nextStepId: string;            // Next node ID, or 'ACTION_SHELF' | 'ACTION_INSPECT_RX' | 'RESOLVE_SUCCESS' | 'RESOLVE_COMPROMISE' | 'RESOLVE_FAIL'
  effects?: StatDeltas;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle?: string;
  avatar: string;
  portraitUrl?: string;
  mood: CharacterMood;
  text: string;
  options: DialogueOption[];
}

export interface DoctorPhoneCall {
  doctorName: string;
  clinicName: string;
  reason: string;
  dialogueNodes: Record<string, DialogueNode>;
  initialNodeId: string;
}

export interface PrescriptionItem {
  drugId?: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
}

export interface PrescriptionSlipData {
  clinicName: string;
  clinicAddress: string;
  prescriberName: string;
  prescriberTitle: string;
  prescriberLicense: string;
  patientName: string;
  patientAge: number;
  date: string;
  rxItems: PrescriptionItem[];
  stampStatus: 'verified_official' | 'suspicious_forgery' | 'expired';
  stampText: string;
  isForged: boolean;
  forgeryClues?: string[];
}

export interface WorkstationState {
  dispensingTray: string[];
  rxInspected: boolean;
  rxStatus: 'pending' | 'verified' | 'flagged' | 'rejected';
  scannerAlert: {
    severity: 'safe' | 'warning' | 'danger';
    title: string;
    message: string;
    requiredAction?: string;
    auxiliaryLabelType?: string;
  } | null;
  auxiliaryLabelApplied: boolean;
  posReceiptTotal: number;
}

export interface ClinicalEncounter {
  id: string;
  title: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  avatar: string;
  portraitUrl?: string;
  appearanceDescription: string;
  backstory: string;
  prescriptionImageOrText?: string;
  prescriptionSlipData?: PrescriptionSlipData;
  hasPrescription: boolean;
  prescribedDrugId?: string;
  targetDrugIds?: string[];
  inappropriateDrugIds?: string[];
  doctorPhoneCall?: DoctorPhoneCall;
  dialogueNodes: Record<string, DialogueNode>;
  initialNodeId: string;
  clinicalTakeaway: string;
}
