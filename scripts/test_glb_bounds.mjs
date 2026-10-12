import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';

const loader = new GLTFLoader();
const buf = fs.readFileSync('public/models/character.glb');
const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

loader.parse(arrayBuf, '', (gltf) => {
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  console.log('Original Box min:', box.min, 'max:', box.max, 'size:', size);
  
  const targetHeight = 1.7;
  const scale = targetHeight / (size.y || 1);
  model.scale.set(scale, scale, scale);
  
  const updatedBox = new THREE.Box3().setFromObject(model);
  console.log('Scaled Box size:', updatedBox.getSize(new THREE.Vector3()), 'min.y:', updatedBox.min.y);
  console.log('Clips:', gltf.animations.map(a => a.name));
}, (err) => console.error(err));
