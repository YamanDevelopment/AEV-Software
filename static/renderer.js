// Import necessary modules
import * as THREE from 'three';
//import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Load a GLB file
const loader = new GLTFLoader();

// setup //
const renderer = new THREE.WebGLRenderer({ alpha: true , antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const camera = new THREE.PerspectiveCamera(
    0.35,
    window.innerWidth / window.innerHeight,
    1,
    10000
);

camera.position.set(500, 500, 500);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
renderer.render(scene, camera);

/// lighting ///

const light = new THREE.AmbientLight(0xffaaff);
light.position.set(10, 10, 10);
scene.add(light);

/// geometry ///


console.log(scene);

// load a resource
loader.load(
    // resource URL
    './car.glb',
    // called when resource is loaded
    function (gltf) {
        let content = gltf.scene;
        content.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.color.set(0x000000); // Set color to black
            }
        });
        scene.add(gltf.scene);
    },
    // called when loading is in progresses
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.error(error);
    }
);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();





