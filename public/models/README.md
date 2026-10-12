# 3D Character Models Guide for PharmaSim

This folder (`public/models/`) is where you can drop **real 3D cartoon animated characters** (`.glb` or `.gltf` format). 

PharmaSim will automatically detect and load these models with full skeletal animations, lighting, shadows, and counter height scaling.

---

## 📁 Model File Slots

| Filename | Used For | Recommended Animations |
| :--- | :--- | :--- |
| `pharmacist.glb` | **Player Character** (The Pharmacist) | `idle`, `walk` (or `run`) |
| `patient.glb` | **Default Patient NPC** | `walk`, `idle` (or `talk`, `wave`) |
| `patient_female.glb` | Female Patient NPC (Optional) | `walk`, `idle`, `talk` |
| `patient_male.glb` | Male Patient NPC (Optional) | `walk`, `idle`, `talk` |
| `patient_elder.glb` | Elderly Patient NPC (Optional) | `walk`, `idle`, `talk` |

> [!NOTE]
> If a file is not present in this folder, PharmaSim automatically displays the built-in stylized cartoon character with articulated walking and idle animations.

---

## 🎨 Where to Get 100% Free Unique Cartoon Characters

### 1. Quaternius (Recommended for Cartoon / Low-Poly Style)
- **Website**: [quaternius.com](https://quaternius.com/)
- **License**: CC0 (100% Free, Public Domain)
- **Packs to look for**:
  - *Modular Characters Pack* (Dozens of stylized outfits, hairs, faces)
  - *Casual Citizens Pack*
  - *Hospital / Medical Characters*
- Pre-packaged with skeletal animations (`Walk`, `Idle`, `Run`, `Wave`) directly in `.glb` / `.gltf`!

### 2. Mixamo by Adobe (Free High-Quality Characters & Animations)
- **Website**: [mixamo.com](https://www.mixamo.com/) (Requires a free Adobe login)
- **How it works**:
  1. Pick a character (e.g. *Remy*, *Claire*, *Malcolm*, or stylized cartoon characters).
  2. Search for the **"Walking"** animation and download as `FBX for Unity` or `FBX` with skin.
  3. Search for the **"Idle"** animation and download.
  4. Search for **"Talking"** or **"Waving"** animation.
  5. Convert to `.glb` using [Blender](https://www.blender.org/) (File > Import FBX > Export glTF/glb) or an online tool like [gltf.report](https://gltf.report/).
  6. Rename to `pharmacist.glb` or `patient.glb` and drop it right into this folder!

### 3. Kenney.nl (CC0 Animated Characters)
- **Website**: [kenney.nl/assets?q=animated+characters](https://kenney.nl/assets?q=animated+characters)
- Cute cartoon characters with walking and idle animations ready for web games.

### 4. AI 3D Generators (Create 100% Custom Characters from Text/Images)
You can generate unique 3D characters in under 1 minute:
- **[Meshy.ai](https://www.meshy.ai/)**: Enter a prompt like *"Stylized 3D cartoon pharmacist woman with round glasses and teal doctor coat, game asset"* and download the rigged `.glb`.
- **[Tripo3D.ai](https://www.tripo3d.ai/)**: Upload any 2D cartoon drawing or sketch to convert it into a 3D `.glb` model.

---

## ⚙️ How Animations Are Mapped
PharmaSim's `CharacterManager` automatically scans animation clip names inside your `.glb` file:
- **Walking**: Matches clips named `walk`, `run`, `walking`, `move`, or `trot`.
- **Idle**: Matches clips named `idle`, `breath`, `stay`, or `stand`.
- **Talking / Gesturing**: Matches clips named `talk`, `counsel`, `gesture`, or `wave`.
