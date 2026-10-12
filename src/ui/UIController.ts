// ============================================
// PharmaSim — UI Controller
// Manages all HTML overlay UI elements & Life-Sim RPG HUD
// ============================================

import { useGameStore, type GamePhase } from '../game/gameStore';
import { drugDatabase, getDrugById, getUniqueCategories, searchDrugs } from '../data/drugDatabase';
import { audioManager } from '../audio/AudioManager';
import { 
  OPENLIFE_DIETS, 
  OPENLIFE_BOOKS, 
  OPENLIFE_PROPERTIES, 
  OPENLIFE_VEHICLES, 
  OPENLIFE_MARKET_ASSETS,
  OPENLIFE_DISEASES 
} from '../game/openlife/openLifeData';

export class UIController {
  private unsubscribe: (() => void) | null = null;

  // Element refs
  private loadingScreen!: HTMLElement;
  private loadingBar!: HTMLElement;
  private loadingText!: HTMLElement;
  private mainMenu!: HTMLElement;
  private hud!: HTMLElement;
  private briefingModal!: HTMLElement;
  private prescriptionPanel!: HTMLElement;
  private drugSelectionModal!: HTMLElement;
  private dialogueBox!: HTMLElement;
  private encounterModal!: HTMLElement;
  private phoneModal!: HTMLElement;
  private prescriptionSlipModal!: HTMLElement;
  private reputationFlyout!: HTMLElement;
  private quizModal!: HTMLElement;
  private interactionAlert!: HTMLElement;
  private daySummary!: HTMLElement;
  private referenceBook!: HTMLElement;
  private howToPlay!: HTMLElement;
  private openLifeModal!: HTMLElement;
  private notificationContainer!: HTMLElement;

  constructor() {
    this.cacheElements();
    this.setupEventListeners();
    this.subscribeToStore();
  }

  private cacheElements(): void {
    this.loadingScreen = document.getElementById('loading-screen')!;
    this.loadingBar = document.getElementById('loading-bar')!;
    this.loadingText = document.getElementById('loading-text')!;
    this.mainMenu = document.getElementById('main-menu')!;
    this.hud = document.getElementById('hud')!;
    this.briefingModal = document.getElementById('briefing-modal')!;
    this.prescriptionPanel = document.getElementById('prescription-panel')!;
    this.drugSelectionModal = document.getElementById('drug-selection-modal')!;
    this.dialogueBox = document.getElementById('dialogue-box')!;
    this.encounterModal = document.getElementById('encounter-modal')!;
    this.phoneModal = document.getElementById('phone-modal')!;
    this.prescriptionSlipModal = document.getElementById('prescription-slip-modal')!;
    this.reputationFlyout = document.getElementById('hud-reputation-flyout')!;
    this.quizModal = document.getElementById('quiz-modal')!;
    this.interactionAlert = document.getElementById('interaction-alert')!;
    this.daySummary = document.getElementById('day-summary')!;
    this.referenceBook = document.getElementById('reference-book')!;
    this.howToPlay = document.getElementById('how-to-play')!;
    this.openLifeModal = document.getElementById('openlife-modal')!;
    this.notificationContainer = document.getElementById('notification-container')!;
  }

  private setupEventListeners(): void {
    const store = useGameStore.getState;

    // HUD controls
    const hudRefBtn = document.getElementById('btn-hud-reference');
    if (hudRefBtn) {
      hudRefBtn.onclick = () => {
        audioManager.playClick();
        store().openReference();
        this.populateReferenceBook();
      };
    }
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.onclick = () => {
        const isNowOn = audioManager.toggle();
        soundBtn.textContent = isNowOn ? '🔊' : '🔇';
        if (isNowOn) audioManager.playClick();
      };
    }
    const repToggleBtn = document.getElementById('btn-reputation-toggle');
    if (repToggleBtn) {
      repToggleBtn.onclick = () => {
        audioManager.playClick();
        this.reputationFlyout.classList.toggle('hidden');
      };
    }

    // Main menu
    document.getElementById('btn-start-game')!.onclick = () => {
      audioManager.playClick();
      store().startGame(1);
    };
    const menuOpenLifeBtn = document.getElementById('btn-menu-openlife');
    if (menuOpenLifeBtn) {
      menuOpenLifeBtn.onclick = () => {
        audioManager.playClick();
        this.openOpenLifeModal();
      };
    }
    document.getElementById('btn-drug-reference')!.onclick = () => {
      audioManager.playClick();
      store().setPhase('reference');
      this.populateReferenceBook();
    };
    document.getElementById('btn-how-to-play')!.onclick = () => {
      audioManager.playClick();
      this.showElement(this.howToPlay);
    };

    // How to play
    document.getElementById('btn-close-howto')!.onclick = () => {
      audioManager.playClick();
      this.hideElement(this.howToPlay);
    };
    document.getElementById('btn-close-howto-bottom')!.onclick = () => {
      audioManager.playClick();
      this.hideElement(this.howToPlay);
    };

    // Briefing
    document.getElementById('btn-start-day')!.onclick = () => {
      audioManager.playClick();
      store().startDay();
    };

    // Physical Workstation Actions
    const wsExamineBtn = document.getElementById('btn-ws-examine-rx');
    if (wsExamineBtn) {
      wsExamineBtn.onclick = () => {
        const enc = store().activeEncounter;
        if (enc && enc.prescriptionSlipData) {
          audioManager.playPickup();
          this.populatePrescriptionSlip();
          this.showElement(this.prescriptionSlipModal);
          store().setRxInspected(true);
          this.updateWorkstationUI();
        }
      };
    }

    const wsShelvesBtn = document.getElementById('btn-ws-open-shelves');
    if (wsShelvesBtn) {
      wsShelvesBtn.onclick = () => {
        audioManager.playPickup();
        store().setPhase('drugSelection');
        this.populateDrugSelection();
      };
    }

    const wsScanBtn = document.getElementById('btn-ws-scan-tray');
    if (wsScanBtn) {
      wsScanBtn.onclick = () => {
        store().scanDispensingTray();
        this.updateWorkstationUI();
      };
    }

    const wsAuxBtn = document.getElementById('btn-ws-aux-label');
    if (wsAuxBtn) {
      wsAuxBtn.onclick = () => {
        store().applyAuxiliaryLabel();
        this.updateWorkstationUI();
      };
    }

    const wsPhoneBtn = document.getElementById('btn-ws-call-doctor');
    if (wsPhoneBtn) {
      wsPhoneBtn.onclick = () => {
        store().startPhoneCall();
      };
    }

    const wsRingBtn = document.getElementById('btn-ws-ring-register');
    if (wsRingBtn) {
      wsRingBtn.onclick = () => {
        store().ringUpPosRegister();
        this.updateWorkstationUI();
      };
    }

    const toggleDialogueBtn = document.getElementById('btn-toggle-dialogue');
    const dialoguePane = document.getElementById('ws-dialogue-pane');
    if (toggleDialogueBtn && dialoguePane) {
      toggleDialogueBtn.onclick = () => {
        audioManager.playClick();
        dialoguePane.classList.toggle('collapsed');
        toggleDialogueBtn.classList.toggle('active');
      };
    }

    // Prescription Slip Inspection Actions
    const rxApproveBtn = document.getElementById('btn-rx-approve');
    if (rxApproveBtn) {
      rxApproveBtn.onclick = () => {
        audioManager.playSuccess();
        store().setRxStatus('verified');
        this.hideElement(this.prescriptionSlipModal);
        store().setPhase('drugSelection');
        this.populateDrugSelection();
        this.updateWorkstationUI();
      };
    }

    const rxCallClinicBtn = document.getElementById('btn-rx-call-clinic');
    if (rxCallClinicBtn) {
      rxCallClinicBtn.onclick = () => {
        this.hideElement(this.prescriptionSlipModal);
        store().startPhoneCall();
      };
    }

