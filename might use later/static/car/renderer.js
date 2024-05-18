// Import necessary modules


// Load a GLB file


document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

document.getElementById('container').style.width = '100%'; // make the container full width


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

const light = new THREE.AmbientLight(0xffffff);
light.position.set(10, 10, 10);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 0); // set the position of the light
scene.add(directionalLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, 0); // set the position of the light
scene.add(pointLight);


/// geometry ///


console.log(scene);
let loading_bar = document.getElementById('loading-bar');
loading_bar.style.width = '0%';
let percent = document.getElementById('percent');
// load a resource
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
        console.log(xhr)
        loading_bar.style.width = (xhr.loaded / xhr.total * 100) + '%';
        percent.innerHTML = Math.floor(xhr.loaded / xhr.total * 100) + '%';
            if(xhr.loaded / xhr.total == 1) {
                document.getElementById('container').innerHTML = '';
                document.getElementById('container').appendChild(renderer.domElement);
            }
    },
    function (error) {
      console.error(error);
    }
  );

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();





