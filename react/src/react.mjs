import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import {io} from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js"
import { useState, useRef, useEffect} from 'react';
import './App.css';

import * as THREE from 'three';
//import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


function BatteryData() {
    const [data, setData] = useState({});
    const [error, setError] = useState(null);
    const socket = io('http://localhost:3000');
    socket.on('data', (data) => {
        setData(data);
    });
    socket.on('error', (err) => {
        console.error(err);
        setError(err);
    });
    return (
        <div id="container">
            {JSON.stringify(data)}
            {error ?
            (<><p>There has been an error:</p>
            <p>{String(error)}</p></>) : null}
            <button onClick={() => {window.location.reload()}}>Refresh</button>

        </div>
        
    );
}
function Car() {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(0);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        const loader = new GLTFLoader();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.position.z = 5;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        loader.load(
            process.env.PUBLIC_URL + '/car.glb',
            (gltf) => {
                scene.add(gltf.scene);
                animate();
            },
            (xhr) => {
                setLoading((xhr.loaded / xhr.total) * 100);
            },
            (error) => {
                console.error('An error happened', error);
            },
        );

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div id="container">
            <div id="loading-bar"></div>
            <div id="percent">{loading + "%"}</div>
            <div ref={mountRef}></div>
        </div>
    );
}
export default function App() {
    return (
        <Router>
            <Routes>
                
                <Route path="/bms" element={<BatteryData />} />
                <Route path="/car" element={<Car />} />
                <Route index element={<><div>Welcome to the dashboard</div></>}></Route>
            </Routes>
        </Router>
    );
}