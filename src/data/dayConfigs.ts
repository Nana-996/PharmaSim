// ============================================
// PharmaSim — Day Configurations & Prescription Templates
// 5-day progression from tutorial to high-stakes
// ============================================

import { type Drug } from './drugDatabase';

export interface PatientProfile {
  name: string;
  age: number;
  gender: 'M' | 'F';
  avatar: string;
  allergies: string[];        // drug IDs patient is allergic to
  currentMedications: string[]; // drug IDs patient is currently taking
}

export interface PrescriptionTemplate {
  patient: PatientProfile;
  doctorName: string;
  prescribedDrugId: string;
  dosage: string;
  form: string;
  quantity: string;
  instructions: string;
  hasInteraction: boolean;
  interactionDrugIds: string[];  // which of the patient's current meds interact
  hasAllergyRisk: boolean;
  allergyDrugId: string;        // which allergy the prescribed drug triggers
  difficulty: 'easy' | 'medium' | 'hard';
  counselingQuestions: CounselingQuestion[];
}

export interface CounselingQuestion {
  patientQuestion: string;
  options: CounselingOption[];
}

export interface CounselingOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DayConfig {
  dayNumber: number;
  title: string;
  theme: string;
  description: string;
  focusTopics: string[];
  keyDrugIds: string[];
  prescriptions: PrescriptionTemplate[];
  quizQuestions: QuizQuestion[];
}