    const rxRejectBtn = document.getElementById('btn-rx-reject');
    if (rxRejectBtn) {
      rxRejectBtn.onclick = () => {
        audioManager.playWarning();
        store().setRxStatus('rejected');
        this.hideElement(this.prescriptionSlipModal);
        store().queueNotification('Prescription impounded under Controlled Substances Act.', 'warning');
        this.updateWorkstationUI();
      };
    }

    const closeSlipBtn = document.getElementById('btn-close-slip');
    if (closeSlipBtn) {
      closeSlipBtn.onclick = () => {
        audioManager.playClick();
        this.hideElement(this.prescriptionSlipModal);
      };
    }

    // Doctor Phone Terminal
    const phoneHangupBtn = document.getElementById('btn-phone-hangup');
    if (phoneHangupBtn) {
      phoneHangupBtn.onclick = () => {
        audioManager.playClick();
        store().closePhoneCall();
      };
    }

    // Prescription panel (legacy fallback)
    const closePrescriptionBtn = document.getElementById('btn-close-prescription');
    if (closePrescriptionBtn) {
      closePrescriptionBtn.onclick = () => {
        audioManager.playClick();
        store().setPhase('encounter');
      };
    }
    const selectDrugBtn = document.getElementById('btn-select-drug');
    if (selectDrugBtn) {
      selectDrugBtn.onclick = () => {
        audioManager.playPickup();
        store().setPhase('drugSelection');
        this.populateDrugSelection();
      };
    }
    const dispenseBtn = document.getElementById('btn-dispense');
    if (dispenseBtn) {
      dispenseBtn.onclick = () => {
        audioManager.playRegister();
        store().dispenseMedication();
      };
    }

    // Drug selection
    const closeDrugSelectBtn = document.getElementById('btn-close-drug-select');
    if (closeDrugSelectBtn) {
      closeDrugSelectBtn.onclick = () => {
        audioManager.playClick();
        store().setPhase('encounter');
      };
    }
    const drugSearchInput = document.getElementById('drug-search-input') as HTMLInputElement | null;
    if (drugSearchInput) {
      drugSearchInput.oninput = (e) => {
        const query = (e.target as HTMLInputElement).value;
        this.filterDrugGrid(query);
      };
    }
    const confirmDrugBtn = document.getElementById('btn-confirm-drug');
    if (confirmDrugBtn) {
      confirmDrugBtn.onclick = () => {
        audioManager.playPickup();
        store().confirmDrugSelection();
        this.updateWorkstationUI();
      };
    }

    // Interaction alert
    document.getElementById('btn-interaction-flag')!.onclick = () => {
      audioManager.playSuccess();
      store().flagInteraction();
      this.showNotification('Interaction flagged — good catch', 'success');
    };
    document.getElementById('btn-interaction-dismiss')!.onclick = () => {
      audioManager.playClick();
      store().dismissInteraction();
    };

    // Day summary
    document.getElementById('btn-next-day')!.onclick = () => {
      audioManager.playClick();
      store().nextDay();
    };
    document.getElementById('btn-back-menu')!.onclick = () => {
      audioManager.playClick();
      store().goToMenu();
    };
    const payRentBtn = document.getElementById('btn-pay-rent');
    if (payRentBtn) {
      payRentBtn.onclick = () => {
        const paid = store().payRent();
        if (paid) {
          this.populateDaySummary();
          this.updateHUD();
        }
      };
    }

    // OpenLife Controls
    const hudOpenLifeBtn = document.getElementById('btn-openlife-toggle');
    if (hudOpenLifeBtn) {
      hudOpenLifeBtn.onclick = () => {
        audioManager.playClick();
        this.openOpenLifeModal();
      };
    }

    const summaryOpenLifeBtn = document.getElementById('btn-summary-openlife');
    if (summaryOpenLifeBtn) {
      summaryOpenLifeBtn.onclick = () => {
        audioManager.playClick();
        this.openOpenLifeModal();
      };
    }

    const closeOpenLifeBtn = document.getElementById('btn-close-openlife');
    if (closeOpenLifeBtn) {
      closeOpenLifeBtn.onclick = () => {
        audioManager.playClick();
        this.closeOpenLifeModal();
      };
    }

