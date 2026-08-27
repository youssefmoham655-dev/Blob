import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { createNoise3D } from 'https://cdn.skypack.dev/simplex-noise@4.0.1';

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

const geometry = new THREE.SphereGeometry(15, 128, 128);

// saving orginal positions to return to it again
const originalPositions = geometry.attributes.position.array.slice();

const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.1
});
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh)

// lights

const amlight = new THREE.AmbientLight(0x404040);
scene.add(amlight);

const dirlight = new THREE.DirectionalLight(0x404040, 2.5);
dirlight.position.set(2, 10, 7);
scene.add(dirlight);

const noise = createNoise3D();
let analyzer, dataArray;
let audioVolume = 0;

async function setup_audio(){
    try{
        const requestt = await navigator.mediaDevices.getUserMedia({audio:true});
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const soundsource = ac.createMediaStreamSource(requestt);
        analyzer = ac.createAnalyser();
        analyzer.fftSize = 64;
        soundsource.connect(analyzer);

        dataArray = new Uint8Array(analyzer.frequencyBinCount);
    }

    catch(err){
        console.warn("Microphone access denied:", err);
    }
}

setup_audio()

function update_blob(volume){
    const position_attribute = geometry.attributes.position;
    for(let i = 0; i < position_attribute.count; i++){
        const uX = originalPositions[i * 3];
        const uY = originalPositions[i * 3 + 1];
        const uZ = originalPositions[i * 3 + 2];

        const noise2 = noise(uX * 0.08, uY * 0.08, uZ * 0.08);
        const distortion = 1 + (noise2 * volume * 0.5);

        position_attribute.setXYZ(i, uX * distortion, uY * distortion, uZ * distortion);
    }

    position_attribute.needsUpdate = true;
    geometry.computeVertexNormals();
}

function animate(){
    requestAnimationFrame(animate);

    if(analyzer) {
        analyzer.getByteFrequencyData(dataArray);

        let sum =0;
        for(let i =0; i<dataArray.length; i++) {
            sum += dataArray[i];
        }

        const average = sum / dataArray.length;

        audioVolume = average / 128;
    }

    update_blob(audioVolume); 

    mesh.rotation.y += 0.003;
    renderer.render(scene, camera);
}
animate()