// =====================
// DAY 1: TUTORIAL
// =====================
const day1: DayConfig = {
  dayNumber: 1,
  title: 'Tutorial',
  theme: 'Getting Started',
  description: 'Welcome to your first day at the pharmacy! Today you\'ll learn the basics of prescription processing, drug selection, and patient counseling. Take your time — we\'ll walk you through everything.',
  focusTopics: ['Reading prescriptions', 'Selecting the correct drug', 'Basic patient counseling'],
  keyDrugIds: ['paracetamol', 'ibuprofen', 'amoxicillin'],
  prescriptions: [
    {
      patient: { name: 'Sarah Johnson', age: 34, gender: 'F', avatar: '👩', allergies: [], currentMedications: [] },
      doctorName: 'Dr. Williams',
      prescribedDrugId: 'paracetamol',
      dosage: '500mg',
      form: 'tablet',
      quantity: '20 tablets',
      instructions: 'Take 1-2 tablets every 4-6 hours as needed. Max 8 tablets per day.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'How many of these can I take in a day?',
          options: [
            { text: 'You can take up to 8 tablets (4 grams) in 24 hours. Don\'t exceed this.', isCorrect: true, feedback: 'Correct! The maximum daily dose of paracetamol is 4g. Exceeding this can cause liver damage.' },
            { text: 'Take as many as you need until the pain goes away.', isCorrect: false, feedback: 'Incorrect. Paracetamol overdose causes severe liver damage. Maximum is 4g/day.' },
            { text: 'Only take one per day.', isCorrect: false, feedback: 'Incorrect. The prescribed dose is 1-2 tablets every 4-6 hours, up to 8 per day.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Michael Chen', age: 45, gender: 'M', avatar: '👨', allergies: [], currentMedications: [] },
      doctorName: 'Dr. Patel',
      prescribedDrugId: 'ibuprofen',
      dosage: '400mg',
      form: 'tablet',
      quantity: '30 tablets',
      instructions: 'Take 1 tablet three times daily with food.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'Should I take this with food?',
          options: [
            { text: 'Yes, always take ibuprofen with food to protect your stomach.', isCorrect: true, feedback: 'Correct! NSAIDs like ibuprofen can cause stomach irritation and GI bleeding. Taking with food reduces this risk.' },
            { text: 'No, take it on an empty stomach for faster absorption.', isCorrect: false, feedback: 'Incorrect. Ibuprofen should be taken with food to reduce the risk of GI side effects.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Emma Davis', age: 28, gender: 'F', avatar: '👩‍🦰', allergies: [], currentMedications: [] },
      doctorName: 'Dr. Williams',
      prescribedDrugId: 'amoxicillin',
      dosage: '500mg',
      form: 'capsule',
      quantity: '21 capsules',
      instructions: 'Take 1 capsule three times daily for 7 days.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'I\'m feeling much better after 3 days. Can I stop taking these?',
          options: [
            { text: 'No, you must complete the full 7-day course even if you feel better. Stopping early can lead to antibiotic resistance.', isCorrect: true, feedback: 'Correct! Incomplete antibiotic courses contribute to antibiotic resistance — a global health crisis.' },
            { text: 'Sure, if you feel better, there\'s no need to continue.', isCorrect: false, feedback: 'Incorrect. Stopping antibiotics early allows surviving bacteria to develop resistance.' },
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'What is the maximum daily dose of paracetamol for adults?',
      options: ['2 grams', '4 grams', '6 grams', '8 grams'],
      correctIndex: 1,
      explanation: 'The maximum daily dose of paracetamol is 4 grams (4000mg). Exceeding this can cause severe liver damage.',
    },
    {
      question: 'Why should ibuprofen be taken with food?',
      options: ['It works faster with food', 'To reduce stomach irritation and GI bleeding risk', 'It tastes bad on an empty stomach', 'Food increases its potency'],
      correctIndex: 1,
      explanation: 'NSAIDs like ibuprofen can cause GI irritation, ulceration, and bleeding. Taking with food provides a protective buffer.',
    },
    {
      question: 'What class of antibiotic is Amoxicillin?',
      options: ['Macrolide', 'Fluoroquinolone', 'Penicillin (Beta-lactam)', 'Tetracycline'],
      correctIndex: 2,
      explanation: 'Amoxicillin is a penicillin-type (beta-lactam) antibiotic that works by inhibiting bacterial cell wall synthesis.',
    },
  ],
};

// =====================
// DAY 2: PAIN MANAGEMENT
// =====================
const day2: DayConfig = {
  dayNumber: 2,
  title: 'Pain Management',
  theme: 'Analgesics & Drug Interactions',
  description: 'Today focuses on pain medications — from OTC analgesics to prescription opioids. You\'ll encounter your first drug interaction that needs to be flagged!',
  focusTopics: ['WHO pain ladder', 'NSAID vs opioid counseling', 'Your first drug interaction check'],
  keyDrugIds: ['aspirin', 'codeine', 'diclofenac', 'warfarin'],
  prescriptions: [
    {
      patient: { name: 'Robert Martinez', age: 67, gender: 'M', avatar: '👴', allergies: [], currentMedications: ['warfarin'] },
      doctorName: 'Dr. Thompson',
      prescribedDrugId: 'aspirin',
      dosage: '300mg',
      form: 'tablet',
      quantity: '20 tablets',
      instructions: 'Take 1 tablet every 4-6 hours for headache.',
      hasInteraction: true,
      interactionDrugIds: ['warfarin'],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'medium',
      counselingQuestions: [
        {
          patientQuestion: 'Is this safe with my blood thinner?',
          options: [
            { text: 'This is a concern — aspirin with warfarin significantly increases bleeding risk. I need to contact your doctor about this.', isCorrect: true, feedback: 'Excellent! Aspirin + Warfarin is a SEVERE interaction with significantly increased bleeding risk. Always flag this.' },
            { text: 'It should be fine, aspirin is just a mild painkiller.', isCorrect: false, feedback: 'WRONG. Aspirin + Warfarin is a severe interaction. Both affect clotting and the combination greatly increases bleeding risk.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Lisa Park', age: 42, gender: 'F', avatar: '👩‍💼', allergies: [], currentMedications: [] },
      doctorName: 'Dr. Adams',
      prescribedDrugId: 'codeine',
      dosage: '30mg',
      form: 'tablet',
      quantity: '14 tablets',
      instructions: 'Take 1 tablet every 4-6 hours as needed for moderate pain.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'Can I drive while taking these?',
          options: [
            { text: 'Codeine causes drowsiness — you should not drive or operate machinery until you know how it affects you.', isCorrect: true, feedback: 'Correct! Opioids cause significant drowsiness. Patients should be warned about driving and operating machinery.' },
            { text: 'Yes, codeine is a mild painkiller and won\'t affect your driving.', isCorrect: false, feedback: 'Incorrect. Codeine is an opioid that causes drowsiness and impaired judgment. Driving is not advised.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'David Wilson', age: 55, gender: 'M', avatar: '🧔', allergies: [], currentMedications: ['lisinopril'] },
      doctorName: 'Dr. Thompson',
      prescribedDrugId: 'diclofenac',
      dosage: '50mg',
      form: 'tablet',
      quantity: '30 tablets',
      instructions: 'Take 1 tablet twice daily with food for arthritis pain.',
      hasInteraction: true,
      interactionDrugIds: ['lisinopril'],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'medium',
      counselingQuestions: [
        {
          patientQuestion: 'I also take blood pressure medication. Is that okay?',
          options: [
            { text: 'NSAIDs like diclofenac can reduce the effect of your blood pressure medication and may affect your kidneys. We should monitor this.', isCorrect: true, feedback: 'Correct! NSAIDs reduce the efficacy of ACE inhibitors and increase renal risk. Blood pressure monitoring is advised.' },
            { text: 'Don\'t worry, pain medications don\'t affect blood pressure drugs.', isCorrect: false, feedback: 'Incorrect. NSAIDs interact with many antihypertensives by reducing their effect and increasing renal risk.' },
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Aspirin + Warfarin is flagged because:',
      options: ['It makes warfarin less effective', 'Both affect blood clotting, greatly increasing bleeding risk', 'Aspirin destroys warfarin in the stomach', 'They cancel each other out'],
      correctIndex: 1,
      explanation: 'Aspirin (irreversible COX inhibitor) and Warfarin (vitamin K antagonist) both reduce clotting through different mechanisms, creating a severe bleeding risk.',
    },
    {
      question: 'Codeine is converted to which active metabolite?',
      options: ['Tramadol', 'Morphine', 'Fentanyl', 'Hydrocodone'],
      correctIndex: 1,
      explanation: 'Codeine is a prodrug metabolized by CYP2D6 to morphine, its active metabolite.',
    },
    {
      question: 'Which class of drugs can reduce the effect of ACE inhibitors like Lisinopril?',
      options: ['Antibiotics', 'Statins', 'NSAIDs', 'Antihistamines'],
      correctIndex: 2,
      explanation: 'NSAIDs reduce the antihypertensive effect of ACE inhibitors and increase the risk of renal impairment.',
    },
  ],
};

// =====================
// DAY 3: ANTIBIOTICS
// =====================
const day3: DayConfig = {
  dayNumber: 3,
  title: 'Antibiotics',
  theme: 'Infection Management & Allergies',
  description: 'Today is all about antibiotics. You\'ll encounter a patient with a penicillin allergy — be careful what you dispense! You\'ll also learn about the importance of completing antibiotic courses.',
  focusTopics: ['Antibiotic classes', 'Penicillin allergy awareness', 'Antibiotic resistance', 'Special counseling points'],
  keyDrugIds: ['ciprofloxacin', 'metronidazole', 'azithromycin', 'doxycycline'],
  prescriptions: [
    {
      patient: { name: 'James Brown', age: 38, gender: 'M', avatar: '👨‍🔬', allergies: ['amoxicillin'], currentMedications: [] },
      doctorName: 'Dr. Garcia',
      prescribedDrugId: 'amoxicillin',
      dosage: '500mg',
      form: 'capsule',
      quantity: '21 capsules',
      instructions: 'Take 1 capsule three times daily for sinusitis.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: true,
      allergyDrugId: 'amoxicillin',
      difficulty: 'medium',
      counselingQuestions: [
        {
          patientQuestion: 'I told the doctor I\'m allergic to penicillin. Is this safe?',
          options: [
            { text: 'You\'re right to be concerned! Amoxicillin IS a penicillin antibiotic. I need to contact your doctor to change this to a safe alternative.', isCorrect: true, feedback: 'Excellent catch! Amoxicillin is a penicillin-type antibiotic and is contraindicated in penicillin-allergic patients. This could cause anaphylaxis.' },
            { text: 'Amoxicillin is different from penicillin, so it should be fine.', isCorrect: false, feedback: 'DANGEROUS. Amoxicillin is a penicillin-type beta-lactam antibiotic. Cross-reactivity is high and this could be life-threatening.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Angela White', age: 31, gender: 'F', avatar: '👩‍⚕️', allergies: [], currentMedications: [] },
      doctorName: 'Dr. Garcia',
      prescribedDrugId: 'metronidazole',
      dosage: '400mg',
      form: 'tablet',
      quantity: '21 tablets',
      instructions: 'Take 1 tablet three times daily for 7 days.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'My friend\'s birthday is this weekend. Can I have some wine?',
          options: [
            { text: 'ABSOLUTELY NO alcohol with metronidazole! It causes a severe disulfiram-like reaction — vomiting, flushing, rapid heartbeat. Avoid alcohol during treatment and for 48 hours after.', isCorrect: true, feedback: 'Correct! The metronidazole-alcohol interaction is one of the most important counseling points in pharmacy. It causes a disulfiram-like reaction.' },
            { text: 'A small glass should be fine.', isCorrect: false, feedback: 'WRONG. Even small amounts of alcohol with metronidazole can cause severe nausea, vomiting, flushing, and tachycardia.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Kevin Taylor', age: 22, gender: 'M', avatar: '🧑', allergies: [], currentMedications: [] },
      doctorName: 'Dr. Patel',
      prescribedDrugId: 'doxycycline',
      dosage: '100mg',
      form: 'capsule',
      quantity: '14 capsules',
      instructions: 'Take 1 capsule twice daily for acne.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'I spend a lot of time outdoors. Anything I should know?',
          options: [
            { text: 'Yes — doxycycline causes photosensitivity. Use SPF50+ sunscreen, wear protective clothing, and avoid prolonged sun exposure.', isCorrect: true, feedback: 'Correct! Doxycycline causes significant photosensitivity. Sun protection is essential.' },
            { text: 'No special precautions needed.', isCorrect: false, feedback: 'Incorrect. Doxycycline causes photosensitivity reactions — patients can get severe sunburn.' },
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Why must patients avoid alcohol with Metronidazole?',
      options: ['It reduces the antibiotic effect', 'It causes a severe disulfiram-like reaction (vomiting, flushing, tachycardia)', 'Alcohol speeds up metabolism of the drug', 'It makes the metallic taste worse'],
      correctIndex: 1,
      explanation: 'Metronidazole inhibits aldehyde dehydrogenase, causing accumulation of acetaldehyde when alcohol is consumed — leading to severe nausea, vomiting, flushing, and tachycardia.',
    },
    {
      question: 'A patient allergic to Penicillin should NOT be given:',
      options: ['Azithromycin', 'Ciprofloxacin', 'Amoxicillin', 'Metronidazole'],
      correctIndex: 2,
      explanation: 'Amoxicillin is a penicillin-type antibiotic. Patients with penicillin allergy can have cross-reactivity and risk anaphylaxis.',
    },
    {
      question: 'What should patients do after taking doxycycline capsules?',
      options: ['Lie down immediately', 'Drink milk', 'Sit upright for at least 30 minutes with a full glass of water', 'Take an antacid'],
      correctIndex: 2,
      explanation: 'Doxycycline can cause esophageal ulceration. Patients should take it with a full glass of water and remain upright for 30 minutes.',
    },
  ],
};

// =====================
// DAY 4: CHRONIC DISEASES
// =====================
const day4: DayConfig = {
  dayNumber: 4,
  title: 'Chronic Disease',
  theme: 'Managing Long-term Conditions',
  description: 'Today brings patients with chronic conditions — diabetes, hypertension, and high cholesterol. You\'ll handle multi-drug prescriptions and counsel on medication adherence.',
  focusTopics: ['Multi-drug regimens', 'Medication adherence counseling', 'Chronic disease management', 'Lifestyle advice'],
  keyDrugIds: ['metformin', 'lisinopril', 'atorvastatin', 'amlodipine'],
  prescriptions: [
    {
      patient: { name: 'Margaret O\'Brien', age: 62, gender: 'F', avatar: '👵', allergies: [], currentMedications: ['amlodipine'] },
      doctorName: 'Dr. Wong',
      prescribedDrugId: 'metformin',
      dosage: '500mg',
      form: 'tablet',
      quantity: '60 tablets',
      instructions: 'Take 1 tablet twice daily with meals.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'Why do I get an upset stomach from this?',
          options: [
            { text: 'GI side effects are common with metformin, especially when starting. Taking it with meals helps. They usually improve after a few weeks. An extended-release formulation may be better tolerated.', isCorrect: true, feedback: 'Correct! GI side effects are the most common issue with metformin. Taking with food and gradual dose titration helps.' },
            { text: 'You might be allergic to it. Stop taking it.', isCorrect: false, feedback: 'Incorrect. GI upset is a known common side effect, not an allergy. Stopping metformin without medical advice is inappropriate.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Thomas Green', age: 58, gender: 'M', avatar: '👨‍💼', allergies: [], currentMedications: ['metformin', 'lisinopril'] },
      doctorName: 'Dr. Wong',
      prescribedDrugId: 'atorvastatin',
      dosage: '20mg',
      form: 'tablet',
      quantity: '30 tablets',
      instructions: 'Take 1 tablet daily.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'easy',
      counselingQuestions: [
        {
          patientQuestion: 'I heard I should avoid grapefruit. Is that true?',
          options: [
            { text: 'Yes! Grapefruit inhibits CYP3A4, which metabolizes atorvastatin. This can increase drug levels and risk of side effects like muscle pain.', isCorrect: true, feedback: 'Correct! Grapefruit juice inhibits CYP3A4 in the gut, increasing statin bioavailability and risk of myopathy.' },
            { text: 'That\'s just a myth, eat whatever you like.', isCorrect: false, feedback: 'Incorrect. Grapefruit-statin interaction is well-documented and clinically significant.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Helen Moore', age: 70, gender: 'F', avatar: '👩‍🦳', allergies: [], currentMedications: ['warfarin', 'amlodipine'] },
      doctorName: 'Dr. Thompson',
      prescribedDrugId: 'clarithromycin',
      dosage: '500mg',
      form: 'tablet',
      quantity: '14 tablets',
      instructions: 'Take 1 tablet twice daily for respiratory infection.',
      hasInteraction: true,
      interactionDrugIds: ['warfarin'],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'medium',
      counselingQuestions: [
        {
          patientQuestion: 'I\'m on warfarin. Should I be concerned about this antibiotic?',
          options: [
            { text: 'Yes — clarithromycin can increase warfarin levels, raising your bleeding risk. Your INR will need closer monitoring. I\'ll note this for your doctor.', isCorrect: true, feedback: 'Correct! Clarithromycin inhibits CYP3A4 and can increase warfarin levels. More frequent INR monitoring is needed.' },
            { text: 'Antibiotics don\'t interact with warfarin.', isCorrect: false, feedback: 'Incorrect. Many antibiotics interact with warfarin. Clarithromycin is a strong CYP3A4 inhibitor.' },
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Why should metformin be taken with meals?',
      options: ['It works better with food', 'To reduce common GI side effects', 'It\'s absorbed faster with fat', 'To prevent liver damage'],
      correctIndex: 1,
      explanation: 'Metformin commonly causes nausea, diarrhea, and stomach upset. Taking with meals significantly reduces these GI side effects.',
    },
    {
      question: 'What enzyme does grapefruit inhibit that affects statin metabolism?',
      options: ['CYP1A2', 'CYP2D6', 'CYP3A4', 'CYP2C19'],
      correctIndex: 2,
      explanation: 'Grapefruit contains furanocoumarins that irreversibly inhibit CYP3A4 in the intestinal wall, increasing the bioavailability of statins like atorvastatin and simvastatin.',
    },
    {
      question: 'A patient on warfarin has their INR measured regularly. What does INR monitor?',
      options: ['Blood sugar levels', 'Kidney function', 'Blood clotting time', 'Liver enzyme levels'],
      correctIndex: 2,
      explanation: 'INR (International Normalized Ratio) measures how long it takes blood to clot. Warfarin therapy aims for an INR of 2-3 for most indications.',
    },
  ],
};

// =====================
// DAY 5: HIGH STAKES
// =====================
const day5: DayConfig = {
  dayNumber: 5,
  title: 'High Stakes',
  theme: 'Complex Cases & Critical Thinking',
  description: 'Your most challenging day yet. You\'ll face dangerous drug interactions, a high-risk medication (methotrexate), and complex multi-drug patients. Stay sharp — errors today can be life-threatening.',
  focusTopics: ['High-risk medications', 'Methotrexate safety', 'Severe drug interactions', 'Critical thinking under pressure'],
  keyDrugIds: ['warfarin', 'methotrexate', 'insulin-regular', 'tramadol', 'sertraline'],
  prescriptions: [
    {
      patient: { name: 'Patricia Williams', age: 55, gender: 'F', avatar: '👩‍🏫', allergies: [], currentMedications: ['methotrexate'] },
      doctorName: 'Dr. Adams',
      prescribedDrugId: 'ibuprofen',
      dosage: '400mg',
      form: 'tablet',
      quantity: '30 tablets',
      instructions: 'Take 1 tablet three times daily for joint pain.',
      hasInteraction: true,
      interactionDrugIds: ['methotrexate'],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'hard',
      counselingQuestions: [
        {
          patientQuestion: 'I take methotrexate for my rheumatoid arthritis. Is this painkiller safe?',
          options: [
            { text: 'This is a DANGEROUS combination! NSAIDs reduce methotrexate clearance and can cause toxic accumulation. I need to contact the prescriber for an alternative — paracetamol would be safer.', isCorrect: true, feedback: 'Excellent! NSAID + Methotrexate is a severe interaction. NSAIDs reduce renal clearance of methotrexate, leading to potential bone marrow suppression and organ toxicity.' },
            { text: 'Ibuprofen is an OTC drug, so it should be safe with anything.', isCorrect: false, feedback: 'DANGEROUS. OTC status does not mean a drug is universally safe. NSAIDs + methotrexate can be fatal.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'William King', age: 48, gender: 'M', avatar: '🧔‍♂️', allergies: [], currentMedications: ['sertraline'] },
      doctorName: 'Dr. Garcia',
      prescribedDrugId: 'tramadol',
      dosage: '50mg',
      form: 'capsule',
      quantity: '20 capsules',
      instructions: 'Take 1 capsule every 6 hours as needed for back pain.',
      hasInteraction: true,
      interactionDrugIds: ['sertraline'],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'hard',
      counselingQuestions: [
        {
          patientQuestion: 'I\'m on sertraline for depression. Any issues?',
          options: [
            { text: 'Yes — tramadol with sertraline risks serotonin syndrome, a potentially life-threatening condition. Symptoms include agitation, rapid heartbeat, high temperature, and muscle rigidity. I need to discuss this with your doctor.', isCorrect: true, feedback: 'Correct! Tramadol (SNRI properties) + Sertraline (SSRI) = risk of serotonin syndrome. This is a severe interaction requiring prescriber intervention.' },
            { text: 'Pain medications and antidepressants don\'t interact.', isCorrect: false, feedback: 'WRONG. Tramadol has serotonergic properties and combining it with SSRIs can cause life-threatening serotonin syndrome.' },
          ],
        },
      ],
    },
    {
      patient: { name: 'Dorothy Adams', age: 72, gender: 'F', avatar: '👵', allergies: [], currentMedications: ['warfarin', 'atenolol'] },
      doctorName: 'Dr. Wong',
      prescribedDrugId: 'insulin-regular',
      dosage: '100 units/mL',
      form: 'injection',
      quantity: '1 vial (10mL)',
      instructions: 'Inject subcutaneously as per sliding scale before meals.',
      hasInteraction: false,
      interactionDrugIds: [],
      hasAllergyRisk: false,
      allergyDrugId: '',
      difficulty: 'hard',
      counselingQuestions: [
        {
          patientQuestion: 'I also take atenolol. My friend said that can hide low blood sugar symptoms?',
          options: [
            { text: 'Your friend is right. Beta-blockers like atenolol can mask the typical signs of hypoglycemia such as tremor and rapid heartbeat. Monitor your blood sugar more frequently and know the other signs like sweating and confusion.', isCorrect: true, feedback: 'Correct! Beta-blockers mask sympathetic hypoglycemia symptoms (tremor, tachycardia) but NOT sweating. Patients need to be aware of this.' },
            { text: 'That\'s not true, your friend is wrong.', isCorrect: false, feedback: 'Incorrect. Beta-blockers do mask hypoglycemia symptoms. This is a well-known and clinically important interaction.' },
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Methotrexate for rheumatoid arthritis is dosed:',
      options: ['Once daily', 'Twice daily', 'ONCE WEEKLY', 'Every other day'],
      correctIndex: 2,
      explanation: 'Methotrexate for RA/psoriasis is dosed ONCE WEEKLY. Accidental daily dosing has caused fatal bone marrow suppression — this is one of the most critical safety points in pharmacy.',
    },
    {
      question: 'Serotonin syndrome can occur when combining:',
      options: ['Paracetamol + Ibuprofen', 'Tramadol + SSRI (e.g., Sertraline)', 'Metformin + Insulin', 'Aspirin + Omeprazole'],
      correctIndex: 1,
      explanation: 'Serotonin syndrome occurs when serotonergic drugs are combined. Tramadol has SNRI properties, and SSRIs increase serotonin — together they can cause life-threatening serotonin excess.',
    },
    {
      question: 'How should insulin be stored before opening?',
      options: ['At room temperature', 'In the freezer', 'Refrigerated (2–8°C)', 'In a warm place'],
      correctIndex: 2,
      explanation: 'Unopened insulin should be refrigerated at 2–8°C. Once opened/in-use, it can be kept at room temperature for up to 28 days. Never freeze insulin.',
    },
  ],
};

export const dayConfigs: DayConfig[] = [day1, day2, day3, day4, day5];

export function getDayConfig(dayNumber: number): DayConfig | undefined {
  return dayConfigs.find(d => d.dayNumber === dayNumber);
}
