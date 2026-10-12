// ============================================
// PharmaSim — Main Entry Point
// Initializes the 3D scene, UI controller, and game loop
// ============================================

import { PharmacyScene } from './scene/PharmacyScene';
import { UIController } from './ui/UIController';
import { useGameStore } from './game/gameStore';

class PharmaSim {
  private scene: PharmacyScene;
  private ui: UIController;
  private currentPatientAvatar: string | null = null;

  constructor() {
    const container = document.getElementById('game-canvas')!;

    // Initialize UI
    this.ui = new UIController();

    // Simulate loading
    this.simulateLoading();

    // Initialize 3D scene
    this.scene = new PharmacyScene(container);

    // Wire up scene interactions to game logic
    this.scene.onShelfClick = () => {
      const state = useGameStore.getState();
      if (state.phase === 'prescription' || state.phase === 'playing') {
        if (state.currentPrescription) {
          useGameStore.getState().setPhase('drugSelection');
        } else {
          useGameStore.getState().openReference();
        }
      }
    };

    this.scene.onCounterClick = () => {
      const state = useGameStore.getState();
      if (state.phase === 'playing') {
        if (state.activeEncounter) {
          useGameStore.getState().setPhase('encounter');
        } else if (state.currentPrescription) {
          useGameStore.getState().setPhase('prescription');
        }
      }
    };

    this.scene.onPatientClick = () => {
      const state = useGameStore.getState();
      if (state.phase === 'playing' && state.activeEncounter) {
        useGameStore.getState().setPhase('encounter');
      } else if (state.phase === 'prescription' && state.currentPrescription && state.dispensed) {
        if (state.currentPrescription.counselingQuestions.length > 0) {
          useGameStore.getState().setPhase('dialogue');
        }
      }
    };

    // Start the 3D render loop
    this.scene.start();

    // Subscribe to game state changes to control 3D scene
    useGameStore.subscribe((state, prevState) => {
      // 1. Show/hide NPC based on active life-sim encounter
      if (state.activeEncounter !== prevState.activeEncounter) {
        if (state.activeEncounter) {
          this.currentPatientAvatar = state.activeEncounter.avatar;
          let charType: 'amina' | 'adeleke' | 'chidi' | 'kemi' | 'generic' = 'generic';
          const pName = state.activeEncounter.patientName.toLowerCase();
          if (pName.includes('amina')) charType = 'amina';
          else if (pName.includes('adeleke')) charType = 'adeleke';
          else if (pName.includes('chidi')) charType = 'chidi';
          else if (pName.includes('kemi')) charType = 'kemi';

          this.scene.showPatientNPC(this.currentPatientAvatar, charType, state.activeEncounter.patientName);
        } else if (!state.currentPrescription) {
          this.scene.hidePatientNPC();
        }
      }

      // 2. Fallback: Show/hide NPC based on legacy prescription state
      if (state.currentPrescription !== prevState.currentPrescription) {
        if (state.currentPrescription) {
          this.currentPatientAvatar = state.currentPrescription.patient.avatar;
          this.scene.showPatientNPC(this.currentPatientAvatar);
        }
      }

      // 3. Trigger talking gestures & dynamic counter camera framing
      const isTalkingNow = state.phase === 'encounter' || state.phase === 'dialogue';
      const wasTalkingBefore = prevState.phase === 'encounter' || prevState.phase === 'dialogue';

      if (isTalkingNow !== wasTalkingBefore) {
        this.scene.setPatientTalking(isTalkingNow);
        this.scene.setConsultationCamera(isTalkingNow);
      }

      // 4. Hide NPC on day summary or quiz
      if (state.phase === 'daySummary' || state.phase === 'quiz') {
        this.scene.hidePatientNPC();
      }
    });
  }

  private simulateLoading(): void {
    const steps = [
      { progress: 12, text: 'Loading Apex Metropolis environment...' },
      { progress: 28, text: 'Stocking community pharmacy shelves...' },
      { progress: 45, text: 'Syncing National Formulary & BNF reference...' },
      { progress: 62, text: 'Connecting clinic VoIP telephone line...' },
      { progress: 78, text: 'Calibrating POS register & patient registry...' },
      { progress: 92, text: 'Preparing morning shift cases...' },
      { progress: 100, text: 'Ready!' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        this.ui.updateLoading(steps[i].progress, steps[i].text);
        i++;
      } else {
        clearInterval(interval);
        this.ui.finishLoading();
      }
    }, 280);
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  new PharmaSim();
});
