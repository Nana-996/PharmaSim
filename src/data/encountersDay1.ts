// ============================================
// PharmaSim — Day 1 Clinical Encounters
// Branching dialogue, patient emotions, phone interventions & consequences
// Authentic simulation roleplay without multiple-choice quiz spoiler tags
// ============================================

import { ClinicalEncounter } from '../game/lifeSimTypes';

export const day1Encounters: ClinicalEncounter[] = [
  // ------------------------------------------------------------
  // ENCOUNTER 1: Amina Bello — The Antibiotic Demand
  // ------------------------------------------------------------
  {
    id: 'enc_amina_cough',
    title: 'The Urgent Presentation',
    patientName: 'Amina Bello',
    patientAge: 23,
    patientGender: 'F',
    avatar: '👩🏾',
    portraitUrl: '/images/characters/amina.jpg',
    appearanceDescription: 'University student wearing a smart blazer, holding a bottle of water and coughing into a handkerchief.',
    backstory: 'Has a critical final-year venture capital tech pitch in 3 hours. Woke up with a painful tickle in her throat and a hacking dry cough.',
    hasPrescription: false,
    targetDrugIds: ['dextromethorphan', 'menthol-lozenges', 'paracetamol'],
    inappropriateDrugIds: ['amoxicillin', 'ciprofloxacin'],
    clinicalTakeaway: 'Acute viral bronchitis does not respond to antibiotics. Empathetic counseling on symptom management prevents antimicrobial resistance and patient GI distress.',
    initialNodeId: 'amina_start',
    dialogueNodes: {
      amina_start: {
        id: 'amina_start',
        speaker: 'Amina Bello',
        speakerTitle: 'Customer · Walk-in',
        avatar: '👩🏾',
        mood: 'worried',
        text: 'Good morning, Doc! Look, I have my venture funding pitch in exactly three hours. My throat feels like sandpaper and this cough is tearing my chest apart! Give me strong Augmentin 1g right now so I can kill whatever this is before noon!',
        options: [
          {
            id: 'opt_amina_triage',
            label: '"I understand your urgency, Amina. When did this cough start, and do you have any high fever or colored phlegm?"',
            category: 'triage',
            nextStepId: 'amina_triage_reply',
            effects: {
              focusDelta: 5,
              skillXp: { skill: 'clinicalIntuition', xp: 20 },
              notification: '+20 Clinical Intuition XP · Detailed Symptom Inquiry',
            },
          },
          {
            id: 'opt_amina_sell',
            label: '"Alright, I can sell you Augmentin right now. That will be ₵85 cash."',
            category: 'recommend_otc',
            nextStepId: 'amina_sold_antibiotic',
            effects: {
              cashBonus: 85,
              reputationDeltas: { supervisorRating: -15, boardStanding: -10 },
              stressDelta: 10,
              notification: '⚠️ Sold Prescription-Only Antibiotic Without Rx! Supervisor frowning.',
            },
          },
          {
            id: 'opt_amina_blunt_refuse',
            label: '"Augmentin is prescription only by law. We cannot sell antibiotics over the counter, sorry."',
            category: 'refusal',
            nextStepId: 'amina_angry_refusal',
            effects: {
              reputationDeltas: { patientTrust: -10 },
              stressDelta: 5,
              notification: '-10 Patient Trust · Patient felt dismissed',
            },
          },
        ],
      },

      amina_triage_reply: {
        id: 'amina_triage_reply',
        speaker: 'Amina Bello',
        speakerTitle: 'Customer · Walk-in',
        avatar: '👩🏾',
        mood: 'impatient',
        text: 'It just started yesterday afternoon! No real fever, just throat burning, runny nose, and dry coughing fits. My roommate had this last month and said Augmentin worked miracles in two days! Please doc, my entire future startup depends on this pitch!',
        options: [
          {
            id: 'opt_amina_explain_viral',
            label: '"Amina, sudden onset with runny nose and no fever is 99% a viral infection. Antibiotics cannot touch viruses—in fact, Augmentin on an empty stressed stomach will cause severe nausea and diarrhea during your pitch!"',
            category: 'clinical_counsel',
            nextStepId: 'amina_intrigued',
            effects: {
              reputationDeltas: { patientTrust: 15 },
              skillXp: { skill: 'patientCare', xp: 25 },
              notification: '+15 Patient Trust · Empathy & Rationale',
            },
          },
          {
            id: 'opt_amina_give_in',
            label: '"Well, if you insist... but don\'t tell anyone I gave you this without a doctor\'s slip."',
            category: 'recommend_otc',
            nextStepId: 'amina_sold_antibiotic',
            effects: {
              cashBonus: 85,
              reputationDeltas: { supervisorRating: -15, boardStanding: -10 },
              notification: '⚠️ Sold antibiotic against clinical judgment.',
            },
          },
        ],
      },

      amina_intrigued: {
        id: 'amina_intrigued',
        speaker: 'Amina Bello',
        speakerTitle: 'Customer · Walk-in',
        avatar: '👩🏾',
        mood: 'skeptical',
        text: 'Diarrhea during my presentation?! Oh God forbid! But Doc, if I don\'t take antibiotics, what can actually stop this coughing and soothe my vocal cords right now?',
        options: [
          {
            id: 'opt_amina_go_shelf',
            label: '"Let me pick targeted medications from our shelves: a non-drowsy cough suppressant, vocal lozenges, and an anti-inflammatory."',
            category: 'recommend_otc',
            nextStepId: 'ACTION_SHELF',
            effects: {
              focusDelta: 5,
              skillXp: { skill: 'dispensingPrecision', xp: 20 },
              notification: '📦 Heading to pharmacy shelves to select OTC cough therapy...',
            },
          },
          {
            id: 'opt_amina_triple_therapy',
            label: '"Here is non-drowsy Dextromethorphan syrup to silence the throat reflex, soothing honey-lemon anesthetic lozenges for your voice, and Paracetamol for throat inflammation. Total ₵35."',
            category: 'recommend_otc',
            nextStepId: 'amina_delighted_outcome',
            effects: {
              cashBonus: 35,
              reputationDeltas: { patientTrust: 25, supervisorRating: 20 },
              skillXp: { skill: 'communication', xp: 30 },
              energyDelta: -5,
              notification: '+25 Patient Trust · +₵35 Shift Bonus · +30 Communication XP',
            },
          },
        ],
      },

      amina_delighted_outcome: {
        id: 'amina_delighted_outcome',
        speaker: 'Amina Bello',
        speakerTitle: 'Customer · Walk-in',
        avatar: '👩🏾',
        mood: 'grateful',
        text: 'Doc, you are an absolute lifesaver! Wow, you really took time to protect me instead of just taking my money. I\'m popping a lozenge right now and heading to my pitch. Medix Pharmacy has my loyalty forever!',
        options: [
          {
            id: 'opt_amina_finish',
            label: '"All the best with your investors, Amina! Drink plenty of warm fluids!"',
            category: 'casual',
            nextStepId: 'RESOLVE_SUCCESS',
            effects: {
              reputationDeltas: { patientTrust: 10 },
              notification: '⭐ Encounter Resolved: Stellar Clinical Care',
            },
          },
        ],
      },

      amina_angry_refusal: {
        id: 'amina_angry_refusal',
        speaker: 'Amina Bello',
        speakerTitle: 'Customer · Walk-in',
        avatar: '👩🏾',
        mood: 'angry',
        text: 'Unbelievable! You community pharmacists act like gatekeepers instead of helping sick people. I will just walk two blocks down to the corner chemist who actually cares!',
        options: [
          {
            id: 'opt_amina_finish_bad',
            label: '"I\'m sorry you feel that way. Good day."',
            category: 'casual',
            nextStepId: 'RESOLVE_FAIL',
            effects: {
              stressDelta: 10,
              notification: '❌ Patient stormed out frustrated.',
            },
          },
        ],
      },

      amina_sold_antibiotic: {
        id: 'amina_sold_antibiotic',
        speaker: 'Pharm. Kemi',
        speakerTitle: 'Senior Colleague / Supervisor',
        avatar: '👩🏾‍💼',
        portraitUrl: '/images/characters/kemi.jpg',
        mood: 'worried',
        text: 'Tobi... I saw you hand over that pack of Augmentin for a viral sore throat. Not only is that illegal without an Rx, but AMR is exploding in this city. Please maintain our clinical ethics.',
        options: [
          {
            id: 'opt_amina_admit_fault',
            label: '"You\'re right, Kemi. I let her panic sway me. It won\'t happen again."',
            category: 'casual',
            nextStepId: 'RESOLVE_COMPROMISE',
            effects: {
              reputationDeltas: { supervisorRating: 5 },
            },
          },
        ],
      },
    },
  },

  // ------------------------------------------------------------
  // ENCOUNTER 2: Papa Adeleke — Polypharmacy Chelation Clash
  // ------------------------------------------------------------
  {
    id: 'enc_adeleke_cipro',
    title: 'The Retired Principal\'s Supplements',
    patientName: 'Papa Adeleke',
    patientAge: 68,
    patientGender: 'M',
    avatar: '👴🏾',
    portraitUrl: '/images/characters/adeleke.jpg',
    appearanceDescription: 'Dignified elderly gentleman in a traditional embroidered tunic and round reading glasses, holding an Apex Clinic envelope.',
    backstory: 'Diagnosed with a persistent complicated UTI by Dr. Mensah. Came to fill his prescription.',
    hasPrescription: true,
    prescribedDrugId: 'ciprofloxacin',
    targetDrugIds: ['ciprofloxacin'],
    prescriptionImageOrText: 'Rx: Ciprofloxacin 500mg Tablets\nSig: 1 tab BD x 10 days\nPrescriber: Dr. Mensah, Apex Clinic',
    prescriptionSlipData: {
      clinicName: 'APEX MEDICAL CLINIC',
      clinicAddress: '14 Marina Boulevard, Victoria Island, Lagos',
      prescriberName: 'Dr. K. Mensah, MBChB, FWACP',
      prescriberTitle: 'Senior Consultant Physician · Family Medicine',
      prescriberLicense: 'MDC-NG-48291-EXP2027',
      patientName: 'Papa Adeleke',
      patientAge: 68,
      date: 'Today',
      rxItems: [
        {
          drugId: 'ciprofloxacin',
          drugName: 'Ciprofloxacin 500mg Tablets',
          dosage: '500mg',
          frequency: 'One tablet twice daily (12 hours apart)',
          duration: '10 days',
          quantity: '20 tablets',
        },
      ],
      stampStatus: 'verified_official',
      stampText: 'APEX MEDICAL CLINIC · OFFICIAL PRESCRIBER SEAL · LICENSED',
      isForged: false,
    },
    clinicalTakeaway: 'Fluoroquinolones (Ciprofloxacin) form insoluble chelates with polyvalent cations (Iron, Calcium, Magnesium, Aluminium). Must space dosing by at least 2 hours before or 6 hours after.',
    initialNodeId: 'adeleke_start',
    dialogueNodes: {
      adeleke_start: {
        id: 'adeleke_start',
        speaker: 'Papa Adeleke',
        speakerTitle: 'Patient · Regular',
        avatar: '👴🏾',
        mood: 'neutral',
        text: 'Good day, Pharmacist. Dr. Mensah wrote this prescription for my urinary problem. He said it\'s a very powerful medication that will clear it up quickly. Can you dispense it for me, my son?',
        options: [
          {
            id: 'opt_adeleke_inspect_rx',
            label: '"Welcome, Papa Adeleke! Let me first inspect Dr. Mensah\'s prescription slip carefully."',
            category: 'triage',
            nextStepId: 'ACTION_INSPECT_RX',
            effects: {
              focusDelta: 5,
              skillXp: { skill: 'clinicalIntuition', xp: 15 },
              notification: '📄 Inspecting physical prescription slip on workstation desk...',
            },
          },
          {
            id: 'opt_adeleke_review_meds',
            label: '"Welcome, Papa! Before I prepare this, are you taking any other routine medicines, herbal remedies, or daily supplements?"',
            category: 'triage',
            nextStepId: 'adeleke_supplements_reveal',
            effects: {
              skillXp: { skill: 'clinicalIntuition', xp: 25 },
              notification: '+25 Clinical Intuition XP · Detailed Med Review',
            },
          },
          {
            id: 'opt_adeleke_quick_dispense',
            label: '"Certainly, Papa. Ciprofloxacin 500mg, one tablet twice daily. That will be ₵45."',
            category: 'dispense_rx',
            nextStepId: 'adeleke_missed_interaction',
            effects: {
              cashBonus: 45,
              reputationDeltas: { patientTrust: 5, supervisorRating: -10 },
              notification: '⚠️ Dispensed without asking about concurrent medications.',
            },
          },
        ],
      },

      adeleke_supplements_reveal: {
        id: 'adeleke_supplements_reveal',
        speaker: 'Papa Adeleke',
        speakerTitle: 'Patient · Regular',
        avatar: '👴🏾',
        mood: 'relieved',
        text: 'Ah, good question! My daughter is a nurse in London, she sent me high-dose Ferrous Sulphate (Iron) for my blood and Chewable Calcium-Magnesium antacids for my arthritis and stomach gas. I take them religiously with every single meal three times a day.',
        options: [
          {
            id: 'opt_adeleke_counsel_chelation',
            label: '"Papa, thank goodness we checked! The iron and calcium act like magnets to Ciprofloxacin in your gut. They bind together and prevent the antibiotic from absorbing—making it completely useless against the infection!"',
            category: 'clinical_counsel',
            nextStepId: 'adeleke_spacing_instructions',
            effects: {
              reputationDeltas: { patientTrust: 25, supervisorRating: 20 },
              skillXp: { skill: 'patientCare', xp: 35 },
              notification: '+25 Patient Trust · Major Drug Interaction Prevented! ⭐',
            },
          },
          {
            id: 'opt_adeleke_shelf_cipro',
            label: '"Let me pull your Ciprofloxacin 500mg from our shelves and attach a specialized 2-hour spacing label."',
            category: 'dispense_rx',
            nextStepId: 'ACTION_SHELF',
            effects: {
              skillXp: { skill: 'dispensingPrecision', xp: 25 },
              notification: '📦 Moving to antibiotic shelf to retrieve Ciprofloxacin 500mg...',
            },
          },
        ],
      },

      adeleke_spacing_instructions: {
        id: 'adeleke_spacing_instructions',
        speaker: 'Papa Adeleke',
        speakerTitle: 'Patient · Regular',
        avatar: '👴🏾',
        mood: 'worried',
        text: 'Heavens! I would have taken them together and thought the doctor gave me fake medicine! What should I do, my son? Must I stop my daughter\'s supplements?',
        options: [
          {
            id: 'opt_adeleke_give_schedule',
            label: '"No need to stop, Papa. Just use the 2-hour rule: Take your Ciprofloxacin 2 hours BEFORE your iron/calcium, or wait at least 4-6 hours AFTER. Let me write a clear schedule on this card for you."',
            category: 'clinical_counsel',
            nextStepId: 'adeleke_delighted',
            effects: {
              reputationDeltas: { patientTrust: 20, doctorRespect: 10 },
              skillXp: { skill: 'dispensingPrecision', xp: 20 },
              cashBonus: 45,
              notification: '+₵45 Dispensing Revenue · +20 Dispensing XP',
            },
          },
        ],
      },

      adeleke_delighted: {
        id: 'adeleke_delighted',
        speaker: 'Papa Adeleke',
        speakerTitle: 'Patient · Regular',
        avatar: '👴🏾',
        mood: 'grateful',
        text: 'God will bless your education and your career, young man. Dr. Mensah was in such a hurry he never even asked about my supplements. I will tell all my retired colleagues to bring their prescriptions to you!',
        options: [
          {
            id: 'opt_adeleke_finish',
            label: '"It\'s my duty to keep you safe, Papa. Drink plenty of water and feel better soon!"',
            category: 'casual',
            nextStepId: 'RESOLVE_SUCCESS',
            effects: {
              reputationDeltas: { patientTrust: 10 },
              notification: '⭐ Encounter Resolved: Flawless Polypharmacy Counseling',
            },
          },
        ],
      },

      adeleke_missed_interaction: {
        id: 'adeleke_missed_interaction',
        speaker: 'Papa Adeleke',
        speakerTitle: 'Patient · Regular',
        avatar: '👴🏾',
        mood: 'neutral',
        text: 'Thank you, pharmacist. I will swallow these with my midday iron pills and calcium tonic.',
        options: [
          {
            id: 'opt_adeleke_finish_bad',
            label: '"Have a good day, sir."',
            category: 'casual',
            nextStepId: 'RESOLVE_FAIL',
            effects: {
              reputationDeltas: { patientTrust: -5 },
              notification: '⚠️ Patient will experience chelation failure at home.',
            },
          },
        ],
      },
    },
  },

  // ------------------------------------------------------------
  // ENCOUNTER 3: Chidi Okafor — The Controlled Substance Forgery
  // ------------------------------------------------------------
  {
    id: 'enc_chidi_codeine',
    title: 'The Agitated Executive',
    patientName: 'Chidi Okafor',
    patientAge: 38,
    patientGender: 'M',
    avatar: '👨🏾‍💼',
    portraitUrl: '/images/characters/chidi.jpg',
    appearanceDescription: 'Sharply dressed businessman in a charcoal suit, glancing nervously at his gold wristwatch and pacing back and forth.',
    backstory: 'Insisting on buying 3 bottles of Codeine cough syrup and Diazepam 10mg using a suspiciously crumpled hospital slip.',
    hasPrescription: true,
    prescriptionImageOrText: 'Suspicious Slip: "Apex General"\nRx: Codeine Linctus x 3 bottles\nRx: Diazepam 10mg tabs #30\nSigned: Dr. Okon (Illegible stamp, missing council registration number)',
    prescriptionSlipData: {
      clinicName: 'APEX GENERAL HEALTH CENTRE',
      clinicAddress: 'Casualty Ward B, Central Metropolis',
      prescriberName: 'Dr. Okon',
      prescriberTitle: 'Medical Officer',
      prescriberLicense: 'MD-999-UNVERIFIED',
      patientName: 'Chidi Okafor',
      patientAge: 38,
      date: 'Today',
      rxItems: [
        {
          drugId: 'codeine',
          drugName: 'Codeine Linctus 15mg/5ml Syrup',
          dosage: '100ml bottle',
          frequency: 'As directed for cough',
          duration: 'PRN',
          quantity: '3 bottles (300ml total)',
        },
        {
          drugId: 'diazepam',
          drugName: 'Diazepam 10mg Tablets',
          dosage: '10mg',
          frequency: 'Take 1 tablet at night for anxiety',
          duration: '30 days',
          quantity: '30 tablets',
        },
      ],
      stampStatus: 'suspicious_forgery',
      stampText: 'APEX GEN HOSP · CASUALTY WARD (SMUDGED / ILLEGIBLE)',
      isForged: true,
      forgeryClues: [
        'Prescriber license number MD-999-UNVERIFIED is invalid (official licenses begin with MDC-NG)',
        'Excessive quantity of Schedule II narcotic (3 bottles of Codeine)',
        'Clinic stamp is heavily smudged and missing official registrar signature seal',
        'Crumpled sheet torn from hospital pad without serial watermark',
      ],
    },
    clinicalTakeaway: 'Controlled substances require rigorous prescription scrutiny. Verifying by phoning the prescriber prevents illegal diversion and protects pharmacy licensure.',
    initialNodeId: 'chidi_start',
    doctorPhoneCall: {
      doctorName: 'Dr. Okon',
      clinicName: 'Apex General Health Centre',
      reason: 'Verify suspicious controlled substance prescription',
      initialNodeId: 'phone_start',
      dialogueNodes: {
        phone_start: {
          id: 'phone_start',
          speaker: 'Clinic Receptionist',
          speakerTitle: 'Apex General Reception',
          avatar: '📞',
          mood: 'neutral',
          text: 'Apex General Health Centre, good morning. How may I direct your call?',
          options: [
            {
              id: 'opt_phone_doctor',
              label: '"Good morning, this is Pharm. Tobi from Medix Community Pharmacy. May I urgently speak with Dr. Okon regarding a controlled substance prescription presented at our counter?"',
              category: 'casual',
              nextStepId: 'phone_doctor_connected',
            },
          ],
        },
        phone_doctor_connected: {
          id: 'phone_doctor_connected',
          speaker: 'Dr. Okon',
          speakerTitle: 'Senior Medical Officer · Apex General',
          avatar: '👨🏾‍⚕️',
          mood: 'neutral',
          text: 'Hello, Pharmacist. Yes, what prescription are you querying? I have surgery in five minutes.',
          options: [
            {
              id: 'opt_phone_verify_details',
              label: '"Dr. Okon, I have a gentleman named Chidi Okafor presenting an Apex slip for 3 bottles of Codeine Linctus and 30 tablets of Diazepam 10mg dated today. Did your team issue this?"',
              category: 'clinical_counsel',
              nextStepId: 'phone_doctor_alarmed',
            },
          ],
        },
        phone_doctor_alarmed: {
          id: 'phone_doctor_alarmed',
          speaker: 'Dr. Okon',
          speakerTitle: 'Senior Medical Officer · Apex General',
          avatar: '👨🏾‍⚕️',
          mood: 'angry',
          text: 'Absolutely not! Someone stole a prescription pad from our casualty ward last week! Do NOT dispense that. Please record his details and decline immediately. Excellent vigilance, Pharmacist!',
          options: [
            {
              id: 'opt_phone_finish',
              label: '"Understood, Dr. Okon. I will refuse the dispense and log the incident into our registry. Thank you for your swift confirmation."',
              category: 'casual',
              nextStepId: 'RESOLVE_SUCCESS',
              effects: {
                reputationDeltas: { doctorRespect: 25, boardStanding: 20 },
                skillXp: { skill: 'communication', xp: 35 },
                notification: '+25 Doctor Respect · Prescription Pad Forgery Confirmed! 🚨',
              },
            },
          ],
        },
      },
    },
    dialogueNodes: {
      chidi_start: {
        id: 'chidi_start',
        speaker: 'Chidi Okafor',
        speakerTitle: 'Customer · Pacing Counter',
        avatar: '👨🏾‍💼',
        mood: 'impatient',
        text: 'Look, young pharmacist, I am in an insane rush. My flight to Abuja leaves in ninety minutes. Here is the doctor\'s note. Pack three bottles of Codeine cough syrup and a box of Valium (Diazepam 10mg). Don\'t bother with receipts, just bill me double on card!',
        options: [
          {
            id: 'opt_chidi_inspect',
            label: '"Let me examine this prescription slip first, sir. Controlled medicines require strict verification."',
            category: 'triage',
            nextStepId: 'ACTION_INSPECT_RX',
            effects: {
              focusDelta: 10,
              skillXp: { skill: 'clinicalIntuition', xp: 20 },
              notification: '📄 Inspecting physical paper prescription on counter desk...',
            },
          },
          {
            id: 'opt_chidi_succumb_bribe',
            label: '"Double payment? Well... if you\'re running for a flight, that will be ₵280 cash."',
            category: 'dispense_rx',
            nextStepId: 'chidi_illegal_sale',
            effects: {
              cashBonus: 280,
              reputationDeltas: { supervisorRating: -40, boardStanding: -50 },
              stressDelta: 30,
              notification: '🚨 Severe Violation: Dispensed Forged Controlled Substance!',
            },
          },
        ],
      },

      chidi_scrutiny: {
        id: 'chidi_scrutiny',
        speaker: 'Chidi Okafor',
        speakerTitle: 'Customer · Pacing Counter',
        avatar: '👨🏾‍💼',
        mood: 'skeptical',
        text: 'Verify what?! Are you doubting me? I know the owner of this pharmacy chain personally! Are you going to waste my time or hand over my medication?',
        options: [
          {
            id: 'opt_chidi_phone_doctor',
            label: '"The law requires telephone verification with the clinic for Schedule II narcotics before dispensing. I am dialing Dr. Okon\'s desk right now."',
            category: 'phone_doctor',
            nextStepId: 'chidi_after_call',
            effects: {
              skillXp: { skill: 'communication', xp: 25 },
              notification: '📞 Placing call to Apex General Clinic...',
            },
          },
          {
            id: 'opt_chidi_firm_refusal',
            label: '"Sir, this paper is missing the prescriber\'s official Council registration and clinic serial stamp. Under Pharmacy Council regulations, I cannot dispense controlled sedatives on this slip."',
            category: 'refusal',
            nextStepId: 'chidi_confrontation_handled',
            effects: {
              reputationDeltas: { supervisorRating: 25, boardStanding: 20 },
              skillXp: { skill: 'businessAcumen', xp: 25 },
              notification: '+25 Supervisor Rating · Protected Pharmacy License',
            },
          },
        ],
      },

      chidi_after_call: {
        id: 'chidi_after_call',
        speaker: 'Chidi Okafor',
        speakerTitle: 'Customer · Agitated',
        avatar: '👨🏾‍💼',
        mood: 'angry',
        text: 'You\'re actually calling the clinic?! You know what, forget it! You people are completely incompetent!',
        options: [
          {
            id: 'opt_chidi_stand_firm',
            label: '"Dr. Okon confirmed this prescription pad was stolen from casualty. Sir, I am logging this into the National Narcotics Register as required by law."',
            category: 'clinical_counsel',
            nextStepId: 'chidi_flees',
            effects: {
              reputationDeltas: { supervisorRating: 30, boardStanding: 25 },
              stressDelta: -10,
              notification: '⭐ Regulatory Compliance Hero: Incident Logged Cleanly',
            },
          },
        ],
      },

      chidi_flees: {
        id: 'chidi_flees',
        speaker: 'Pharm. Kemi',
        speakerTitle: 'Senior Colleague / Supervisor',
        avatar: '👩🏾‍💼',
        portraitUrl: '/images/characters/kemi.jpg',
        mood: 'grateful',
        text: 'He snatched his keys and ran out to his car! Tobi, that was magnificent. You kept your cool under intense pressure and protected our license from a massive regulatory raid. The owner will hear about your stellar conduct today!',
        options: [
          {
            id: 'opt_kemi_praise_finish',
            label: '"Thank you, Kemi! That\'s why we took the pharmacist\'s oath."',
            category: 'casual',
            nextStepId: 'RESOLVE_SUCCESS',
            effects: {
              reputationDeltas: { supervisorRating: 15 },
              notification: '🏆 Day 1 Shift Completed with Clinical Honors!',
            },
          },
        ],
      },

      chidi_confrontation_handled: {
        id: 'chidi_confrontation_handled',
        speaker: 'Chidi Okafor',
        speakerTitle: 'Customer · Agitated',
        avatar: '👨🏾‍💼',
        mood: 'angry',
        text: 'Ridiculous bureaucracy! I will take my money where customer service is respected!',
        options: [
          {
            id: 'opt_chidi_finish_refusal',
            label: '"That is your right, sir. Have a safe flight."',
            category: 'casual',
            nextStepId: 'RESOLVE_SUCCESS',
            effects: {
              reputationDeltas: { supervisorRating: 20, boardStanding: 20 },
              notification: '⭐ Dangerous diversion prevented. Professional license protected.',
            },
          },
        ],
      },

      chidi_illegal_sale: {
        id: 'chidi_illegal_sale',
        speaker: 'Pharm. Kemi',
        speakerTitle: 'Senior Colleague / Supervisor',
        avatar: '👩🏾‍💼',
        portraitUrl: '/images/characters/kemi.jpg',
        mood: 'angry',
        text: 'Tobi!! What did you just do?! You sold 3 bottles of Codeine and 30 Valium to a walk-in for quick cash?! Do you realize narcotics taskforce raids pharmacies for exactly this?! If the Pharmacy Council audits our register, we will lose our operating license!',
        options: [
          {
            id: 'opt_chidi_guilt',
            label: '"I... I panicked because he offered double cash. I am so sorry, Kemi."',
            category: 'casual',
            nextStepId: 'RESOLVE_FAIL',
            effects: {
              reputationDeltas: { supervisorRating: -25, boardStanding: -40 },
              stressDelta: 35,
              notification: '🚨 Severe disciplinary strike placed on your employment record.',
            },
          },
        ],
      },
    },
  },
];
