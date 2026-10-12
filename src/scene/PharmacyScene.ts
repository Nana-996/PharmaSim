// ============================================
// PharmaSim — 3D Pharmacy Scene
// Soft-daylight modern pharmacy
// ============================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { audioManager } from '../audio/AudioManager';
import { CharacterInstance, CharacterType } from './CharacterManager';

const C = {
  porcelain: 0xebe4da,
  grout: 0xcfc7bb,
  wallUpper: 0xf0f2ef,
  wallLower: 0xb8c4bc,
  wallTrim: 0x9aab9f,
  ceiling: 0xf9f7f3,
  walnut: 0x5c3a22,
  walnutLight: 0x7a5232,
  walnutDark: 0x3d2414,
  quartz: 0xfaf8f4,
  shelfWood: 0xcbb896,
  shelfFrame: 0x6e5a42,
  teal: 0x0d7a70,
  tealSoft: 0x1a9e90,
  metal: 0x9aa3a8,
  glass: 0xd8e4e2,
  leaf: 0x3d8b5a,
  leafDark: 0x2f6b45,
  pot: 0xb8956e,
  skin: 0xe8c4a8,
  skinWarm: 0xd4a574,
  coat: 0xf5f2eb,
  scrub: 0x0d9488,
  hairBrown: 0x3d2c1e,
  hairGray: 0x8a9095,
  chair: 0x6d8f80,
  warmLight: 0xfff3e2,
};

