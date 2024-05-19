import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { ipcRenderer } from "electron";
import { useState } from 'react';
import './App.css';
import * as THREE from 'three';
//import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


function BatteryData() {
    const [data, setData] = useState({});
    const [error, setError] = useState(null);
    ipcRenderer.send('connection');
    ipcRenderer.on('data', (data) => {
        setData(JSON.stringify(data));
    });
    ipcRenderer.on('error', (error) => {
        setError(error);
    });
    return (
        <div id="container">
            {data}
        </div>
        
    );
}
function Car() {
    const [loading, setLoading] = useState(0);
    const loader = new GLTFLoader();
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

    const light = new THREE.AmbientLight(0xffffff);
    light.position.set(10, 10, 10);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0); // set the position of the light
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 0); // set the position of the light
    scene.add(pointLight);

// setup //
    const renderer = new THREE.WebGLRenderer({ alpha: true , antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    loader.load(
        './car.glb',
        function (gltf) {
          let content = gltf.scene;
          content.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              if (child.material.map) {
                child.material.roughness = 1;
                child.material.metalness = 0;
              }
            }
          });
          scene.add(gltf.scene);
        },
        function (xhr) {    
            console.log(xhr);
            setLoading(xhr.loaded / xhr.total * 100);

        },
        function (error) {
          console.error(error);
        }
      );
    return (
        <div id="container">
            <div id="loading-bar"></div>
            <div id="percent">{loading + "%"}</div>
            {renderer.domElement}
        </div>
    );
    
}
export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/bms" element={<BatteryData />} />
                <Route path="/car" element={<Car />} />
            </Routes>
        </Router>
    );
}