    // OpenLife Tabs
    const tabBtns = document.querySelectorAll<HTMLButtonElement>('.ol-tab-btn');
    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        const tabKey = btn.dataset.tab;
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.ol-tab-pane').forEach((pane) => {
          pane.classList.remove('active');
        });
        const targetPane = document.getElementById(`ol-pane-${tabKey}`);
        if (targetPane) targetPane.classList.add('active');
        audioManager.playClick();
      };
    });

    // OpenLife Activity Actions
    const doctorBtn = document.getElementById('btn-ol-visit-doctor');
    if (doctorBtn) {
      doctorBtn.onclick = () => {
        const st = store();
        const firstIllnessId = st.openLifeState.activeDiseases?.[0] || 'cold';
        st.openLifeDoctor(firstIllnessId);
        this.populateOpenLifeHub();
        this.updateHUD();
      };
    }

    const gymBtn = document.getElementById('btn-ol-visit-gym');
    if (gymBtn) {
      gymBtn.onclick = () => {
        store().openLifeGym();
        this.populateOpenLifeHub();
        this.updateHUD();
      };
    }

    const readBookBtn = document.getElementById('btn-ol-read-book');
    if (readBookBtn) {
      readBookBtn.onclick = () => {
        const bookSelect = document.getElementById('ol-book-select') as HTMLSelectElement | null;
        const bId = bookSelect?.value || 'bnf86';
        store().openLifeReadBook(bId);
        this.populateOpenLifeHub();
        this.updateHUD();
      };
    }

    const lottoBtn = document.getElementById('btn-ol-buy-lotto');
    if (lottoBtn) {
      lottoBtn.onclick = () => {
        store().openLifeLottery();
        this.populateOpenLifeHub();
        this.updateHUD();
      };
    }

    const terminalForm = document.getElementById('ol-terminal-form');
    if (terminalForm) {
      terminalForm.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('ol-terminal-input') as HTMLInputElement | null;
        if (!input || !input.value.trim()) return;
        store().openLifeConsole(input.value.trim());
        input.value = '';
        this.populateOpenLifeHub();
        this.updateHUD();
      };
    }

    document.querySelectorAll<HTMLButtonElement>('.term-quick').forEach((btn) => {
      btn.onclick = () => {
        const cmd = btn.dataset.cmd;
        if (cmd) {
          store().openLifeConsole(cmd);
          this.populateOpenLifeHub();
          this.updateHUD();
        }
      };
    });

    // Reference
    document.getElementById('btn-close-reference')!.onclick = () => {
      audioManager.playClick();
      store().closeReference();
    };
    document.getElementById('reference-search-input')!.oninput = (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.filterReferenceList(query);
    };

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const state = store();
      if (e.key === 'r' || e.key === 'R') {
        if (state.phase === 'playing' || state.phase === 'prescription' || state.phase === 'encounter') {
          audioManager.playClick();
          store().openReference();
          this.populateReferenceBook();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (!this.openLifeModal.classList.contains('hidden')) {
          this.closeOpenLifeModal();
        } else {
          this.openOpenLifeModal();
        }
      } else if (e.key === 'Escape') {
        if (!this.openLifeModal.classList.contains('hidden')) {
          this.closeOpenLifeModal();
        } else if (state.phase === 'reference') {
          store().closeReference();
        } else if (state.phase === 'drugSelection') {
          store().setPhase('prescription');
        } else if (!this.prescriptionSlipModal.classList.contains('hidden')) {
          this.hideElement(this.prescriptionSlipModal);
        } else if (!this.reputationFlyout.classList.contains('hidden')) {
          this.reputationFlyout.classList.add('hidden');
        }
      }
    });
  }

  private subscribeToStore(): void {
    let prevPhase = useGameStore.getState().phase;
    let prevNodeId = useGameStore.getState().encounterNodeId;
    let prevPhoneNodeId = useGameStore.getState().phoneCallNodeId;

    this.unsubscribe = useGameStore.subscribe((state) => {
      if (state.phase !== prevPhase) {
        prevPhase = state.phase;
        this.handlePhaseChange(state.phase);
      } else if (state.phase === 'encounter') {
        if (state.encounterNodeId !== prevNodeId) {
          prevNodeId = state.encounterNodeId;
          this.populateEncounter();
        } else {
          this.updateWorkstationUI();
        }
      } else if (state.phase === 'phoneCall' && state.phoneCallNodeId !== prevPhoneNodeId) {
        prevPhoneNodeId = state.phoneCallNodeId;
        this.populatePhoneCall();
      }

      // Check pending notifications
      if (state.pendingNotifications.length > 0) {
        for (const notif of state.pendingNotifications) {
          this.showNotification(notif.text, notif.type);
        }
        useGameStore.getState().clearNotifications();
      }

      // Always sync top HUD vitality and stats
      if (state.phase !== 'loading' && state.phase !== 'menu') {
        this.updateHUD();
      }
    });
  }

  private handlePhaseChange(phase: GamePhase): void {
    this.hideAll();

    switch (phase) {
      case 'loading':
        this.showElement(this.loadingScreen);
        break;
      case 'menu':
        this.showElement(this.mainMenu);
        break;
      case 'briefing':
        this.showElement(this.briefingModal);
        this.populateBriefing();
        break;
      case 'playing':
        this.showElement(this.hud);
        this.updateHUD();
        break;
      case 'encounter':
        this.showElement(this.hud);
        this.showElement(this.encounterModal);
        this.populateEncounter();
        this.updateWorkstationUI();
        this.updateHUD();
        break;
      case 'phoneCall':
        this.showElement(this.hud);
        this.showElement(this.phoneModal);
        this.populatePhoneCall();
        break;
      case 'prescription':
        this.showElement(this.hud);
        this.showElement(this.prescriptionPanel);
        this.populatePrescription();
        this.updateHUD();
        break;
      case 'drugSelection':
        this.showElement(this.hud);
        this.showElement(this.drugSelectionModal);
        this.populateDrugSelection();
        break;
      case 'dialogue':
        this.showElement(this.hud);
        this.showElement(this.dialogueBox);
        this.populateDialogue();
        this.updateHUD();
        break;
      case 'quiz':
        this.showElement(this.quizModal);
        this.populateQuiz();
        break;
      case 'interactionAlert':
        this.showElement(this.hud);
        this.showElement(this.prescriptionPanel);
        this.showElement(this.interactionAlert);
        this.populateInteractionAlert();
        audioManager.playWarning();
        break;
      case 'daySummary':
        this.showElement(this.daySummary);
        this.populateDaySummary();
        audioManager.playFanfare();
        break;
      case 'reference':
        this.showElement(this.referenceBook);
        break;
    }
  }

  private hideAll(): void {
    const elements = [
      this.loadingScreen, this.mainMenu, this.hud, this.briefingModal,
      this.prescriptionPanel, this.drugSelectionModal, this.dialogueBox,
      this.encounterModal, this.phoneModal, this.prescriptionSlipModal,
      this.reputationFlyout, this.quizModal, this.interactionAlert, 
      this.daySummary, this.referenceBook, this.openLifeModal,
    ];
    for (const el of elements) {
      if (el) this.hideElement(el);
    }
  }

  private showElement(el: HTMLElement): void {
    el.classList.remove('hidden');
  }

  private hideElement(el: HTMLElement): void {
    el.classList.add('hidden');
  }

  // === LOADING ===
  public updateLoading(progress: number, text: string): void {
    this.loadingBar.style.width = `${progress}%`;
    this.loadingText.textContent = text;
  }

  public finishLoading(): void {
    this.updateLoading(100, 'Ready!');
    setTimeout(() => {
      useGameStore.getState().setPhase('menu');
    }, 500);
  }

  // === BRIEFING ===
  private populateBriefing(): void {
    const state = useGameStore.getState();
    const config = state.dayConfig;
    if (!config) return;

    document.getElementById('briefing-day-label')!.textContent = `Day ${config.dayNumber} — ${config.title}`;
    document.getElementById('briefing-description')!.textContent = config.description;

    const focusList = document.getElementById('briefing-focus-list')!;
    focusList.innerHTML = '';
    for (const topic of config.focusTopics) {
      const li = document.createElement('li');
      li.textContent = topic;
      focusList.appendChild(li);
    }
  }

  // === LIFE-SIM HUD ===
  private updateHUD(): void {
    const state = useGameStore.getState();
    const { player, reputation } = state;

    // Player metadata
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl) nameEl.textContent = player.name;

    const titleEl = document.getElementById('hud-player-title');
    if (titleEl) titleEl.textContent = player.title;

    const avatarEl = document.getElementById('hud-avatar');
    if (avatarEl) avatarEl.textContent = player.avatar;

    const avatarImgEl = document.getElementById('hud-avatar-img') as HTMLImageElement;
    if (avatarImgEl && player.portraitUrl) {
      avatarImgEl.src = player.portraitUrl;
    }

    // Vitality Gauges
    const energyValEl = document.getElementById('hud-energy-val');
    const energyFillEl = document.getElementById('hud-energy-fill');
    if (energyValEl && energyFillEl) {
      energyValEl.textContent = `${player.energy}%`;
      energyFillEl.style.width = `${player.energy}%`;
    }

    const focusValEl = document.getElementById('hud-focus-val');
    const focusFillEl = document.getElementById('hud-focus-fill');
    if (focusValEl && focusFillEl) {
      focusValEl.textContent = `${player.focus}%`;
      focusFillEl.style.width = `${player.focus}%`;
    }

    const stressValEl = document.getElementById('hud-stress-val');
    const stressFillEl = document.getElementById('hud-stress-fill');
    if (stressValEl && stressFillEl) {
      stressValEl.textContent = `${player.stress}%`;
      stressFillEl.style.width = `${player.stress}%`;
    }

    // Finance & Rent
    const cashValEl = document.getElementById('hud-cash-val');
    if (cashValEl) cashValEl.textContent = `₵${player.cash}`;

    const rentTextEl = document.getElementById('hud-rent-text');
    if (rentTextEl) rentTextEl.textContent = `Rent in ${player.rentDueInDays}d (₵${player.rentAmount})`;

    // Case Progress Tracker
    const casesCountEl = document.getElementById('hud-patients-seen');
    if (casesCountEl) {
      const total = state.encounters.length > 0 ? state.encounters.length : (state.dayConfig?.prescriptions.length || 0);
      casesCountEl.textContent = `Cases: ${state.encountersCompleted}/${total}`;
    }

    // Reputation Flyout Meters
    const repTrustVal = document.getElementById('rep-val-trust');
    const repTrustFill = document.getElementById('rep-fill-trust');
    if (repTrustVal && repTrustFill) {
      repTrustVal.textContent = `${reputation.patientTrust}%`;
      repTrustFill.style.width = `${reputation.patientTrust}%`;
    }

    const repRespectVal = document.getElementById('rep-val-respect');
    const repRespectFill = document.getElementById('rep-fill-respect');
    if (repRespectVal && repRespectFill) {
      repRespectVal.textContent = `${reputation.doctorRespect}%`;
      repRespectFill.style.width = `${reputation.doctorRespect}%`;
    }

    const repSupervisorVal = document.getElementById('rep-val-supervisor');
    const repSupervisorFill = document.getElementById('rep-fill-supervisor');
    if (repSupervisorVal && repSupervisorFill) {
      repSupervisorVal.textContent = `${reputation.supervisorRating}%`;
      repSupervisorFill.style.width = `${reputation.supervisorRating}%`;
    }

    const repBoardVal = document.getElementById('rep-val-board');
    const repBoardFill = document.getElementById('rep-fill-board');
    if (repBoardVal && repBoardFill) {
      repBoardVal.textContent = `${reputation.boardStanding}%`;
      repBoardFill.style.width = `${reputation.boardStanding}%`;
    }

    // Dynamic Bottom Hint
    const hintText = document.getElementById('hud-hint-text');
    if (hintText) {
      if (state.phase === 'playing') {
        hintText.textContent = state.activeEncounter 
          ? 'Patient waiting at the counter. Click patient to begin consultation!' 
          : 'Walk behind the counter with WASD. Review medications with R.';
      } else if (state.phase === 'encounter') {
        hintText.textContent = 'Carefully assess symptoms, verify prescriptions, and counsel with clinical empathy.';
      } else if (state.phase === 'phoneCall') {
        hintText.textContent = 'Speaking directly with clinic prescriber. Professional diplomacy is key.';
      }
    }
  }

  // === CLINICAL ENCOUNTER ENGINE & WORKSTATION DOCK ===
  private populateEncounter(): void {
    const state = useGameStore.getState();
    const enc = state.activeEncounter;
    const nodeId = state.encounterNodeId;
    if (!enc || !nodeId) return;

    const currentNode = enc.dialogueNodes[nodeId];
    if (!currentNode) return;

    // Patient Bio Card
    const avatarEl = document.getElementById('encounter-patient-avatar');
    if (avatarEl) avatarEl.textContent = enc.avatar;

    const nameEl = document.getElementById('encounter-patient-name');
    if (nameEl) nameEl.textContent = enc.patientName;

    const caseTitleEl = document.getElementById('encounter-case-title');
    if (caseTitleEl) caseTitleEl.textContent = enc.title;

    const ageEl = document.getElementById('encounter-patient-age');
    if (ageEl) ageEl.textContent = `${enc.patientAge} yrs · ${enc.patientGender === 'F' ? 'Female' : 'Male'}`;

    const descEl = document.getElementById('encounter-patient-desc');
    if (descEl) descEl.textContent = enc.appearanceDescription;

    const patientPhotoEl = document.getElementById('encounter-patient-photo') as HTMLImageElement;
    const photoUrl = currentNode.portraitUrl || enc.portraitUrl;
    if (patientPhotoEl && photoUrl) {
      patientPhotoEl.src = photoUrl;
      patientPhotoEl.classList.remove('hidden');
    }

    // Mood Badge
    const moodBadge = document.getElementById('encounter-patient-mood');
    if (moodBadge) {
      moodBadge.textContent = currentNode.mood.toUpperCase();
      moodBadge.className = `patient-mood-badge ${currentNode.mood}`;
    }

    // Speech Bubble
    const speakerNameEl = document.getElementById('encounter-speaker-name');
    if (speakerNameEl) speakerNameEl.textContent = currentNode.speaker;

    const speechTextEl = document.getElementById('encounter-speech-text');
    if (speechTextEl) speechTextEl.textContent = `"${currentNode.text}"`;

    // Populate Interactive Choices (spoken dialogue without quiz spoiler tags)
    const optionsContainer = document.getElementById('encounter-options-list')!;
    optionsContainer.innerHTML = '';

    for (const opt of currentNode.options) {
      const btn = document.createElement('button');
      btn.className = 'encounter-opt-btn';

      // Clean natural dialogue without academic quiz spoiler tags
      const cleanLabel = opt.label.replace(/^\[.*?\]\s*/g, '').trim();

      btn.innerHTML = `
        <span class="opt-bullet">💬</span>
        <span class="opt-label-text">${cleanLabel}</span>
      `;

      btn.onclick = () => {
        useGameStore.getState().advanceDialogue(opt.id);
      };

      optionsContainer.appendChild(btn);
    }

    // Synchronize physical counter stations
    this.updateWorkstationUI();
  }

  // === TACTILE PRESCRIPTION DESK SLIP INSPECTION ===
  private populatePrescriptionSlip(): void {
    const enc = useGameStore.getState().activeEncounter;
    if (!enc || !enc.prescriptionSlipData) return;

    const slip = enc.prescriptionSlipData;

    const clinicEl = document.getElementById('rx-slip-clinic-name');
    if (clinicEl) clinicEl.textContent = slip.clinicName;

    const dateEl = document.getElementById('rx-slip-date');
    if (dateEl) dateEl.textContent = `Date: ${slip.date}`;

    const pNameEl = document.getElementById('rx-slip-patient-name');
    if (pNameEl) pNameEl.textContent = slip.patientName;

    const pAgeEl = document.getElementById('rx-slip-patient-age');
    if (pAgeEl) pAgeEl.textContent = `Age: ${slip.patientAge}`;

    const docNameEl = document.getElementById('rx-slip-doctor-name');
    if (docNameEl) docNameEl.textContent = `${slip.prescriberName}, ${slip.prescriberTitle}`;

    const docLicEl = document.getElementById('rx-slip-doctor-license');
    if (docLicEl) docLicEl.textContent = `Reg No: ${slip.prescriberLicense}`;

    const itemsContainer = document.getElementById('rx-slip-items-list');
    if (itemsContainer) {
      itemsContainer.innerHTML = '';
      for (const item of slip.rxItems) {
        const itemRow = document.createElement('div');
        itemRow.className = 'rx-item-row';
        itemRow.innerHTML = `
          <div class="rx-item-name-block">
            <strong>${item.drugName} ${item.dosage}</strong>
            <span>${item.frequency} · ${item.duration}</span>
          </div>
          <div class="rx-item-qty">Qty: ${item.quantity}</div>
        `;
        itemsContainer.appendChild(itemRow);
      }
    }

    const stampEl = document.getElementById('rx-slip-stamp-text');
    const stampCircle = document.getElementById('rx-slip-stamp-badge');
    if (stampEl && stampCircle) {
      stampEl.textContent = slip.stampText;
      stampCircle.className = `stamp-circle ${slip.stampStatus === 'suspicious_forgery' ? 'suspicious' : 'verified'}`;
    }

    const forgeryBox = document.getElementById('rx-forgery-alert-box');
    const forgeryList = document.getElementById('rx-forgery-reasons-list');
    if (forgeryBox && forgeryList) {
      if (slip.isForged && slip.forgeryClues && slip.forgeryClues.length > 0) {
        forgeryBox.classList.remove('hidden');
        forgeryList.innerHTML = '';
        for (const clue of slip.forgeryClues) {
          const li = document.createElement('li');
          li.textContent = clue;
          forgeryList.appendChild(li);
        }
      } else {
        forgeryBox.classList.add('hidden');
      }
    }
  }

  // === PHYSICAL WORKSTATION DECK HUD UPDATE ===
  private updateWorkstationUI(): void {
    const state = useGameStore.getState();
    const enc = state.activeEncounter;
    const ws = state.workstation;
    if (!enc || !ws) return;

    // Station 1: Prescription Slip
    const rxStatusEl = document.getElementById('ws-rx-status');
    const rxExamineBtn = document.getElementById('btn-ws-examine-rx') as HTMLButtonElement | null;
    if (rxStatusEl && rxExamineBtn) {
      if (enc.hasPrescription && enc.prescriptionSlipData) {
        rxExamineBtn.disabled = false;
        if (ws.rxStatus === 'verified') {
          rxStatusEl.textContent = '✓ Rx Inspected & Verified';
          rxStatusEl.className = 'station-sub success';
        } else if (ws.rxStatus === 'rejected') {
          rxStatusEl.textContent = '⚠️ Impounded / Flagged Forgery';
          rxStatusEl.className = 'station-sub danger';
        } else if (ws.rxInspected) {
          rxStatusEl.textContent = 'Slip Examined on Counter';
          rxStatusEl.className = 'station-sub active';
        } else {
          rxStatusEl.textContent = 'Rx Presented — Click to Examine';
          rxStatusEl.className = 'station-sub warning';
        }
      } else {
        rxExamineBtn.disabled = true;
        rxStatusEl.textContent = 'No Rx Presented (OTC / Triage)';
        rxStatusEl.className = 'station-sub';
      }
    }

    // Station 2: Storage Shelves & Counter Dispensing Tray
    const trayCountEl = document.getElementById('ws-tray-count');
    if (trayCountEl) {
      if (ws.dispensingTray.length === 0) {
        trayCountEl.textContent = 'Tray: Empty';
        trayCountEl.className = 'station-sub';
      } else {
        const names = ws.dispensingTray.map(id => {
          const d = getDrugById(id);
          return d?.brandNames[0] || d?.genericName || id;
        });
        trayCountEl.textContent = `Tray (${ws.dispensingTray.length}): ${names.join(', ')}`;
        trayCountEl.className = 'station-sub active';
      }
    }

    // Station 3: Safety Terminal & Scanner
    const scannerStatusEl = document.getElementById('ws-scanner-status');
    const auxBtn = document.getElementById('btn-ws-aux-label');
    if (scannerStatusEl) {
      if (ws.scannerAlert) {
        if (ws.scannerAlert.severity === 'danger') {
          scannerStatusEl.textContent = `🚨 ${ws.scannerAlert.title}`;
          scannerStatusEl.className = 'station-sub danger';
        } else if (ws.scannerAlert.severity === 'warning') {
          scannerStatusEl.textContent = `⚠️ ${ws.scannerAlert.title}`;
          scannerStatusEl.className = 'station-sub warning';
        } else {
          scannerStatusEl.textContent = `✓ ${ws.scannerAlert.title}`;
          scannerStatusEl.className = 'station-sub success';
        }

        if (auxBtn) {
          if (ws.scannerAlert.auxiliaryLabelType && !ws.auxiliaryLabelApplied) {
            auxBtn.classList.remove('hidden');
            auxBtn.textContent = '🏷️ Attach Spacing Sticker';
          } else if (ws.auxiliaryLabelApplied) {
            auxBtn.classList.remove('hidden');
            auxBtn.textContent = '✓ Sticker Attached';
            auxBtn.className = 'station-btn success';
          } else {
            auxBtn.classList.add('hidden');
          }
        }
      } else {
        scannerStatusEl.textContent = ws.dispensingTray.length > 0 ? 'Ready to Scan Tray' : 'Scanner Ready';
        scannerStatusEl.className = 'station-sub';
        if (auxBtn) auxBtn.classList.add('hidden');
      }
    }

    // Station 4: Clinic Hotline Phone
    const phoneStatusEl = document.getElementById('ws-phone-status');
    const phoneBtn = document.getElementById('btn-ws-call-doctor') as HTMLButtonElement | null;
    if (phoneStatusEl && phoneBtn) {
      if (enc.doctorPhoneCall) {
        phoneStatusEl.textContent = `${enc.doctorPhoneCall.doctorName} (${enc.doctorPhoneCall.clinicName})`;
        phoneBtn.disabled = false;
      } else {
        phoneStatusEl.textContent = 'Apex General Clinic Line';
        phoneBtn.disabled = false;
      }
    }

    // Station 5: POS Cash Register
    const regTotalEl = document.getElementById('ws-register-total');
    const regBtn = document.getElementById('btn-ws-ring-register') as HTMLButtonElement | null;
    if (regTotalEl && regBtn) {
      regTotalEl.textContent = `₵${ws.posReceiptTotal.toFixed(2)} Due`;
      regBtn.disabled = false;
    }
  }

  // === DOCTOR PHONE TERMINAL ===
  private populatePhoneCall(): void {
    const state = useGameStore.getState();
    const phone = state.activePhoneCall;
    const nodeId = state.phoneCallNodeId;
    if (!phone || !nodeId) return;

    const node = phone.dialogueNodes[nodeId];
    if (!node) return;

    document.getElementById('phone-doctor-name')!.textContent = phone.doctorName;
    document.getElementById('phone-clinic-name')!.textContent = phone.clinicName;
    document.getElementById('phone-dialogue-text')!.textContent = `"${node.text}"`;

    const optionsContainer = document.getElementById('phone-options-list')!;
    optionsContainer.innerHTML = '';

    for (const opt of node.options) {
      const btn = document.createElement('button');
      btn.className = 'phone-opt-btn';
      btn.textContent = opt.label;
      btn.onclick = () => {
        useGameStore.getState().advancePhoneCall(opt.id);
      };
      optionsContainer.appendChild(btn);
    }
  }

  // === PRESCRIPTION PANEL (LEGACY / DISPENSE) ===
  private populatePrescription(): void {
    const state = useGameStore.getState();
    const rx = state.currentPrescription;
    if (!rx) return;

    document.getElementById('rx-patient')!.textContent = `${rx.patient.name}, ${rx.patient.age} (${rx.patient.gender})`;
    document.getElementById('rx-doctor')!.textContent = rx.doctorName;
    document.getElementById('rx-drug')!.textContent = rx.prescribedDrugId.toUpperCase();
    document.getElementById('rx-dosage')!.textContent = rx.dosage;
    document.getElementById('rx-form')!.textContent = rx.form;
    document.getElementById('rx-quantity')!.textContent = rx.quantity;
    document.getElementById('rx-instructions')!.textContent = rx.instructions;

    const allergyField = document.getElementById('rx-allergy-field')!;
    if (rx.hasAllergyRisk && rx.allergyDrugId) {
      allergyField.style.display = 'block';
      document.getElementById('rx-allergy')!.textContent = `Known allergy: ${rx.allergyDrugId}`;
    } else {
      allergyField.style.display = 'none';
    }

    (document.getElementById('rx-check-drug') as HTMLInputElement).checked = !!state.selectedDrugId;
    (document.getElementById('rx-check-interaction') as HTMLInputElement).checked = state.interactionChecked;
    (document.getElementById('rx-check-counsel') as HTMLInputElement).checked = false;

    const dispenseBtn = document.getElementById('btn-dispense') as HTMLButtonElement;
    dispenseBtn.disabled = !state.selectedDrugId;
  }

  // === DRUG SELECTION MODAL ===
  private populateDrugSelection(): void {
    const categoriesDiv = document.getElementById('drug-categories')!;
    categoriesDiv.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All Categories';
    allBtn.onclick = () => {
      categoriesDiv.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      this.renderDrugGrid(drugDatabase);
    };
    categoriesDiv.appendChild(allBtn);

    const categories = getUniqueCategories();
    for (const cat of categories) {
      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.textContent = cat;
      btn.onclick = () => {
        categoriesDiv.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderDrugGrid(drugDatabase.filter(d => d.category === cat));
      };
      categoriesDiv.appendChild(btn);
    }

    this.renderDrugGrid(drugDatabase);
    document.getElementById('drug-detail-panel')!.classList.add('hidden');
  }

  private renderDrugGrid(drugs: typeof drugDatabase): void {
    const grid = document.getElementById('drug-grid')!;
    grid.innerHTML = '';

    for (const drug of drugs) {
      const card = document.createElement('div');
      card.className = 'drug-card';
      card.innerHTML = `
        <div class="drug-brand">${drug.brandNames[0] || drug.genericName}</div>
        <div class="drug-generic">${drug.genericName}</div>
        <span class="drug-category-badge">${drug.category}</span>
      `;
      card.onclick = () => {
        grid.querySelectorAll('.drug-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.showDrugDetail(drug);
      };
      grid.appendChild(card);
    }
  }

  private showDrugDetail(drug: (typeof drugDatabase)[0]): void {
    const panel = document.getElementById('drug-detail-panel')!;
    panel.classList.remove('hidden');

    document.getElementById('drug-detail-name')!.textContent = `${drug.brandNames[0] || drug.genericName} (${drug.genericName})`;
    document.getElementById('drug-detail-generic')!.textContent = drug.genericName;
    document.getElementById('drug-detail-category')!.textContent = drug.category;
    document.getElementById('drug-detail-dosage')!.textContent = drug.commonDosages.join(', ');
    document.getElementById('drug-detail-mechanism')!.textContent = drug.mechanism;
    document.getElementById('drug-detail-indications')!.textContent = drug.indications.join(', ');
    document.getElementById('drug-detail-sides')!.textContent = drug.sideEffects.join(', ');
    document.getElementById('drug-detail-interactions')!.textContent = drug.interactions.join(', ');

    useGameStore.getState().selectDrug(drug.id);
  }

  private filterDrugGrid(query: string): void {
    const results = query ? searchDrugs(query) : drugDatabase;
    this.renderDrugGrid(results);
  }

  // === INTERACTION ALERT ===
  private populateInteractionAlert(): void {
    const state = useGameStore.getState();
    const rx = state.currentPrescription;
    if (!rx) return;

    document.getElementById('interaction-alert-title')!.textContent = 'Contraindication / Drug Interaction Risk';
    document.getElementById('interaction-alert-desc')!.textContent =
      `Prescribed medication ${state.selectedDrug?.genericName || ''} interacts with patient profile (${rx.patient.name}).`;
  }

  // === DIALOGUE (LEGACY COUNSELING) ===
  private populateDialogue(): void {
    const state = useGameStore.getState();
    const rx = state.currentPrescription;
    if (!rx) return;

    const question = rx.counselingQuestions[state.currentCounselingIndex];
    if (!question) {
      useGameStore.getState().nextPrescription();
      return;
    }

    document.getElementById('dialogue-avatar')!.textContent = rx.patient.avatar;
    document.getElementById('dialogue-name')!.textContent = rx.patient.name;
    document.getElementById('dialogue-text')!.textContent = question.patientQuestion;

    const optionsDiv = document.getElementById('dialogue-options')!;
    optionsDiv.innerHTML = '';

    for (let i = 0; i < question.options.length; i++) {
      const opt = question.options[i];
      const btn = document.createElement('button');
      btn.className = 'dialogue-option';
      btn.textContent = opt.text;
      btn.onclick = () => {
        const isCorrect = useGameStore.getState().answerCounseling(i);
        if (isCorrect) audioManager.playSuccess();
        else audioManager.playWarning();

        btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        this.showNotification(opt.feedback, isCorrect ? 'success' : 'warning');

        setTimeout(() => {
          const nextIdx = state.currentCounselingIndex + 1;
          if (nextIdx < rx.counselingQuestions.length) {
            useGameStore.setState({ currentCounselingIndex: nextIdx });
            this.populateDialogue();
          } else {
            useGameStore.getState().nextPrescription();
          }
        }, 2500);
      };
      optionsDiv.appendChild(btn);
    }
  }

  // === QUIZ ===
  private populateQuiz(): void {
    const state = useGameStore.getState();
    const config = state.dayConfig;
    if (!config) return;

    const question = config.quizQuestions[state.currentQuizIndex];
    if (!question) return;

    document.getElementById('quiz-progress')!.textContent = `${state.currentQuizIndex + 1}/${config.quizQuestions.length}`;
    document.getElementById('quiz-question')!.textContent = question.question;

    const optionsDiv = document.getElementById('quiz-options')!;
    optionsDiv.innerHTML = '';

    const feedbackDiv = document.getElementById('quiz-feedback')!;
    feedbackDiv.classList.add('hidden');

    for (let i = 0; i < question.options.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = question.options[i];
      btn.onclick = () => {
        if (state.quizAnswered) return;
        const isCorrect = useGameStore.getState().answerQuiz(i);
        if (isCorrect) audioManager.playSuccess();
        else audioManager.playBuzz();

        btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedbackDiv.classList.remove('hidden');
        document.getElementById('quiz-feedback-text')!.textContent = question.explanation;

        document.getElementById('btn-quiz-next')!.onclick = () => {
          useGameStore.getState().nextQuizQuestion();
          this.populateQuiz();
        };
      };
      optionsDiv.appendChild(btn);
    }
  }

  // === DAY SUMMARY & LIFE-SIM SETTLEMENT ===
  private populateDaySummary(): void {
    const state = useGameStore.getState();
    const { player, reputation } = state;

    document.getElementById('summary-day-label')!.textContent = `Day ${state.currentDay} Shift Complete · Medix Central Pharmacy`;

    // Financial settlements
    const salEl = document.getElementById('sum-fin-salary');
    if (salEl) salEl.textContent = `+₵${player.dailySalary}`;

    const bonusEl = document.getElementById('sum-fin-bonus');
    if (bonusEl) bonusEl.textContent = `+₵${player.shiftBonusEarned}`;

    const totalEl = document.getElementById('sum-fin-total');
    if (totalEl) totalEl.textContent = `₵${player.cash}`;

    // Rent Countdown
    const rentEl = document.getElementById('sum-rent-countdown');
    if (rentEl) {
      rentEl.textContent = `${player.rentDueInDays} Days remaining until due date (₵${player.rentAmount})`;
    }

    // Performance Metrics
    const totalCases = state.encounters.length > 0 ? state.encounters.length : (state.dayConfig?.prescriptions.length || 0);
    const casesEl = document.getElementById('stat-cases-completed');
    if (casesEl) casesEl.textContent = `${state.encountersCompleted}/${totalCases}`;

    const trustEl = document.getElementById('stat-patient-trust');
    if (trustEl) trustEl.textContent = `${reputation.patientTrust}%`;

    const respectEl = document.getElementById('stat-doctor-respect');
    if (respectEl) respectEl.textContent = `${reputation.doctorRespect}%`;

    const supervisorEl = document.getElementById('stat-supervisor-rating');
    if (supervisorEl) supervisorEl.textContent = `${reputation.supervisorRating}%`;

    const gradeEl = document.getElementById('summary-grade');
    if (gradeEl) gradeEl.textContent = state.getGrade();
  }

  // === DRUG REFERENCE (BNF) ===
  private populateReferenceBook(): void {
    this.renderReferenceList(drugDatabase);
  }

  private renderReferenceList(drugs: typeof drugDatabase): void {
    const list = document.getElementById('reference-list')!;
    list.innerHTML = '';

    for (const drug of drugs) {
      const item = document.createElement('div');
      item.className = 'reference-item';
      item.innerHTML = `
        <div class="ref-name">${drug.brandNames[0] || drug.genericName}</div>
        <div class="ref-generic">${drug.genericName} · ${drug.category}</div>
      `;
      item.onclick = () => {
        list.querySelectorAll('.reference-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.renderReferenceDetail(drug);
      };
      list.appendChild(item);
    }
  }

  private renderReferenceDetail(drug: (typeof drugDatabase)[0]): void {
    const detail = document.getElementById('reference-detail')!;
    const interactionsHtml = drug.interactions.map(i => `<li>${i}</li>`).join('');

    detail.innerHTML = `
      <div class="ref-detail-section">
        <h3>${drug.brandNames[0] || drug.genericName}</h3>
        <p><strong>Generic:</strong> ${drug.genericName} · <strong>Class:</strong> ${drug.category}</p>
      </div>

      <div class="ref-detail-section">
        <h4>Mechanism of Action</h4>
        <p>${drug.mechanism}</p>
      </div>

      <div class="ref-detail-section">
        <h4>Indications</h4>
        <ul>${drug.indications.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>

      <div class="ref-detail-section">
        <h4>Dosage Forms &amp; Strengths</h4>
        <p><strong>Forms:</strong> ${drug.dosageForms.join(', ')}</p>
        <p><strong>Common Dosages:</strong> ${drug.commonDosages.join(', ')}</p>
      </div>

      <div class="ref-detail-section">
        <h4>Contraindications &amp; Precautions</h4>
        <ul>${drug.contraindications.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>

      <div class="ref-detail-section">
        <h4>Adverse Effects</h4>
        <ul>${drug.sideEffects.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>

      <div class="ref-detail-section">
        <h4>Drug Interactions</h4>
        <ul>${interactionsHtml}</ul>
      </div>

      <div class="ref-detail-section">
        <h4>Patient Counseling Points</h4>
        <ul>${drug.counselingPoints.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
    `;
  }

  private filterReferenceList(query: string): void {
    const results = query ? searchDrugs(query) : drugDatabase;
    this.renderReferenceList(results);
  }

  // === NOTIFICATIONS ===
  public showNotification(text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
    const icons = { success: '✓', warning: '⚠️', error: '✗', info: 'ℹ️' };
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${icons[type]}</span>
      <span class="notification-text">${text}</span>
    `;
    this.notificationContainer.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // === OPENLIFE LIFE SIMULATOR HUB ===
  public openOpenLifeModal(): void {
    if (this.openLifeModal) {
      this.showElement(this.openLifeModal);
      this.populateOpenLifeHub();
      audioManager.playClick();
    }
  }

  public closeOpenLifeModal(): void {
    if (this.openLifeModal) {
      this.hideElement(this.openLifeModal);
      audioManager.playClick();
    }
  }

  public populateOpenLifeHub(): void {
    const state = useGameStore.getState();
    const { player, openLifeState } = state;

    // 1. Vitality Hero & BitLife Gauges
    const healthEl = document.getElementById('ol-stat-health');
    const healthBar = document.getElementById('ol-bar-health');
    if (healthEl && healthBar) {
      healthEl.textContent = `${player.health}%`;
      healthBar.style.width = `${Math.min(100, Math.max(0, player.health))}%`;
    }

    const happinessEl = document.getElementById('ol-stat-happiness');
    const happinessBar = document.getElementById('ol-bar-happiness');
    if (happinessEl && happinessBar) {
      happinessEl.textContent = `${player.happiness}%`;
      happinessBar.style.width = `${Math.min(100, Math.max(0, player.happiness))}%`;
    }

    const intelEl = document.getElementById('ol-stat-intel');
    const intelBar = document.getElementById('ol-bar-intel');
    if (intelEl && intelBar) {
      intelEl.textContent = `${player.intel}%`;
      intelBar.style.width = `${Math.min(100, Math.max(0, player.intel))}%`;
    }

    const looksEl = document.getElementById('ol-stat-looks');
    const looksBar = document.getElementById('ol-bar-looks');
    if (looksEl && looksBar) {
      looksEl.textContent = `${player.looks}%`;
      looksBar.style.width = `${Math.min(100, Math.max(0, player.looks))}%`;
    }

    const karmaVal = openLifeState?.stats?.karma ?? 90;
    const fameVal = openLifeState?.stats?.fame ?? 10;
    const karmaEl = document.getElementById('ol-stat-karma');
    if (karmaEl) karmaEl.textContent = `${karmaVal}%`;

    const fameEl = document.getElementById('ol-stat-fame');
    if (fameEl) fameEl.textContent = `${fameVal}%`;

    const dietNameEl = document.getElementById('ol-stat-diet-name');
    if (dietNameEl) dietNameEl.textContent = player.currentDiet;

    // 2. Diets Grid
    const dietsContainer = document.getElementById('ol-diets-grid');
    if (dietsContainer) {
      dietsContainer.innerHTML = '';
      for (const diet of Object.values(OPENLIFE_DIETS)) {
        const isActive = player.currentDiet.toLowerCase().includes(diet.name.toLowerCase().split(' ')[0]);
        const card = document.createElement('div');
        card.className = `ol-diet-card ${isActive ? 'active' : ''}`;
        card.innerHTML = `
          <div class="diet-icon">${diet.icon}</div>
          <div class="diet-info">
            <div class="diet-name-row">
              <strong>${diet.name}</strong>
              <span class="diet-cost">₵${diet.costPerShift}/shift</span>
            </div>
            <p class="diet-desc">${diet.description}</p>
            <div class="diet-deltas">
              <span class="${diet.healthDelta >= 0 ? 'pos' : 'neg'}">Health ${diet.healthDelta >= 0 ? '+' : ''}${diet.healthDelta}%</span>
              <span class="${diet.happinessDelta >= 0 ? 'pos' : 'neg'}">Happy ${diet.happinessDelta >= 0 ? '+' : ''}${diet.happinessDelta}%</span>
              <span>Stress ${diet.stressDelta >= 0 ? '+' : ''}${diet.stressDelta}%</span>
            </div>
          </div>
          <div class="diet-action">
            ${isActive 
              ? '<button class="panel-btn-sm success" disabled>Active Diet ✓</button>'
              : `<button class="panel-btn-sm primary btn-adopt-diet" data-diet="${diet.id}">Adopt Plan</button>`
            }
          </div>
        `;
        dietsContainer.appendChild(card);
      }

      // Wire adopt diet buttons
      dietsContainer.querySelectorAll('.btn-adopt-diet').forEach((btn) => {
        (btn as HTMLButtonElement).onclick = () => {
          const dId = (btn as HTMLElement).dataset.diet;
          if (dId) {
            useGameStore.getState().openLifeSetDiet(dId);
            this.populateOpenLifeHub();
            this.updateHUD();
          }
        };
      });
    }

    // 3. Illnesses List
    const illnessContainer = document.getElementById('ol-illness-list');
    if (illnessContainer) {
      illnessContainer.innerHTML = '';
      const activeIllnesses = (openLifeState.activeDiseases || [])
        .map((id) => OPENLIFE_DISEASES[id])
        .filter(Boolean);

      if (activeIllnesses.length === 0) {
        illnessContainer.innerHTML = `<span class="status-clean">✨ No active ailments reported. Vital signs and mental clarity optimal!</span>`;
      } else {
        for (const ill of activeIllnesses) {
          const illRow = document.createElement('div');
          illRow.className = 'ol-illness-row';
          illRow.innerHTML = `
            <span class="ill-icon">${ill.icon}</span>
            <div class="ill-meta">
              <strong>${ill.name}</strong>
              <p>${ill.symptoms}</p>
              <small>Cure Probability: ${(ill.cureChance * 100).toFixed(0)}% · Treatment Cost: ₵${ill.treatmentCost}</small>
            </div>
            <button class="panel-btn-sm warning btn-cure-ill" data-ill="${ill.id}">Treat (₵${ill.treatmentCost})</button>
          `;
          illnessContainer.appendChild(illRow);
        }

        illnessContainer.querySelectorAll('.btn-cure-ill').forEach((btn) => {
          (btn as HTMLButtonElement).onclick = () => {
            const illId = (btn as HTMLElement).dataset.ill;
            if (illId) {
              useGameStore.getState().openLifeDoctor(illId);
              this.populateOpenLifeHub();
              this.updateHUD();
            }
          };
        });
      }
    }

    // 4. Books Dropdown
    const bookSelect = document.getElementById('ol-book-select') as HTMLSelectElement | null;
    if (bookSelect && bookSelect.options.length === 0) {
      for (const b of OPENLIFE_BOOKS) {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.title} — ${b.author} (+${b.intelBonus} Intel, +${b.happinessBonus} Happy)`;
        bookSelect.appendChild(opt);
      }
    }

    // 5. Lottery Stats
    const lottoEl = document.getElementById('ol-lottery-stats');
    if (lottoEl) {
      const tickets = openLifeState.lotteryHistory?.ticketsBought ?? 0;
      const won = openLifeState.lotteryHistory?.totalWon ?? 0;
      lottoEl.textContent = `Tickets: ${tickets} · Career Winnings: ₵${won.toLocaleString()}`;
    }

    // 6. Real Estate Marketplace
    const propsContainer = document.getElementById('ol-properties-list');
    if (propsContainer) {
      propsContainer.innerHTML = '';
      const ownedProps = openLifeState.ownedProperties || [];
      for (const prop of OPENLIFE_PROPERTIES) {
        const isOwned = ownedProps.some((p) => p.propertyId === prop.id);
        const card = document.createElement('div');
        card.className = `ol-asset-item ${isOwned ? 'owned' : ''}`;
        card.innerHTML = `
          <div class="asset-icon">${prop.icon}</div>
          <div class="asset-meta">
            <div class="asset-name-row">
              <strong>${prop.name}</strong>
              <span class="asset-price">₵${prop.price.toLocaleString()}</span>
            </div>
            <p class="asset-desc">${prop.description}</p>
            <div class="asset-tags">
              <span class="tag">Rent Offset: ₵${prop.monthlyRent}/mo</span>
              <span class="tag">Annual Growth: +${(prop.appreciationRate * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div class="asset-action">
            ${isOwned
              ? '<button class="panel-btn-sm success" disabled>Owned Residence ✓</button>'
              : `<button class="panel-btn-sm primary btn-buy-prop" data-prop="${prop.id}">Buy Property</button>`
            }
          </div>
        `;
        propsContainer.appendChild(card);
      }

      propsContainer.querySelectorAll('.btn-buy-prop').forEach((btn) => {
        (btn as HTMLButtonElement).onclick = () => {
          const pId = (btn as HTMLElement).dataset.prop;
          if (pId) {
            useGameStore.getState().openLifeBuyProperty(pId);
            this.populateOpenLifeHub();
            this.updateHUD();
          }
        };
      });
    }

    // 7. Vehicles Dealership
    const vehContainer = document.getElementById('ol-vehicles-list');
    if (vehContainer) {
      vehContainer.innerHTML = '';
      const ownedVehs = openLifeState.ownedVehicles || [];
      for (const veh of OPENLIFE_VEHICLES) {
        const isOwned = ownedVehs.some((v) => v.vehicleId === veh.id);
        const card = document.createElement('div');
        card.className = `ol-asset-item ${isOwned ? 'owned' : ''}`;
        card.innerHTML = `
          <div class="asset-icon">${veh.icon}</div>
          <div class="asset-meta">
            <div class="asset-name-row">
              <strong>${veh.name}</strong>
              <span class="asset-price">₵${veh.price.toLocaleString()}</span>
            </div>
            <div class="asset-tags">
              <span class="tag">Condition: ${veh.condition}%</span>
              <span class="tag">Maintenance: ₵${veh.runningCostPerShift}/shift</span>
              <span class="tag">Brand: ${veh.brand}</span>
            </div>
          </div>
          <div class="asset-action">
            ${isOwned
              ? '<button class="panel-btn-sm success" disabled>In Garage ✓</button>'
              : `<button class="panel-btn-sm primary btn-buy-veh" data-veh="${veh.id}">Buy Vehicle</button>`
            }
          </div>
        `;
        vehContainer.appendChild(card);
      }

      vehContainer.querySelectorAll('.btn-buy-veh').forEach((btn) => {
        (btn as HTMLButtonElement).onclick = () => {
          const vId = (btn as HTMLElement).dataset.veh;
          if (vId) {
            useGameStore.getState().openLifeBuyVehicle(vId);
            this.populateOpenLifeHub();
            this.updateHUD();
          }
        };
      });
    }

    // 8. Stocks & Crypto Investments
    let portfolioTotal = 0;
    const marketBody = document.getElementById('ol-market-table-body');
    if (marketBody) {
      marketBody.innerHTML = '';
      const assets = openLifeState.marketAssets || OPENLIFE_MARKET_ASSETS;
      const portfolio = openLifeState.portfolio || {};

      for (const stock of assets) {
        const sharesOwned = portfolio[stock.symbol] || 0;
        const valueOwned = sharesOwned * stock.price;
        portfolioTotal += valueOwned;
        const isPositive = stock.changePercent >= 0;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div class="stock-cell">
              <span class="stock-icon">${stock.icon}</span>
              <div>
                <strong>${stock.symbol}</strong>
                <div class="stock-subname">${stock.name}</div>
              </div>
            </div>
          </td>
          <td class="stock-price">₵${stock.price.toFixed(2)}</td>
          <td class="stock-change ${isPositive ? 'stock-up' : 'stock-down'}">
            ${isPositive ? '+' : ''}${stock.changePercent.toFixed(1)}%
          </td>
          <td><strong>${sharesOwned}</strong> <span class="stock-val-dim">(₵${valueOwned.toFixed(0)})</span></td>
          <td>
            <div class="stock-trade-btns">
              <button class="panel-btn-sm btn-trade-buy" data-symbol="${stock.symbol}">Buy 1</button>
              <button class="panel-btn-sm btn-trade-sell" data-symbol="${stock.symbol}" ${sharesOwned <= 0 ? 'disabled' : ''}>Sell 1</button>
            </div>
          </td>
        `;
        marketBody.appendChild(row);
      }

      const portValEl = document.getElementById('ol-portfolio-val');
      if (portValEl) {
        portValEl.textContent = `₵${portfolioTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      marketBody.querySelectorAll('.btn-trade-buy').forEach((btn) => {
        (btn as HTMLButtonElement).onclick = () => {
          const sym = (btn as HTMLElement).dataset.symbol;
          if (sym) {
            useGameStore.getState().openLifeTradeAsset(sym, 1);
            this.populateOpenLifeHub();
            this.updateHUD();
          }
        };
      });

      marketBody.querySelectorAll('.btn-trade-sell').forEach((btn) => {
        (btn as HTMLButtonElement).onclick = () => {
          const sym = (btn as HTMLElement).dataset.symbol;
          if (sym) {
            useGameStore.getState().openLifeTradeAsset(sym, -1);
            this.populateOpenLifeHub();
            this.updateHUD();
          }
        };
      });
    }

    // 9. Relationships Grid
    const relContainer = document.getElementById('ol-relationships-grid');
    if (relContainer) {
      relContainer.innerHTML = '';
      for (const rel of openLifeState.relationships) {
        const card = document.createElement('div');
        card.className = 'ol-rel-card';
        card.innerHTML = `
          <div class="rel-top">
            <span class="rel-avatar">${rel.avatar}</span>
            <div class="rel-meta">
              <strong>${rel.name}</strong>
              <span class="rel-type">${rel.relationship.toUpperCase()}</span>
            </div>
            <span class="rel-affinity-badge">${rel.affinity}% Affinity</span>
          </div>
          <div class="gauge-track sm">
            <div class="gauge-fill trust-fill" style="width: ${rel.affinity}%"></div>
          </div>
          <p class="rel-status">${rel.status}</p>
          <div class="rel-actions">
            <button class="panel-btn-sm btn-rel-act" data-rel="${rel.id}" data-act="spend_time">☕ Spend Time</button>
            <button class="panel-btn-sm btn-rel-act" data-rel="${rel.id}" data-act="compliment">💬 Compliment</button>
            <button class="panel-btn-sm btn-rel-act" data-rel="${rel.id}" data-act="chat">📱 Phone Chat</button>
          </div>
        `;
        relContainer.appendChild(card);
      }

      relContainer.querySelectorAll('.btn-rel-act').forEach((btn) => {
        (btn as HTMLButtonElement).onclick = () => {
          const rId = (btn as HTMLElement).dataset.rel;
          const act = (btn as HTMLElement).dataset.act as 'spend_time' | 'compliment' | 'chat';
          if (rId && act) {
            useGameStore.getState().openLifeRelationship(rId, act);
            this.populateOpenLifeHub();
            this.updateHUD();
          }
        };
      });
    }

    // 10. Developer Terminal Screen
    const terminalScreen = document.getElementById('ol-terminal-screen');
    if (terminalScreen) {
      terminalScreen.innerHTML = '';
      const history = openLifeState.consoleHistory || [];
      for (const item of history) {
        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        if (item.type === 'input') {
          lineEl.classList.add('cmd');
        } else if (item.type === 'error') {
          lineEl.classList.add('err');
        } else if (item.type === 'success') {
          lineEl.classList.add('suc');
        }
        lineEl.textContent = item.text;
        terminalScreen.appendChild(lineEl);
      }
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    }
  }

  public dispose(): void {
    if (this.unsubscribe) this.unsubscribe();
  }
}