export class PharmacyScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;

  private characterGroup: THREE.Group;
  private playerCharacter!: CharacterInstance;
  private characterSpeed = 4.0;
  private characterRotation = 0;
  private isMoving = false;
  private keys: Record<string, boolean> = {};

  private cameraTarget: THREE.Vector3;
  private cameraOffset: THREE.Vector3;

  private interactiveObjects: THREE.Object3D[] = [];
  private hoveredObject: THREE.Object3D | null = null;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  private readonly BOUNDS = { minX: -6.2, maxX: 6.2, minZ: -4.6, maxZ: 4.8 };

  private npcGroup: THREE.Group | null = null;
  private patientNpc: CharacterInstance | null = null;
  private npcVisible = false;
  private npcTargetPos: THREE.Vector3 = new THREE.Vector3();
  private npcAnimPhase = 0;
  private isConsultationMode = false;

  public onShelfClick: (() => void) | null = null;
  public onCounterClick: (() => void) | null = null;
  public onPatientClick: (() => void) | null = null;

  private clock: THREE.Clock;
  private animationId = 0;
  private matCache = new Map<string, THREE.MeshStandardMaterial>();
  private highlightMats = new Map<THREE.Object3D, THREE.Material>();

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f6f9);
    this.scene.fog = new THREE.Fog(0xf0f6f9, 32, 70);

    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
    this.cameraTarget = new THREE.Vector3(0, 1.05, -0.6);
    this.cameraOffset = new THREE.Vector3(1.9, 2.35, 3.9);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = env.texture;
    (this.scene as any).environmentIntensity = 0.78;
    pmrem.dispose();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.18,
      0.5,
      0.95
    );
    this.composer.addPass(bloom);
    this.composer.addPass(new OutputPass());

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();

    this.buildLighting();
    this.buildArchitecture();
    this.buildCounter();
    this.buildShelves();
    this.buildWaitingArea();
    this.buildDecorations();
    this.buildAtmosphere();

    this.playerCharacter = new CharacterInstance({
      name: 'pharmacist',
      characterType: 'pharmacist',
      modelUrl: '/models/pharmacist.glb',
      isNpc: false,
    });
    this.characterGroup = this.playerCharacter.root;
    this.characterGroup.position.set(0, 0, -2.2);
    this.scene.add(this.characterGroup);

    this.setupEvents();
    window.addEventListener('resize', this.onResize);
  }

  private mat(key: string, params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
    let m = this.matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial(params);
      this.matCache.set(key, m);
    }
    return m;
  }

  private canvasTexture(
    w: number,
    h: number,
    draw: (ctx: CanvasRenderingContext2D) => void
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    draw(ctx);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  // === LIGHTING ===
  private buildLighting(): void {
    const ambient = new THREE.AmbientLight(0xfffaee, 0.62);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xe4f4ff, 0xdfd6c8, 0.82);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff2dc, 2.85);
    key.position.set(7.5, 11, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 32;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    key.shadow.bias = -0.00025;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 2.5;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xdcf0fa, 0.65);
    fill.position.set(-8, 8, -2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xf2f7ff, 0.75);
    rim.position.set(1, 5, -9);
    this.scene.add(rim);

    // Warm LED recessed ceiling light fixtures (distributed across pharmacy)
    const panelPositions: [number, number][] = [
      [-3.4, -1.8],
      [0, -1.8],
      [3.4, -1.8],
      [-3.4, 1.8],
      [0, 1.8],
      [3.4, 1.8],
    ];
    for (const [x, z] of panelPositions) {
      const pLight = new THREE.PointLight(0xfff3e2, 0.55, 9, 1.5);
      pLight.position.set(x, 4.45, z);
      this.scene.add(pLight);

      const fixture = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.04, 0.72),
        this.mat(`panel_${x}_${z}`, {
          color: 0xfffaf4,
          emissive: 0xffeed8,
          emissiveIntensity: 1.1,
          roughness: 0.25,
        })
      );
      fixture.position.set(x, 4.75, z);
      this.scene.add(fixture);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.78, 0.035, 0.84),
        this.mat('panelFrame', { color: 0xd4d0c8, roughness: 0.45, metalness: 0.25 })
      );
      frame.position.set(x, 4.76, z);
      this.scene.add(frame);
    }

    // Emerald & Medical Teal accent lighting behind counter shelves
    const accent = new THREE.PointLight(0x0d9488, 1.1, 7.5, 1.6);
    accent.position.set(0, 2.8, -4.8);
    this.scene.add(accent);

    const streetSpill = new THREE.PointLight(0xe8f4ff, 0.85, 9, 1.4);
    streetSpill.position.set(-6.5, 3.2, 0);
    this.scene.add(streetSpill);
  }

  // === ARCHITECTURE ===
  private buildArchitecture(): void {
    const size = 16;
    const tile = 2.0;
    const floorGroup = new THREE.Group();
    const tileMat = this.mat('tile', {
      color: 0xf5f0e8,
      roughness: 0.22,
      metalness: 0.05,
      envMapIntensity: 0.95,
    });

    for (let ix = 0; ix < size / tile; ix++) {
      for (let iz = 0; iz < size / tile; iz++) {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(tile - 0.025, tile - 0.025), tileMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(-size / 2 + ix * tile + tile / 2, 0, -size / 2 + iz * tile + tile / 2);
        mesh.receiveShadow = true;
        floorGroup.add(mesh);
      }
    }
    this.scene.add(floorGroup);

    const base = new THREE.Mesh(
      new THREE.PlaneGeometry(size + 0.4, size + 0.4),
      this.mat('grout', { color: 0xd2c9bd, roughness: 0.8 })
    );
    base.rotation.x = -Math.PI / 2;
    base.position.y = -0.004;
    base.receiveShadow = true;
    this.scene.add(base);

    // Dispensary Back Wall: Modern Walnut Acoustic Slats + Glowing Teal Lightwall
    const backWallGroup = new THREE.Group();

    // Dark walnut background backing
    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(16, 5.0, 0.16),
      this.mat('backPanel', { color: 0x362517, roughness: 0.55 })
    );
    backPanel.position.set(0, 2.5, -6);
    backPanel.receiveShadow = true;
    backWallGroup.add(backPanel);

    // Vertical acoustic walnut slats across the dispensary back wall
    const slatMat = this.mat('woodSlat', { color: 0x543924, roughness: 0.45 });
    for (let x = -7.6; x <= 7.6; x += 0.35) {
      if (Math.abs(x) < 2.9) continue; // Center features illuminated dispensary lightwall
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.8, 0.04), slatMat);
      slat.position.set(x, 2.5, -5.9);
      slat.castShadow = true;
      backWallGroup.add(slat);
    }

    // Center Illuminated Frosted Medical Lightwall
    const centerGlow = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 4.5, 0.06),
      this.mat('centerGlow', {
        color: 0x0f766e,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      })
    );
    centerGlow.position.set(0, 2.6, -5.92);
    backWallGroup.add(centerGlow);

    // Bronze trim framing center lightwall
    const bronzeFrame = this.mat('bronzeFrame', { color: 0xb5925a, metalness: 0.7, roughness: 0.3 });
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.08, 0.08), bronzeFrame);
    topTrim.position.set(0, 4.85, -5.88);
    backWallGroup.add(topTrim);
    const btmTrim = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.08, 0.08), bronzeFrame);
    btmTrim.position.set(0, 0.35, -5.88);
    backWallGroup.add(btmTrim);

    this.scene.add(backWallGroup);

    // Right Wall
    const wallUpper = this.mat('wallUpper', { color: 0xf4f7f5, roughness: 0.85 });
    const wallLower = this.mat('wallLower', { color: 0xb4c5bd, roughness: 0.65 });
    const trim = this.mat('trim', { color: 0x93a89e, roughness: 0.45, metalness: 0.1 });

    const upperR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 12), wallUpper);
    upperR.position.set(8, 3.5, 0);
    upperR.receiveShadow = true;
    this.scene.add(upperR);

    const lowerR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.7, 12), wallLower);
    lowerR.position.set(7.97, 0.85, 0);
    lowerR.receiveShadow = true;
    this.scene.add(lowerR);

    const tR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 12), trim);
    tR.position.set(7.96, 1.72, 0);
    this.scene.add(tR);

    // Left Wall: Large Panoramic Glass Windows facing Metropolis City Street
    this.buildCityWindows(-1);

    // Front Wall / Entrance
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5, 0.16), wallUpper);
    frontL.position.set(-5.25, 2.5, 6);
    this.scene.add(frontL);
    const frontR = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5, 0.16), wallUpper);
    frontR.position.set(5.25, 2.5, 6);
    this.scene.add(frontR);
    const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 0.16), wallUpper);
    doorHeader.position.set(0, 4.5, 6);
    this.scene.add(doorHeader);

    const doorFrame = this.mat('doorFrame', { color: 0x3d4742, roughness: 0.4, metalness: 0.45 });
    for (const dx of [-2.5, 2.5]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 0.22), doorFrame);
      post.position.set(dx, 2.5, 5.95);
      this.scene.add(post);
    }
    const headerBar = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.12, 0.22), doorFrame);
    headerBar.position.set(0, 4.95, 5.95);
    this.scene.add(headerBar);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 12),
      this.mat('ceiling', { color: 0xfcfbfa, roughness: 0.95 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.95;
    this.scene.add(ceiling);

    this.buildSign();
  }

  // === CITY WINDOWS & METROPOLIS SKYLINE ===
  private buildCityWindows(side: number): void {
    const g = new THREE.Group();

    // 3 Large floor-to-ceiling panoramic window bays
    const zBays = [-3.0, 0, 3.0];
    const frameMat = this.mat('winFrame', { color: 0x36413c, roughness: 0.35, metalness: 0.55 });
    const glassMat = this.mat('panoramicGlass', {
      color: 0xe6f4fa,
      emissive: 0xd0ebf8,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.65,
    });

    for (const z of zBays) {
      // Glass pane
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.8, 2.6), glassMat);
      glass.position.set(0, 2.2, z);
      g.add(glass);

      // Frame top and bottom
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 2.7), frameMat);
      top.position.set(0, 4.1, z);
      g.add(top);
      const btm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 2.7), frameMat);
      btm.position.set(0, 0.3, z);
      g.add(btm);

      // Mullions
      for (const dz of [-1.35, 1.35]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.9, 0.1), frameMat);
        post.position.set(0, 2.2, z + dz);
        g.add(post);
      }
      const midMullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 0.06), frameMat);
      midMullion.position.set(0, 2.2, z);
      g.add(midMullion);

      // Diagonal sunlight shaft streaming onto the pharmacy floor
      const shaft = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 4.5),
        this.mat(`sunShaft_${z}`, {
          color: 0xfff6e4,
          transparent: true,
          opacity: 0.18,
          roughness: 1,
          depthWrite: false,
        })
      );
      shaft.rotation.x = -Math.PI / 2;
      shaft.rotation.z = side > 0 ? -0.4 : 0.4;
      shaft.position.set(side * 5.6, 0.015, z);
      this.scene.add(shaft);
    }

    g.position.set(side * 7.94, 0, 0);
    this.scene.add(g);

    // --- 3D METROPOLIS CITY BACKDROP OUTSIDE WINDOWS ---
    const cityGroup = new THREE.Group();

    // Sky gradient backdrop
    const skyGeo = new THREE.PlaneGeometry(36, 18);
    const skyMat = this.mat('skyMat', {
      color: 0x93c5fd,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.45,
      roughness: 0.9,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.rotation.y = Math.PI / 2;
    skyMesh.position.set(-18, 9, 0);
    cityGroup.add(skyMesh);

    // Metropolis Skyscraper Towers
    const towerConfigs = [
      { x: -14, z: -7, w: 3.2, d: 3.5, h: 16, color: 0x334155, glow: 0xffeed4 },
      { x: -15, z: -3.2, w: 4.2, d: 4.0, h: 22, color: 0x1e293b, glow: 0xdbeafe },
      { x: -13.5, z: 0.5, w: 3.0, d: 3.2, h: 14, color: 0x475569, glow: 0xfef3c7 },
      { x: -15.5, z: 4.2, w: 4.0, d: 3.8, h: 19, color: 0x0f172a, glow: 0xe0e7ff },
      { x: -14, z: 8.0, w: 3.4, d: 3.0, h: 15, color: 0x334155, glow: 0xffeed4 },
    ];

    for (let i = 0; i < towerConfigs.length; i++) {
      const t = towerConfigs[i];
      const towerMat = this.mat(`tower_${i}`, {
        color: t.color,
        roughness: 0.35,
        metalness: 0.4,
      });
      const towerMesh = new THREE.Mesh(new THREE.BoxGeometry(t.d, t.h, t.w), towerMat);
      towerMesh.position.set(t.x, t.h / 2, t.z);
      cityGroup.add(towerMesh);

      // Window grid texture/lines on front facade of tower
      const winGrid = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, t.h * 0.8, t.w * 0.85),
        this.mat(`winGrid_${i}`, {
          color: t.glow,
          emissive: t.glow,
          emissiveIntensity: 0.4,
          roughness: 0.2,
        })
      );
      winGrid.position.set(t.x + t.d / 2 + 0.05, t.h / 2, t.z);
      cityGroup.add(winGrid);
    }

    // Street Sidewalk & Urban Trees
    const sidewalkMat = this.mat('sidewalk', { color: 0xd1d5db, roughness: 0.8 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 28), sidewalkMat);
    sidewalk.position.set(-10.5, 0.1, 0);
    cityGroup.add(sidewalk);

    // Leafy Street Trees
    const trunkMat = this.mat('treeTrunk', { color: 0x5a3e28, roughness: 0.85 });
    const foliageMat = this.mat('foliage', { color: 0x22c55e, roughness: 0.65 });
    for (const tz of [-5.5, 0, 5.5]) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.8, 8), trunkMat);
      trunk.position.y = 1.4;
      tree.add(trunk);
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 10), foliageMat);
      foliage1.position.y = 3.2;
      tree.add(foliage1);
      const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), foliageMat);
      foliage2.position.set(0.3, 3.8, 0.2);
      tree.add(foliage2);
      tree.position.set(-10.2, 0, tz);
      cityGroup.add(tree);
    }

    this.scene.add(cityGroup);
  }

  // === PHARMACY SIGN & BRANDING ===
  private buildSign(): void {
    const signGroup = new THREE.Group();

    // Elegant architectural plaque with gold/bronze trim
    const plaqueMat = this.mat('plaque', { color: 0x141f1b, roughness: 0.35, metalness: 0.25 });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.35, 0.12), plaqueMat);
    signGroup.add(plaque);

    const bronzeFrame = this.mat('signGold', { color: 0xd4af37, metalness: 0.8, roughness: 0.25 });
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(6.75, 1.48, 0.06), bronzeFrame);
    frameMesh.position.z = -0.02;
    signGroup.add(frameMesh);

    // Glowing Neon Medical Cross
    const crossMat = this.mat('crossGlow', {
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.06), crossMat);
    ch.position.set(-2.25, 0.02, 0.09);
    signGroup.add(ch);
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.06), crossMat);
    cv.position.set(-2.25, 0.02, 0.09);
    signGroup.add(cv);

    // High-resolution Canvas Texture with crisp dispensary typography
    const letterTex = this.canvasTexture(1024, 256, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 90px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('MEDIX PHARMACY', 30, 95);

      ctx.fillStyle = '#10b981';
      ctx.font = '600 36px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('APEX METROPOLIS · CLINICAL DISPENSARY', 32, 175);
    });

    const letters = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 1.05),
      new THREE.MeshStandardMaterial({
        map: letterTex,
        transparent: true,
        emissive: 0xffffff,
        emissiveMap: letterTex,
        emissiveIntensity: 0.45,
        roughness: 0.35,
      })
    );
    letters.position.set(0.65, 0.02, 0.09);
    signGroup.add(letters);

    // Neon cross light
    const crossLight = new THREE.PointLight(0x10b981, 1.2, 4.5, 1.8);
    crossLight.position.set(-2.25, 0.05, 0.35);
    signGroup.add(crossLight);

    signGroup.position.set(0, 3.95, -5.88);
    this.scene.add(signGroup);
  }

  // === COUNTER ===
  private buildCounter(): void {
    const g = new THREE.Group();
    const bodyMat = this.mat('counterBody', { color: 0x35403a, roughness: 0.42 });
    const topMat = this.mat('counterTop', {
      color: C.quartz,
      roughness: 0.14,
      metalness: 0.06,
      envMapIntensity: 0.9,
    });
    const woodMat = this.mat('counterWood', { color: C.walnut, roughness: 0.38 });
    const woodDark = this.mat('counterWoodDark', { color: C.walnutDark, roughness: 0.45 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.05, 1.0), bodyMat);
    base.position.set(0, 0.52, -1.05);
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);

    const face = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.95, 0.05), woodMat);
    face.position.set(0, 0.52, -0.54);
    face.castShadow = true;
    g.add(face);

    for (let i = 0; i < 12; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.88, 0.015), woodDark);
      slat.position.set(-2.9 + i * 0.53, 0.52, -0.51);
      g.add(slat);
    }

    const under = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.02, 0.015),
      this.mat('underGlow', {
        color: C.teal,
        emissive: C.teal,
        emissiveIntensity: 0.55,
        roughness: 0.4,
      })
    );
    under.position.set(0, 0.98, -0.52);
    g.add(under);

    const top = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.09, 1.25), topMat);
    top.position.set(0, 1.09, -1.05);
    top.castShadow = true;
    top.receiveShadow = true;
    top.userData.interactive = true;
    top.userData.type = 'counter';
    top.userData.label = 'Counter';
    this.interactiveObjects.push(top);
    g.add(top);

    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(6.92, 0.025, 1.27),
      this.mat('edge', { color: 0xe8e4dc, roughness: 0.3 })
    );
    edge.position.set(0, 1.14, -1.05);
    g.add(edge);

    const posGroup = new THREE.Group();
    const posBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.28, 0.34),
      this.mat('pos', { color: 0x2e3634, roughness: 0.32, metalness: 0.25 })
    );
    posBody.position.y = 0.14;
    posBody.castShadow = true;
    posGroup.add(posBody);

    const posBezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.22, 0.02),
      this.mat('posBezel', { color: 0x1a1e1c, roughness: 0.3 })
    );
    posBezel.position.set(0, 0.16, 0.16);
    posGroup.add(posBezel);

    const posScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.17, 0.01),
      this.mat('posScreen', {
        color: 0x143832,
        emissive: C.teal,
        emissiveIntensity: 0.55,
        roughness: 0.15,
      })
    );
    posScreen.position.set(0, 0.16, 0.17);
    posGroup.add(posScreen);

    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.015, 0.04),
      this.mat('slot', { color: 0x1a1e1c, roughness: 0.5 })
    );
    slot.position.set(0, 0.28, -0.05);
    posGroup.add(slot);

    posGroup.position.set(2.15, 1.14, -1.0);
    g.add(posGroup);

    const monBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.02, 0.18),
      this.mat('monBase', { color: 0x2a302e, roughness: 0.35, metalness: 0.4 })
    );
    monBase.position.set(-0.75, 1.15, -1.2);
    g.add(monBase);

    const monStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.035, 0.28, 10),
      this.mat('monStand', { color: 0x6a7270, roughness: 0.28, metalness: 0.55 })
    );
    monStand.position.set(-0.75, 1.29, -1.2);
    g.add(monStand);

    const monFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.5, 0.04),
      this.mat('monFrame', { color: 0x1a1e1c, roughness: 0.32 })
    );
    monFrame.position.set(-0.75, 1.58, -1.2);
    monFrame.castShadow = true;
    g.add(monFrame);

    const monScreenTex = this.canvasTexture(512, 320, (ctx) => {
      ctx.fillStyle = '#0e2a26';
      ctx.fillRect(0, 0, 512, 320);
      ctx.fillStyle = '#1a9e90';
      ctx.fillRect(0, 0, 512, 36);
      ctx.fillStyle = '#e8f5f2';
      ctx.font = '600 18px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Rx Queue', 16, 24);
      ctx.fillStyle = '#6d9a94';
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Amoxicillin 500mg', 16, 70);
      ctx.fillText('Lisinopril 10mg', 16, 100);
      ctx.fillText('Metformin 850mg', 16, 130);
      ctx.fillStyle = '#0d7a70';
      ctx.fillRect(16, 170, 200, 8);
      ctx.fillRect(16, 190, 140, 8);
    });
    const monScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.74, 0.44),
      new THREE.MeshStandardMaterial({
        map: monScreenTex,
        emissive: 0xffffff,
        emissiveMap: monScreenTex,
        emissiveIntensity: 0.55,
        roughness: 0.2,
      })
    );
    monScreen.position.set(-0.75, 1.58, -1.175);
    g.add(monScreen);

    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.07, 0.32),
      this.mat('tray', { color: C.teal, roughness: 0.32, metalness: 0.15 })
    );
    tray.position.set(-2.1, 1.17, -1.0);
    tray.castShadow = true;
    g.add(tray);

    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.36, 0.14),
      this.mat('bag', { color: 0xefe2c8, roughness: 0.85 })
    );
    bag.position.set(1.15, 1.31, -0.85);
    bag.castShadow = true;
    g.add(bag);
    const bagTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.03, 0.14),
      this.mat('bagTop', { color: 0xe0d0b0, roughness: 0.8 })
    );
    bagTop.position.set(1.15, 1.5, -0.85);
    g.add(bagTop);

    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.18, 16),
      this.mat('rxBottle', { color: 0xf5f0e8, roughness: 0.25 })
    );
    bottle.position.set(-1.2, 1.23, -0.9);
    bottle.castShadow = true;
    g.add(bottle);
    const bottleCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16),
      this.mat('rxCap', { color: C.teal, roughness: 0.4 })
    );
    bottleCap.position.set(-1.2, 1.34, -0.9);
    g.add(bottleCap);

    this.scene.add(g);
  }

  // === SHELVES & MEDICINE DISPENSARY ===
  private buildShelves(): void {
    const frameMat = this.mat('shelfFrame', { color: 0x4a3525, roughness: 0.38 });
    const backMat = this.mat('shelfBack', { color: 0xf5eee0, roughness: 0.65 });
    const shelfMat = this.mat('shelfBoard', { color: 0x8a6240, roughness: 0.35 });
    const glassMat = this.mat('shelfGlass', {
      color: 0xe6f4f6,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      envMapIntensity: 1.4,
    });

    const positions = [
      { x: -3.6, z: -4.55 },
      { x: 0, z: -4.55 },
      { x: 3.6, z: -4.55 },
    ];

    const drugPackages = [
      { name: 'Augmentin 1g', bg: 0xffffff, stripe: 0x0f766e },
      { name: 'Cipro 500mg', bg: 0xffffff, stripe: 0x1e3a8a },
      { name: 'Amoxil 500mg', bg: 0xffffff, stripe: 0xb91c1c },
      { name: 'Paracetamol', bg: 0xffffff, stripe: 0x0284c7 },
      { name: 'Metformin', bg: 0xffffff, stripe: 0xd97706 },
      { name: 'Ventolin', bg: 0xe0f2fe, stripe: 0x0369a1 },
    ];

    for (let uIdx = 0; uIdx < positions.length; uIdx++) {
      const pos = positions[uIdx];
      const unit = new THREE.Group();

      // Outer Vertical Uprights
      for (const sx of [-1.32, 1.32]) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.65, 0.62), frameMat);
        side.position.set(sx, 1.825, 0);
        side.castShadow = true;
        unit.add(side);
      }

      // Top Header Cap
      const topCap = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.14, 0.64), frameMat);
      topCap.position.set(0, 3.65, 0);
      topCap.castShadow = true;
      unit.add(topCap);

      // Backing board
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.58, 3.55, 0.04), backMat);
      back.position.set(0, 1.825, -0.27);
      back.receiveShadow = true;
      unit.add(back);

      // Bottom Apothecary Drawers Base
      const drawerCabinet = new THREE.Mesh(
        new THREE.BoxGeometry(2.55, 0.52, 0.58),
        this.mat('drawerCab', { color: 0x3d281a, roughness: 0.4 })
      );
      drawerCabinet.position.set(0, 0.26, 0);
      drawerCabinet.castShadow = true;
      unit.add(drawerCabinet);

      // 4 Brass pull handles on lower drawers
      const brassMat = this.mat('brassHandle', { color: 0xd4af37, metalness: 0.85, roughness: 0.2 });
      for (const dx of [-0.9, -0.3, 0.3, 0.9]) {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.03), brassMat);
        handle.position.set(dx, 0.28, 0.3);
        unit.add(handle);

        const cardSlot = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.1, 0.01),
          this.mat('cardSlot', { color: 0xfef9c3, roughness: 0.6 })
        );
        cardSlot.position.set(dx, 0.38, 0.295);
        unit.add(cardSlot);
      }

      // Hit area for interaction
      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(2.75, 3.65, 0.62),
        new THREE.MeshStandardMaterial({ visible: false })
      );
      hit.position.set(0, 1.825, 0);
      hit.userData.interactive = true;
      hit.userData.type = 'shelf';
      hit.userData.label = 'Pharmacy Shelves';
      unit.add(hit);
      this.interactiveObjects.push(hit);

      // 4 Upper Storage Shelf Tiers
      for (let i = 0; i < 4; i++) {
        const y = 0.65 + i * 0.76;
        const board = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.045, 0.54), shelfMat);
        board.position.set(0, y, 0.02);
        board.castShadow = true;
        board.receiveShadow = true;
        unit.add(board);

        // Glowing warm under-shelf LED strip
        const ledStrip = new THREE.Mesh(
          new THREE.BoxGeometry(2.45, 0.015, 0.02),
          this.mat(`ledShelf_${uIdx}_${i}`, {
            color: 0xfffbee,
            emissive: 0xffeed6,
            emissiveIntensity: 0.85,
            roughness: 0.2,
          })
        );
        ledStrip.position.set(0, y - 0.025, 0.22);
        unit.add(ledStrip);

        // Front glass lip
        const lip = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.14, 0.015), glassMat);
        lip.position.set(0, y + 0.1, 0.27);
        unit.add(lip);

        // Populate items on shelf
        for (let j = 0; j < 7; j++) {
          const itemX = -0.96 + j * 0.32;
          const pkg = drugPackages[(i * 2 + j) % drugPackages.length];
          const isAmberBottle = (i === 3 && j % 2 === 0);

          if (isAmberBottle) {
            // Amber glass elixir bottle with gold foil cap
            const bottleGroup = new THREE.Group();
            const bBody = new THREE.Mesh(
              new THREE.CylinderGeometry(0.065, 0.068, 0.28, 14),
              this.mat('amberGlassBottle', {
                color: 0xb45309,
                roughness: 0.15,
                metalness: 0.1,
                envMapIntensity: 1.2,
              })
            );
            bBody.position.y = 0.14;
            bottleGroup.add(bBody);

            const bCap = new THREE.Mesh(
              new THREE.CylinderGeometry(0.068, 0.068, 0.04, 14),
              brassMat
            );
            bCap.position.y = 0.29;
            bottleGroup.add(bCap);

            const bLabel = new THREE.Mesh(
              new THREE.CylinderGeometry(0.069, 0.069, 0.14, 14),
              this.mat('creamLabel', { color: 0xfefce8, roughness: 0.6 })
            );
            bLabel.position.y = 0.14;
            bottleGroup.add(bLabel);

            bottleGroup.position.set(itemX, y + 0.03, 0.04);
            unit.add(bottleGroup);
          } else {
            // Modern branded pharmaceutical box
            const boxGroup = new THREE.Group();
            const boxMesh = new THREE.Mesh(
              new THREE.BoxGeometry(0.16, 0.22, 0.12),
              this.mat(`pkg_${pkg.name}`, { color: pkg.bg, roughness: 0.35 })
            );
            boxMesh.position.y = 0.11;
            boxMesh.castShadow = true;
            boxGroup.add(boxMesh);

            const stripeMesh = new THREE.Mesh(
              new THREE.BoxGeometry(0.165, 0.055, 0.125),
              this.mat(`stripe_${pkg.name}`, { color: pkg.stripe, roughness: 0.4 })
            );
            stripeMesh.position.y = 0.14;
            boxGroup.add(stripeMesh);

            boxGroup.position.set(itemX, y + 0.03, 0.04);
            unit.add(boxGroup);
          }
        }
      }

      // Overhead digital clinical monitor on center unit
      if (pos.x === 0) {
        const monGroup = new THREE.Group();
        const monBezel = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.55, 0.06),
          this.mat('dispensaryMonFrame', { color: 0x1e293b, roughness: 0.3, metalness: 0.6 })
        );
        monGroup.add(monBezel);

        const screenTex = this.canvasTexture(1024, 256, (ctx) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 1024, 256);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, 0, 1024, 45);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
          ctx.fillText('DISPENSARY QUEUE STATUS', 30, 32);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
          ctx.fillText('● STATION 1: COUNSELING ACTIVE', 30, 105);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '28px "Segoe UI", system-ui, sans-serif';
          ctx.fillText('BNF DRUG DIRECTORY SYNCED · ZERO CONTRAINDICATIONS', 30, 160);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
          ctx.fillText('PRESCRIPTION SAFETY: VERIFIED 100%', 30, 215);
        });

        const monScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(2.28, 0.45),
          new THREE.MeshStandardMaterial({
            map: screenTex,
            emissive: 0xffffff,
            emissiveMap: screenTex,
            emissiveIntensity: 0.65,
            roughness: 0.2,
          })
        );
        monScreen.position.z = 0.035;
        monGroup.add(monScreen);

        monGroup.position.set(0, 4.0, 0.1);
        unit.add(monGroup);
      }

      unit.position.set(pos.x, 0, pos.z);
      this.scene.add(unit);
    }
  }

  // === WAITING AREA ===
  private buildWaitingArea(): void {
    const seatMat = this.mat('seat', { color: C.chair, roughness: 0.5 });
    const seatPad = this.mat('seatPad', { color: 0x8aab9a, roughness: 0.65 });
    const metalMat = this.mat('chrome', {
      color: C.metal,
      metalness: 0.75,
      roughness: 0.22,
      envMapIntensity: 1.0,
    });
    const woodTop = this.mat('waitTable', { color: C.walnutLight, roughness: 0.38 });

    for (let i = 0; i < 3; i++) {
      const chair = new THREE.Group();

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), seatMat);
      seat.position.set(0, 0.48, 0);
      seat.castShadow = true;
      chair.add(seat);

      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.46), seatPad);
      pad.position.set(0, 0.54, 0);
      chair.add(pad);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.08), seatMat);
      back.position.set(0, 0.78, -0.24);
      back.castShadow = true;
      chair.add(back);

      const backPad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.03), seatPad);
      backPad.position.set(0, 0.78, -0.19);
      chair.add(backPad);

      for (const ax of [-0.27, 0.27]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.38), metalMat);
        arm.position.set(ax, 0.58, 0);
        chair.add(arm);
      }

      for (const [lx, lz] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.46, 8), metalMat);
        leg.position.set(lx, 0.23, lz);
        leg.castShadow = true;
        chair.add(leg);
      }

      chair.position.set(5.5, 0, 1.4 + i * 1.3);
      chair.rotation.y = -Math.PI / 2;
      this.scene.add(chair);
      this.addContactShadow(chair, 0.35);
    }

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.045, 0.62), woodTop);
    tableTop.position.set(5.5, 0.52, 0.35);
    tableTop.castShadow = true;
    this.scene.add(tableTop);
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.48, 10), metalMat);
    tableLeg.position.set(5.5, 0.26, 0.35);
    this.scene.add(tableLeg);

    const mag1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.015, 0.34),
      this.mat('mag1', { color: 0x5a8a9a, roughness: 0.55 })
    );
    mag1.position.set(5.46, 0.56, 0.32);
    mag1.rotation.y = 0.25;
    this.scene.add(mag1);
    const mag2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.012, 0.32),
      this.mat('mag2', { color: 0xc4a06a, roughness: 0.55 })
    );
    mag2.position.set(5.52, 0.575, 0.38);
    mag2.rotation.y = -0.15;
    this.scene.add(mag2);
  }

  // === DECORATIONS ===
  private buildDecorations(): void {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.2, 0.48, 16),
      this.mat('pot', { color: C.pot, roughness: 0.52 })
    );
    pot.position.set(-4.6, 0.24, -0.4);
    pot.castShadow = true;
    this.scene.add(pot);

    const potRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.025, 8, 20),
      this.mat('potRim', { color: 0xa88860, roughness: 0.45 })
    );
    potRim.rotation.x = Math.PI / 2;
    potRim.position.set(-4.6, 0.47, -0.4);
    this.scene.add(potRim);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.03, 14),
      this.mat('soil', { color: 0x2e2012, roughness: 0.92 })
    );
    soil.position.set(-4.6, 0.47, -0.4);
    this.scene.add(soil);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.7, 8),
      this.mat('trunk', { color: 0x5a4030, roughness: 0.8 })
    );
    trunk.position.set(-4.6, 0.8, -0.4);
    trunk.castShadow = true;
    this.scene.add(trunk);

    const leafA = this.mat('leafA', { color: C.leaf, roughness: 0.42 });
    const leafB = this.mat('leafB', { color: C.leafDark, roughness: 0.48 });
    const leafC = this.mat('leafC', { color: 0x4d9a68, roughness: 0.4 });
    for (let i = 0; i < 12; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 + (i % 3) * 0.04, 10, 10),
        i % 3 === 0 ? leafA : i % 3 === 1 ? leafB : leafC
      );
      const angle = (i / 12) * Math.PI * 2;
      const r = 0.15 + (i % 4) * 0.06;
      leaf.position.set(
        -4.6 + Math.cos(angle) * r,
        1.1 + (i % 4) * 0.12,
        -0.4 + Math.sin(angle) * r
      );
      leaf.scale.set(1, 0.75, 1);
      leaf.castShadow = true;
      this.scene.add(leaf);
    }

    const clockTex = this.canvasTexture(256, 256, (ctx) => {
      ctx.beginPath();
      ctx.arc(128, 128, 120, 0, Math.PI * 2);
      ctx.fillStyle = '#faf8f4';
      ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = i % 3 === 0 ? 95 : 102;
        ctx.beginPath();
        ctx.moveTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
        ctx.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110);
        ctx.strokeStyle = '#2a302e';
        ctx.lineWidth = i % 3 === 0 ? 4 : 2;
        ctx.stroke();
      }
      ctx.strokeStyle = '#1a1e1c';
      ctx.lineCap = 'round';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(128, 128);
      ctx.lineTo(128 + Math.cos(-Math.PI / 2 - 0.9) * 50, 128 + Math.sin(-Math.PI / 2 - 0.9) * 50);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(128, 128);
      ctx.lineTo(128 + Math.cos(-Math.PI / 2 + 1.2) * 75, 128 + Math.sin(-Math.PI / 2 + 1.2) * 75);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(128, 128, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0d7a70';
      ctx.fill();
    });

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 32),
      new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.35 })
    );
    clockFace.position.set(6.4, 3.4, -5.9);
    this.scene.add(clockFace);

    const clockRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.022, 10, 28),
      this.mat('clockRim', { color: 0x4a5550, metalness: 0.55, roughness: 0.28 })
    );
    clockRim.position.set(6.4, 3.4, -5.88);
    this.scene.add(clockRim);

    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.025, 1.3),
      this.mat('doorMat', { color: 0x3d6b55, roughness: 0.92 })
    );
    mat.position.set(0, 0.012, 5.1);
    mat.receiveShadow = true;
    this.scene.add(mat);

    const matBorder = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.015, 1.4),
      this.mat('matBorder', { color: 0x2a4a3a, roughness: 0.85 })
    );
    matBorder.position.set(0, 0.005, 5.1);
    this.scene.add(matBorder);

    const posterTex = this.canvasTexture(256, 360, (ctx) => {
      ctx.fillStyle = '#f5f2eb';
      ctx.fillRect(0, 0, 256, 360);
      ctx.fillStyle = '#0d7a70';
      ctx.fillRect(0, 0, 256, 48);
      ctx.fillStyle = '#f5f2eb';
      ctx.font = '600 22px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAKE AS', 128, 32);
      ctx.fillText('DIRECTED', 128, 56);
      ctx.fillStyle = '#2a3632';
      ctx.font = '700 56px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Rx', 128, 140);
      ctx.fillStyle = '#6d7a75';
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Ask your pharmacist', 128, 200);
      ctx.fillText('about any medication', 128, 222);
      ctx.fillStyle = '#c47a2a';
      ctx.beginPath();
      ctx.roundRect(70, 260, 50, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#4a7c9e';
      ctx.beginPath();
      ctx.roundRect(130, 260, 50, 22, 11);
      ctx.fill();
    });
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.0),
      new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.6 })
    );
    poster.position.set(6.5, 2.5, -2.2);
    poster.rotation.y = -Math.PI / 2;
    this.scene.add(poster);

    const posterFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.06, 0.76),
      this.mat('posterFrame', { color: 0x3a4540, roughness: 0.4 })
    );
    posterFrame.position.set(6.53, 2.5, -2.2);
    this.scene.add(posterFrame);
  }

  private buildAtmosphere(): void {
    const count = 28;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = 0.4 + Math.random() * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xfff8e8,
        size: 0.035,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    dust.name = 'dust';
    this.scene.add(dust);
  }

  private addContactShadow(parent: THREE.Object3D, radius: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.38)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.14)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2, radius * 2),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.012;
    mesh.name = 'contactShadow';
    parent.add(mesh);
  }

  // === NPC ===
  public setConsultationCamera(active: boolean): void {
    this.isConsultationMode = active;
  }

  public showPatientNPC(avatar: string, characterType?: CharacterType, name?: string): void {
    if (this.npcGroup) {
      this.scene.remove(this.npcGroup);
    }

    const resolvedName = name || (characterType ? `patient_${characterType}` : `patient_${avatar}`);

    this.patientNpc = new CharacterInstance({
      name: resolvedName,
      characterType: characterType || 'generic',
      modelUrl: '/models/patient.glb',
      isNpc: true,
      avatarEmoji: avatar,
    });

    this.npcGroup = this.patientNpc.root;

    // Add invisible collider for interaction raycasting
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.8, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitBox.position.y = 0.9;
    hitBox.userData.interactive = true;
    hitBox.userData.type = 'patient';
    hitBox.userData.label = resolvedName;
    this.npcGroup.add(hitBox);
    this.interactiveObjects.push(hitBox);

    this.npcGroup.position.set(0, 0, 4.5);
    this.npcTargetPos.set(0, 0, -0.25);
    this.npcVisible = true;
    this.scene.add(this.npcGroup);
  }

  public setPatientTalking(talking: boolean): void {
    if (this.patientNpc) {
      this.patientNpc.setAction(talking ? 'talk' : 'idle');
    }
  }

  public hidePatientNPC(): void {
    if (this.npcGroup) {
      this.interactiveObjects = this.interactiveObjects.filter(
        (o) => !this.npcGroup!.children.includes(o)
      );
      this.npcTargetPos.set(0, 0, 6.4);
      if (this.patientNpc) {
        this.patientNpc.isMoving = true;
        this.patientNpc.setAction('walk');
      }
      setTimeout(() => {
        if (this.npcGroup) {
          this.scene.remove(this.npcGroup);
          this.npcGroup = null;
          this.patientNpc = null;
          this.npcVisible = false;
        }
      }, 2000);
    }
  }

  // === EVENTS ===
  private setupEvents(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.renderer.domElement.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    this.renderer.domElement.addEventListener('click', () => {
      if (this.hoveredObject) {
        audioManager.playClick();
        const type = this.hoveredObject.userData.type;
        if (type === 'shelf' && this.onShelfClick) this.onShelfClick();
        if (type === 'counter' && this.onCounterClick) this.onCounterClick();
        if (type === 'patient' && this.onPatientClick) this.onPatientClick();
      }
    });
  }

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  };

  public start(): void {
    this.clock.start();
    this.animate();
  }

  public stop(): void {
    cancelAnimationFrame(this.animationId);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.playerCharacter.update(delta);
    if (this.patientNpc) {
      this.patientNpc.update(delta);
    }

    this.updateCharacter(delta);
    this.updateCamera(delta);
    this.updateNPC(delta);
    this.updateRaycast();

    const dust = this.scene.getObjectByName('dust');
    if (dust) {
      dust.rotation.y += delta * 0.02;
      dust.position.y = Math.sin(this.clock.elapsedTime * 0.15) * 0.08;
    }

    this.composer.render();
  };

  private updateCharacter(delta: number): void {
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.keys['w'] || this.keys['arrowup']) moveDir.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveDir.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveDir.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveDir.x += 1;

    this.isMoving = moveDir.length() > 0;
    this.playerCharacter.isMoving = this.isMoving;

    if (this.isMoving) {
      moveDir.normalize();
      this.characterRotation = Math.atan2(moveDir.x, moveDir.z);
      this.characterGroup.rotation.y = this.characterRotation;

      const newX = this.characterGroup.position.x + moveDir.x * this.characterSpeed * delta;
      const newZ = this.characterGroup.position.z + moveDir.z * this.characterSpeed * delta;
      this.characterGroup.position.x = Math.max(this.BOUNDS.minX, Math.min(this.BOUNDS.maxX, newX));
      this.characterGroup.position.z = Math.max(this.BOUNDS.minZ, Math.min(this.BOUNDS.maxZ, newZ));

      this.playerCharacter.setAction('walk');
    } else {
      this.playerCharacter.setAction('idle');
    }
  }

  private updateCamera(delta: number): void {
    let targetPos: THREE.Vector3;
    let lookTarget: THREE.Vector3;

    if (this.isConsultationMode && this.npcGroup) {
      // Dynamic counter consultation perspective framing both pharmacist and patient
      targetPos = new THREE.Vector3(2.6, 2.05, 0.7);
      lookTarget = new THREE.Vector3(-0.2, 1.35, -1.05);
    } else {
      targetPos = new THREE.Vector3(
        this.characterGroup.position.x + this.cameraOffset.x,
        this.characterGroup.position.y + this.cameraOffset.y,
        this.characterGroup.position.z + this.cameraOffset.z
      );
      lookTarget = new THREE.Vector3(
        this.characterGroup.position.x,
        this.characterGroup.position.y + 1.1,
        this.characterGroup.position.z + 0.25
      );
    }

    this.camera.position.lerp(targetPos, 3.2 * delta);
    this.cameraTarget.lerp(lookTarget, 3.8 * delta);
    this.camera.lookAt(this.cameraTarget);
  }

  private updateNPC(delta: number): void {
    if (!this.npcGroup || !this.npcVisible) return;

    const dx = this.npcTargetPos.x - this.npcGroup.position.x;
    const dz = this.npcTargetPos.z - this.npcGroup.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.08) {
      const speed = 2.0;
      this.npcGroup.position.x += (dx / dist) * speed * delta;
      this.npcGroup.position.z += (dz / dist) * speed * delta;
      this.npcGroup.rotation.y = Math.atan2(dx, dz);
      if (this.patientNpc) {
        this.patientNpc.isMoving = true;
        this.patientNpc.setAction('walk');
      }
    } else {
      this.npcGroup.rotation.y = Math.PI;
      if (this.patientNpc) {
        this.patientNpc.isMoving = false;
        if (this.patientNpc.currentAction !== 'talk') {
          this.patientNpc.setAction('idle');
        }
      }
    }
  }

  private updateRaycast(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, false);

    if (this.hoveredObject) {
      const prev = this.highlightMats.get(this.hoveredObject);
      if (prev && this.hoveredObject instanceof THREE.Mesh) {
        this.hoveredObject.material = prev;
        this.highlightMats.delete(this.hoveredObject);
      }
      this.hoveredObject = null;
      this.renderer.domElement.style.cursor = 'default';
    }

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData.interactive) {
        this.hoveredObject = obj;
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
          if (!this.highlightMats.has(obj)) {
            this.highlightMats.set(obj, obj.material);
            const highlightMat = obj.material.clone();
            highlightMat.emissive = new THREE.Color(C.teal);
            highlightMat.emissiveIntensity = 0.3;
            obj.material = highlightMat;
          }
        }
        this.renderer.domElement.style.cursor = 'pointer';
      }
    }
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.stop();
    this.renderer.dispose();
  }
}
