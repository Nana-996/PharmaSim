// ============================================
// PharmaSim — Character & 3D Animation Manager
// High-Quality Stylized Character Rigs with Procedural Textures & Props
// ============================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type CharacterActionType = 'idle' | 'walk' | 'talk' | 'wave';
export type CharacterType = 'pharmacist' | 'amina' | 'adeleke' | 'chidi' | 'kemi' | 'generic';

export interface CharacterConfig {
  modelUrl?: string;
  name: string;
  characterType?: CharacterType;
  targetHeight?: number;
  isNpc?: boolean;
  avatarEmoji?: string;
  colors?: {
    skin?: number;
    hair?: number;
    clothes?: number;
    accent?: number;
    pants?: number;
  };
}

export class CharacterInstance {
  public root: THREE.Group;
  public isMoving = false;
  public currentAction: CharacterActionType = 'idle';

  private gltfModel: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Partial<Record<CharacterActionType, THREE.AnimationAction>> = {};
  
  // Procedural stylized cartoon rig
  private proceduralRig: THREE.Group | null = null;
  private leftLeg: THREE.Group | null = null;
  private rightLeg: THREE.Group | null = null;
  private leftArm: THREE.Group | null = null;
  private rightArm: THREE.Group | null = null;
  private head: THREE.Group | null = null;
  private torso: THREE.Group | null = null;
  private walkPhase = 0;
  private breathPhase = 0;
  private talkPhase = 0;

  private targetHeight = 1.7;
  private isGLBLoaded = false;

  constructor(private config: CharacterConfig) {
    this.root = new THREE.Group();
    this.root.name = `character_${config.name}`;
    this.targetHeight = config.targetHeight || 1.7;

    // 1. Build the stylized character rig with rich textures
    this.buildStylizedProceduralRig();

    // 2. Attempt to load external GLB model if specified
    if (config.modelUrl) {
      this.loadGLB(config.modelUrl);
    }
  }

