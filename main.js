import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById("blob");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 40;


// gradient color

const colorcanvas = document.createElement('canvas');
colorcanvas.width = 256;
colorcanvas.height = 256;
const syo = colorcanvas.getContext('2d');

const gradient = syo.createLinearGradient(0,0,0,256);
gradient.addColorStop(0, '#290056');
gradient.addColorStop(0.5, '#5705af');
gradient.addColorStop(1, '#009aa5');

syo.fillStyle = gradient;
syo.fillRect(0,0,256,256);

const texture = new THREE.CanvasTexture(colorcanvas);

const geometry = new THREE.SphereGeometry( 15, 32, 16 );
const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.1
});
const mesh = new THREE.Mesh(geometry, material);


// lights

const amlight = new THREE.AmbientLight(0x404040);
scene.add(amlight);

const dirlight = new THREE.DirectionalLight(0x404040, 2.5);
dirlight.position.set(2, 10, 7);
scene.add(dirlight);

scene.add(mesh);

renderer.render(scene, camera);