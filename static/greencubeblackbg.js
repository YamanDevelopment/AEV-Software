// Import necessary modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Add an ambient light
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15; // Increase the z-position

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a GLTFLoader
const loader = new GLTFLoader();

// Load a GLB file
loader.load('./static/car.glb', function (gltf) {
    // When the model is loaded, add it to the scene
    gltf.scene.position.set(0, 0, 0); // Set the model position to the origin
    gltf.scene.scale.set(0.5, 0.5, 0.5); // Scale down the model
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.log(error);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();