  // === GLTF/GLB LOADER ===
  public loadGLB(url: string): void {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (this.proceduralRig) {
          this.root.remove(this.proceduralRig);
          this.proceduralRig = null;
        }

        this.gltfModel = gltf.scene;
        this.gltfModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Apply character-specific materials & cultural attire styling
            if (mesh.material) {
              const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
              if (origMat.map) {
                // If model has authentic UV textures (face, eyes, uniform), preserve them with high quality
                origMat.roughness = Math.min(0.65, origMat.roughness || 0.5);
                mesh.material = origMat;
              } else {
                const isJoint = mesh.name.toLowerCase().includes('joint') || origMat.name?.toLowerCase().includes('joint');
                const cType = this.config.characterType;

                if (cType === 'pharmacist' || this.config.name.includes('pharmacist')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: isJoint ? 0x0f766e : 0xf8fafc,
                    roughness: isJoint ? 0.45 : 0.35,
                    metalness: 0.05,
                  });
                } else if (cType === 'amina') {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: isJoint ? 0xd97706 : 0x1e3a5f,
                    roughness: 0.55,
                    metalness: 0.1,
                  });
                } else if (cType === 'adeleke') {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: isJoint ? 0xd4af37 : 0xfcf8ee,
                    roughness: isJoint ? 0.3 : 0.7,
                    metalness: isJoint ? 0.6 : 0.05,
                  });
                } else if (cType === 'chidi') {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: isJoint ? 0x991b1b : 0x1e293b,
                    roughness: 0.45,
                    metalness: 0.15,
                  });
                } else {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: isJoint ? 0x3b82f6 : 0x334155,
                    roughness: 0.5,
                  });
                }
              }
            }
          }
        });

        const box = new THREE.Box3().setFromObject(this.gltfModel);
        const size = box.getSize(new THREE.Vector3());
        const scale = this.targetHeight / (size.y || 1);
        this.gltfModel.scale.set(scale, scale, scale);

        const updatedBox = new THREE.Box3().setFromObject(this.gltfModel);
        this.gltfModel.position.y = -updatedBox.min.y;

        this.root.add(this.gltfModel);

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.gltfModel);
          this.mapAnimations(gltf.animations);
        }

        this.isGLBLoaded = true;
        this.setAction(this.currentAction);
      },
      undefined,
      () => {
        // Fallback remains active seamlessly
      }
    );
  }

  private mapAnimations(clips: THREE.AnimationClip[]): void {
    if (!this.mixer) return;

    for (const clip of clips) {
      const lower = clip.name.toLowerCase();
      let actionType: CharacterActionType | null = null;

      if (lower.includes('walk') && !lower.includes('run')) {
        actionType = 'walk';
      } else if (lower.includes('idle')) {
        actionType = 'idle';
      } else if (lower.includes('agree') || lower.includes('talk') || lower.includes('speak') || lower.includes('counsel')) {
        actionType = 'talk';
      } else if (lower.includes('headshake') || lower.includes('wave') || lower.includes('gesture')) {
        actionType = 'wave';
      }

      if (actionType && !this.actions[actionType]) {
        const act = this.mixer.clipAction(clip);
        act.setLoop(THREE.LoopRepeat, Infinity);
        this.actions[actionType] = act;
      }
    }

    if (!this.actions.idle && clips.length > 0) {
      this.actions.idle = this.mixer.clipAction(clips[0]);
    }
  }

  public setAction(action: CharacterActionType, fadeDuration = 0.25): void {
    if (this.currentAction === action && this.actions[action]?.isRunning()) return;

    const prevAction = this.actions[this.currentAction];
    const newAction = this.actions[action] || this.actions.idle;

    if (newAction) {
      if (prevAction && prevAction !== newAction) {
        prevAction.fadeOut(fadeDuration);
      }
      newAction.reset().fadeIn(fadeDuration).play();
    }

    this.currentAction = action;
  }

  public update(delta: number): void {
    if (this.isGLBLoaded && this.mixer) {
      this.mixer.update(delta);
    } else if (this.proceduralRig) {
      this.updateProceduralAnimation(delta);
    }
  }

  // === PROCEDURAL CANVAS TEXTURE FACTORY ===
  private createFabricTexture(type: 'coat' | 'blazer' | 'agbada' | 'suit'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (type === 'coat') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 492, 492);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(256, 0); ctx.lineTo(256, 512);
      ctx.stroke();
      for (let y = 140; y < 480; y += 90) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(256, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 150, 110, 120);
      ctx.strokeRect(80, 150, 110, 120);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(95, 130, 10, 35);
      ctx.fillStyle = '#0f766e';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('TOBI · RX', 95, 230);
    } else if (type === 'agbada') {
      ctx.fillStyle = '#fcf8ee';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(120, 0); ctx.lineTo(256, 320); ctx.lineTo(392, 0);
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#b8860b';
      ctx.strokeRect(160, 160, 192, 192);
      ctx.fillStyle = '#d4af37';
      for (let x = 80; x <= 432; x += 110) {
        for (let y = 350; y <= 480; y += 90) {
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'suit') {
      ctx.fillStyle = '#23272d';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 512; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
      }
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(232, 0); ctx.lineTo(280, 0); ctx.lineTo(266, 380); ctx.lineTo(256, 420); ctx.lineTo(246, 380);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(238, 190, 36, 8);
    } else if (type === 'blazer') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(180, 0); ctx.lineTo(332, 0); ctx.lineTo(256, 260);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(256, 320, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(256, 410, 9, 0, Math.PI * 2); ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // === HIGH-QUALITY PROCEDURAL STYLIZED RIG ===
  private buildStylizedProceduralRig(): void {
    const isNpc = this.config.isNpc ?? false;
    let charType: CharacterType = this.config.characterType || (isNpc ? 'generic' : 'pharmacist');

    if (this.config.name.toLowerCase().includes('amina')) charType = 'amina';
    else if (this.config.name.toLowerCase().includes('adeleke')) charType = 'adeleke';
    else if (this.config.name.toLowerCase().includes('chidi')) charType = 'chidi';
    else if (this.config.name.toLowerCase().includes('kemi')) charType = 'kemi';
    else if (this.config.name.toLowerCase().includes('pharmacist')) charType = 'pharmacist';

    // Skin tones
    let skinHex = 0x5a341d;
    let hairHex = 0x1f1712;
    let pantsHex = 0x1e293b;
    let fabricType: 'coat' | 'blazer' | 'agbada' | 'suit' = 'coat';

    if (charType === 'pharmacist' || charType === 'kemi') {
      skinHex = 0x4a2c1a;
      pantsHex = 0x134e4a;
      fabricType = 'coat';
    } else if (charType === 'amina') {
      skinHex = 0x5c351f;
      pantsHex = 0x1e293b;
      fabricType = 'blazer';
    } else if (charType === 'adeleke') {
      skinHex = 0x402514;
      hairHex = 0xd1d5db; // Silver-gray hair/beard
      pantsHex = 0xfcf8ee;
      fabricType = 'agbada';
    } else if (charType === 'chidi') {
      skinHex = 0x462817;
      pantsHex = 0x22262a;
      fabricType = 'suit';
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsHex, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });

    const torsoTexture = this.createFabricTexture(fabricType);
    const bodyMat = new THREE.MeshStandardMaterial({
      map: torsoTexture,
      roughness: 0.7,
    });

    const rig = new THREE.Group();
    this.proceduralRig = rig;

    this.buildContactShadow(rig, 0.46);

    // --- LEGS ---
    const legLength = 0.64;
    const legRadius = 0.088;

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.13, 0.64, 0);
    const leftPants = new THREE.Mesh(
      new THREE.CylinderGeometry(legRadius, legRadius * 0.88, legLength, 14),
      pantsMat
    );
    leftPants.position.y = -legLength / 2;
    leftPants.castShadow = true;
    this.leftLeg.add(leftPants);

    const leftShoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.09, 0.25),
      shoeMat
    );
    leftShoe.position.set(0, -legLength + 0.045, 0.05);
    leftShoe.castShadow = true;
    this.leftLeg.add(leftShoe);
    rig.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.13, 0.64, 0);
    const rightPants = new THREE.Mesh(
      new THREE.CylinderGeometry(legRadius, legRadius * 0.88, legLength, 14),
      pantsMat
    );
    rightPants.position.y = -legLength / 2;
    rightPants.castShadow = true;
    this.rightLeg.add(rightPants);

    const rightShoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.09, 0.25),
      shoeMat
    );
    rightShoe.position.set(0, -legLength + 0.045, 0.05);
    rightShoe.castShadow = true;
    this.rightLeg.add(rightShoe);
    rig.add(this.rightLeg);

    // --- TORSO ---
    this.torso = new THREE.Group();
    this.torso.position.y = 0.64;

    const bodyHeight = 0.60;
    const bodyGeo = new THREE.CylinderGeometry(0.28, 0.32, bodyHeight, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = bodyHeight / 2;
    bodyMesh.castShadow = true;
    this.torso.add(bodyMesh);

    // Pharmacist coat hem & stethoscope
    if (charType === 'pharmacist' || charType === 'kemi') {
      const coatHem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.38, 0.34, 16),
        bodyMat
      );
      coatHem.position.y = 0.08;
      coatHem.castShadow = true;
      this.torso.add(coatHem);

      const stethGeo = new THREE.TorusGeometry(0.19, 0.016, 8, 24, Math.PI * 1.2);
      const stethMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 });
      const steth = new THREE.Mesh(stethGeo, stethMat);
      steth.rotation.x = Math.PI / 2 + 0.2;
      steth.rotation.z = -0.1;
      steth.position.set(0, bodyHeight + 0.01, 0.04);
      this.torso.add(steth);

      const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), goldMat);
      bell.position.set(0.08, bodyHeight * 0.65, 0.28);
      bell.rotation.x = Math.PI / 2;
      this.torso.add(bell);
    } else if (charType === 'adeleke') {
      // Flared wide agbada shoulders/sleeves
      const agbadaCape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.46, 0.45, 16),
        bodyMat
      );
      agbadaCape.position.y = bodyHeight * 0.55;
      agbadaCape.castShadow = true;
      this.torso.add(agbadaCape);
    }

    rig.add(this.torso);

    // --- ARMS ---
    const armLength = 0.52;
    const armRadius = 0.068;

    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.36, 0.64 + bodyHeight - 0.06, 0);
    const leftArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(armRadius, armRadius * 0.85, armLength, 12),
      bodyMat
    );
    leftArmMesh.position.y = -armLength / 2;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), skinMat);
    leftHand.position.y = -armLength - 0.02;
    this.leftArm.add(leftHand);

    // Chidi's Gold Watch on Left Wrist
    if (charType === 'chidi') {
      const watch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.025, 12),
        goldMat
      );
      watch.position.y = -armLength + 0.02;
      this.leftArm.add(watch);
    }

    rig.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.36, 0.64 + bodyHeight - 0.06, 0);
    const rightArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(armRadius, armRadius * 0.85, armLength, 12),
      bodyMat
    );
    rightArmMesh.position.y = -armLength / 2;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), skinMat);
    rightHand.position.y = -armLength - 0.02;
    this.rightArm.add(rightHand);

    // Character specific hand props
    if (charType === 'pharmacist') {
      // Medical clipboard in right hand
      const clipboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.22, 0.015),
        new THREE.MeshStandardMaterial({ color: 0x854d0e })
      );
      clipboard.position.set(0.04, -armLength - 0.08, 0.08);
      clipboard.rotation.x = Math.PI / 4;
      this.rightArm.add(clipboard);
    } else if (charType === 'adeleke') {
      // Clinic prescription envelope
      const envelope = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.18, 0.01),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7 })
      );
      envelope.position.set(0.03, -armLength - 0.06, 0.07);
      envelope.rotation.x = Math.PI / 4;
      this.rightArm.add(envelope);
    } else if (charType === 'amina') {
      // White handkerchief
      const hankie = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      hankie.position.set(0.03, -armLength - 0.04, 0.04);
      this.rightArm.add(hankie);
    }

    rig.add(this.rightArm);

    // --- HEAD & FACE ---
    this.head = new THREE.Group();
    this.head.position.set(0, 0.64 + bodyHeight + 0.1, 0);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.12, 12), skinMat);
    neck.position.y = 0.05;
    this.head.add(neck);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), skinMat);
    headMesh.scale.set(1.0, 1.1, 1.0);
    headMesh.position.y = 0.28;
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Expressive stylized eyes
    for (const sx of [-0.09, 0.09]) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), eyeWhiteMat);
      eyeWhite.scale.set(0.9, 1.15, 0.5);
      eyeWhite.position.set(sx, 0.3, 0.21);
      this.head.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), pupilMat);
      pupil.position.set(sx * 1.02, 0.3, 0.235);
      this.head.add(pupil);

      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyeWhiteMat);
      shine.position.set(sx + 0.015, 0.32, 0.25);
      this.head.add(shine);

      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.018, 0.02),
        hairMat
      );
      brow.position.set(sx, 0.38, 0.21);
      brow.rotation.z = sx > 0 ? -0.1 : 0.1;
      this.head.add(brow);
    }

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), skinMat);
    nose.position.set(0, 0.24, 0.25);
    this.head.add(nose);

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.045, 0.012, 8, 14, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0x8b3a3a })
    );
    smile.rotation.x = Math.PI;
    smile.position.set(0, 0.17, 0.23);
    this.head.add(smile);

    // Headwear & Hair by character
    if (charType === 'adeleke') {
      // Traditional embroidered Fila cap
      const fila = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.24, 0.14, 16),
        bodyMat
      );
      fila.position.set(0, 0.44, 0.02);
      fila.rotation.z = 0.08;
      this.head.add(fila);

      // Silver-gray mustache and beard
      const beard = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        hairMat
      );
      beard.scale.set(1.2, 0.8, 0.6);
      beard.position.set(0, 0.14, 0.22);
      this.head.add(beard);

      // Gold wireframe reading glasses
      for (const gx of [-0.09, 0.09]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 8, 20), goldMat);
        rim.position.set(gx, 0.3, 0.24);
        this.head.add(rim);
      }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.008), goldMat);
      bridge.position.set(0, 0.3, 0.25);
      this.head.add(bridge);
    } else if (charType === 'amina') {
      // Neat braided updo with gold cuffs
      const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), hairMat);
      hairBun.position.set(0, 0.34, -0.04);
      this.head.add(hairBun);

      const topBun = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.15, 12), hairMat);
      topBun.position.set(0, 0.48, -0.02);
      this.head.add(topBun);

      // Gold hoop earrings
      for (const ex of [-0.25, 0.25]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 8, 16), goldMat);
        hoop.position.set(ex, 0.24, 0.04);
        hoop.rotation.y = Math.PI / 2;
        this.head.add(hoop);
      }
    } else if (charType === 'chidi') {
      // Modern fade haircut
      const fadeHair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), hairMat);
      fadeHair.scale.set(1.02, 1.02, 1.04);
      fadeHair.position.set(0, 0.33, -0.02);
      this.head.add(fadeHair);

      // Groomed beard
      const chidiBeard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.15, 0.12, 12),
        hairMat
      );
      chidiBeard.position.set(0, 0.18, 0.18);
      chidiBeard.scale.set(1, 0.5, 0.8);
      this.head.add(chidiBeard);
    } else {
      // Pharmacist Tobi
      const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), hairMat);
      hairCap.scale.set(1.02, 1.02, 1.04);
      hairCap.position.set(0, 0.32, -0.02);
      this.head.add(hairCap);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3 });
      for (const gx of [-0.09, 0.09]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 20), frameMat);
        rim.position.set(gx, 0.3, 0.23);
        this.head.add(rim);
      }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.01), frameMat);
      bridge.position.set(0, 0.3, 0.24);
      this.head.add(bridge);
    }

    rig.add(this.head);

    this.root.add(rig);
  }

  // === PROCEDURAL ANIMATIONS ===
  private updateProceduralAnimation(delta: number): void {
    if (!this.leftLeg || !this.rightLeg || !this.leftArm || !this.rightArm || !this.torso || !this.head) {
      return;
    }

    if (this.isMoving || this.currentAction === 'walk') {
      this.walkPhase += delta * 9.5;

      const legSwing = Math.sin(this.walkPhase) * 0.55;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      const armSwing = Math.sin(this.walkPhase) * 0.45;
      this.leftArm.rotation.x = -armSwing;
      this.rightArm.rotation.x = armSwing;
      this.leftArm.rotation.z = 0.1;
      this.rightArm.rotation.z = -0.1;

      const bob = Math.abs(Math.sin(this.walkPhase * 2)) * 0.05;
      this.torso.position.y = 0.64 + bob;
      this.torso.rotation.y = Math.sin(this.walkPhase) * 0.08;
      this.head.position.y = 0.64 + 0.60 + 0.1 + bob * 0.8;
      this.head.rotation.z = Math.sin(this.walkPhase) * 0.03;
    } else {
      this.breathPhase += delta * 2.2;
      const breath = Math.sin(this.breathPhase);

      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, delta * 8);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, delta * 8);

      this.torso.position.y = 0.64 + breath * 0.015;
      this.torso.scale.set(1 + breath * 0.012, 1 + breath * 0.01, 1 + breath * 0.012);

      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0.05 + breath * 0.04, delta * 6);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0.05 + breath * 0.04, delta * 6);
      this.leftArm.rotation.z = 0.12 + breath * 0.02;
      this.rightArm.rotation.z = -0.12 - breath * 0.02;

      this.head.position.y = 0.64 + 0.60 + 0.1 + breath * 0.012;
      this.head.rotation.x = breath * 0.02;

      if (this.currentAction === 'talk') {
        this.talkPhase += delta * 5.0;
        this.rightArm.rotation.x = -0.4 + Math.sin(this.talkPhase) * 0.25;
        this.rightArm.rotation.z = -0.3 + Math.cos(this.talkPhase * 0.7) * 0.15;
        this.head.rotation.y = Math.sin(this.talkPhase * 0.8) * 0.12;
        this.head.rotation.x = Math.abs(Math.sin(this.talkPhase * 1.4)) * 0.1;
      }
    }
  }

  private buildContactShadow(parent: THREE.Object3D, radius: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.15)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2, radius * 2),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.012;
    mesh.name = 'cartoonContactShadow';
    parent.add(mesh);
  }
}
