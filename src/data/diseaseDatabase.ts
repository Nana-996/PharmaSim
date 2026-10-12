// ============================================
// PharmaSim — Disease Database
// Common diseases linked to drug treatments
// ============================================

export interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  commonTreatments: string[];   // drug IDs
  otcOptions: string[];         // drug IDs for OTC recommendations
  referralRequired: boolean;
  description: string;
  category: string;
}

export const diseaseDatabase: Disease[] = [
  {
    id: 'common-cold',
    name: 'Common Cold',
    symptoms: ['Runny nose', 'Sore throat', 'Sneezing', 'Mild cough', 'Low-grade fever'],
    commonTreatments: ['paracetamol', 'chlorpheniramine'],
    otcOptions: ['paracetamol', 'loratadine', 'cetirizine'],
    referralRequired: false,
    description: 'A viral upper respiratory tract infection. Self-limiting, usually resolves in 7-10 days.',
    category: 'Respiratory',
  },
  {
    id: 'bacterial-pharyngitis',
    name: 'Bacterial Pharyngitis (Strep Throat)',
    symptoms: ['Severe sore throat', 'Fever', 'Swollen tonsils', 'Difficulty swallowing'],
    commonTreatments: ['amoxicillin', 'azithromycin', 'paracetamol'],
    otcOptions: ['paracetamol'],
    referralRequired: false,
    description: 'Bacterial infection of the pharynx, commonly Group A Streptococcus. Requires antibiotic therapy.',
    category: 'Infectious',
  },
  {
    id: 'uti',
    name: 'Urinary Tract Infection (UTI)',
    symptoms: ['Painful urination', 'Frequent urination', 'Lower abdominal pain', 'Cloudy urine'],
    commonTreatments: ['ciprofloxacin', 'amoxicillin'],
    otcOptions: [],
    referralRequired: false,
    description: 'Bacterial infection of the urinary tract. Requires antibiotic treatment.',
    category: 'Infectious',
  },
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    symptoms: ['Usually asymptomatic', 'Headache (severe cases)', 'Nosebleeds', 'Shortness of breath'],
    commonTreatments: ['lisinopril', 'amlodipine', 'losartan', 'atenolol'],
    otcOptions: [],
    referralRequired: true,
    description: 'Persistently elevated blood pressure. Major risk factor for cardiovascular disease, stroke, and kidney disease.',
    category: 'Cardiovascular',
  },
  {
    id: 'type2-diabetes',
    name: 'Type 2 Diabetes Mellitus',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow wound healing'],
    commonTreatments: ['metformin', 'glibenclamide', 'insulin-regular'],
    otcOptions: [],
    referralRequired: true,
    description: 'Chronic metabolic disorder characterized by insulin resistance and relative insulin deficiency.',
    category: 'Endocrine',
  },
  {
    id: 'allergic-rhinitis',
    name: 'Allergic Rhinitis (Hay Fever)',
    symptoms: ['Sneezing', 'Runny/itchy nose', 'Watery eyes', 'Nasal congestion'],
    commonTreatments: ['cetirizine', 'loratadine', 'beclomethasone'],
    otcOptions: ['cetirizine', 'loratadine'],
    referralRequired: false,
    description: 'Inflammation of the nasal passages due to allergens (pollen, dust, pet dander).',
    category: 'Respiratory',
  },
  {
    id: 'asthma',
    name: 'Asthma',
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Cough (especially at night)'],
    commonTreatments: ['salbutamol', 'beclomethasone', 'prednisolone'],
    otcOptions: [],
    referralRequired: true,
    description: 'Chronic inflammatory airway disease with reversible airflow obstruction and bronchial hyperresponsiveness.',
    category: 'Respiratory',
  },
  {
    id: 'gerd',
    name: 'GERD (Gastroesophageal Reflux Disease)',
    symptoms: ['Heartburn', 'Acid regurgitation', 'Chest pain', 'Difficulty swallowing'],
    commonTreatments: ['omeprazole', 'pantoprazole'],
    otcOptions: ['omeprazole'],
    referralRequired: false,
    description: 'Chronic acid reflux where stomach acid flows back into the esophagus.',
    category: 'Gastrointestinal',
  },
  {
    id: 'peptic-ulcer',
    name: 'Peptic Ulcer Disease',
    symptoms: ['Burning stomach pain', 'Nausea', 'Bloating', 'Heartburn'],
    commonTreatments: ['omeprazole', 'amoxicillin', 'clarithromycin', 'metronidazole'],
    otcOptions: [],
    referralRequired: true,
    description: 'Ulcers in the stomach or duodenum, often caused by H. pylori or NSAID use.',
    category: 'Gastrointestinal',
  },
  {
    id: 'depression',
    name: 'Major Depressive Disorder',
    symptoms: ['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep disturbance', 'Appetite changes', 'Difficulty concentrating'],
    commonTreatments: ['sertraline', 'fluoxetine'],
    otcOptions: [],
    referralRequired: true,
    description: 'A mood disorder causing persistent feelings of sadness and loss of interest.',
    category: 'Mental Health',
  },
  {
    id: 'hypercholesterolemia',
    name: 'Hypercholesterolemia (High Cholesterol)',
    symptoms: ['Usually asymptomatic', 'Xanthomas (in severe cases)'],
    commonTreatments: ['atorvastatin', 'simvastatin'],
    otcOptions: [],
    referralRequired: true,
    description: 'Elevated blood cholesterol levels, increasing cardiovascular disease risk.',
    category: 'Cardiovascular',
  },
  {
    id: 'dvt',
    name: 'Deep Vein Thrombosis / Pulmonary Embolism',
    symptoms: ['Leg swelling', 'Leg pain', 'Warm/red skin', 'Shortness of breath (PE)'],
    commonTreatments: ['warfarin'],
    otcOptions: [],
    referralRequired: true,
    description: 'Blood clot in deep veins (usually legs) that can embolize to the lungs.',
    category: 'Cardiovascular',
  },
  {
    id: 'acute-diarrhea',
    name: 'Acute Diarrhea',
    symptoms: ['Frequent loose stools', 'Abdominal cramps', 'Nausea', 'Dehydration'],
    commonTreatments: ['loperamide', 'oral-rehydration-salts'],
    otcOptions: ['loperamide', 'oral-rehydration-salts'],
    referralRequired: false,
    description: 'Frequent passage of loose or watery stools. Usually self-limiting but rehydration is key.',
    category: 'Gastrointestinal',
  },
  {
    id: 'rheumatoid-arthritis',
    name: 'Rheumatoid Arthritis',
    symptoms: ['Joint pain and swelling', 'Morning stiffness >30 min', 'Fatigue', 'Symmetrical joint involvement'],
    commonTreatments: ['methotrexate', 'prednisolone', 'ibuprofen', 'diclofenac'],
    otcOptions: ['ibuprofen'],
    referralRequired: true,
    description: 'Chronic autoimmune inflammatory disease primarily affecting joints.',
    category: 'Musculoskeletal',
  },
  {
    id: 'moderate-pain',
    name: 'Moderate Pain (Post-surgical / Injury)',
    symptoms: ['Pain rated 4-6/10', 'Difficulty with daily activities'],
    commonTreatments: ['paracetamol', 'codeine', 'tramadol', 'ibuprofen'],
    otcOptions: ['paracetamol', 'ibuprofen'],
    referralRequired: false,
    description: 'Moderate pain requiring step-2 analgesics on the WHO pain ladder.',
    category: 'Pain',
  },
];

export function getDiseaseById(id: string): Disease | undefined {
  return diseaseDatabase.find(d => d.id === id);
}

export function searchDiseases(query: string): Disease[] {
  const q = query.toLowerCase();
  return diseaseDatabase.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.symptoms.some(s => s.toLowerCase().includes(q)) ||
    d.category.toLowerCase().includes(q)
  );
}
