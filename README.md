# PharmaSim 3D — Clinical Practice & Life Simulator RPG ℞

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-r170-black?logo=three.js)

**PharmaSim** is an interactive 3D clinical pharmacy simulator and life RPG. Balance demanding daily shifts behind the counter, protect patients from dangerous drug clashes, manage your rent deadlines, and build wealth and vitality through the integrated **OpenLife** life-simulation engine.

---

## ✨ Features

### 🏥 3D Clinical Pharmacy Workstation
- **Photorealistic Lighting**: ACES Filmic Tone Mapping, soft shadows, warm recessed ceiling LED panels, and illuminated walnut slat backwall with glowing neon cross.
- **Stocked Medicine Shelves**: 3-bay modular shelving stocked with branded pharmaceutical cartons (*Augmentin, Ciprofloxacin, Amoxicillin, Metformin, Paracetamol, Inhalers*), elixir jars, and clinical counter monitor.
- **Metropolis Cityscape**: Floor-to-ceiling glass panoramic windows looking out onto high-rise skyscrapers, streetlights, and city trees.
- **Clinical Encounters**: Tactile prescription slip inspection, prescriber telephone verification hotline, barcode scanner alert, auxiliary warning stickers, and POS register checkout.
- **BNF Formulary**: Interactive British National Formulary with mechanism of action, indications, contraindications, and drug-drug interaction checker.

### 🌍 OpenLife Life Simulator Hub (BitLife-Inspired)
- **Vitality Gauges**: Real-time tracking of Health, Happiness, Intel, Looks, Karma, and Fame.
- **Diets & Nutrition**: Adopt dietary plans (*Balanced Home Cooking, Mediterranean, Vegan, Fast Food, Coffee & Donut*) that alter daily shifts, vitality, and expenses.
- **Apex Medical Clinic**: Treat illness with Dr. Okon (*Common Cold, Shift Anxiety, Depression, Hypertension, Burnout*).
- **Metro Fitness Gym**: Workout sessions that boost physical health and looks while slashing stress.
- **Public Library & BNF Books**: Read clinical texts and literature to level up intellect and clinical diagnostic precision.
- **Real Estate & Garage**: Buy residential properties (*Studio, Duplex, Waterfront Villa, Sky Penthouse*) to eliminate monthly rent, and purchase vehicles (*Sedan, EV, Luxury C-Class*).
- **Stock & Crypto Exchange**: Trade live assets (*PHRM, BIO, MEDX, VN500 ETF, BTC, ETH*).
- **God-Mode Developer Console**: Built-in CLI shell supporting `cheats`, `maxstat`, `money <amt>`, `diet <name>`, `cure`, and `stat` commands.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3.10+](https://www.python.org/) *(optional, for standalone OpenLife CLI)*

### Installation
```bash
# Clone repository
git clone https://github.com/<your-username>/PharmSim.git
cd PharmSim

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🛠️ Build & Deployment

### Production Build
```bash
npm run build
```
The compiled static assets will be output to the `dist/` directory.

### Deploying to Vercel
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your **PharmSim** GitHub repository.
4. Framework Preset: **Vite**
5. Root Directory: `./`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Click **Deploy**!

---

## ⌨️ Controls
- <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> — Move pharmacist behind counter
- <kbd>L</kbd> — Toggle OpenLife Life Simulator Hub
- <kbd>R</kbd> — Open BNF Drug Reference Formulary
- <kbd>Esc</kbd> — Close active modal or menu
- **Mouse Click** — Interact with counter, prescription slip, telephone, shelves, and patient

---

## 📄 License
MIT License.
