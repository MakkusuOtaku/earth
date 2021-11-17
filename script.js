const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var earth, moon, iss;
var issData;

import * as THREE from "https://cdn.skypack.dev/three@0.134.0";

const loader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-5, 5, 5);
scene.add(light);

const light2 = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light2);

function createEarth() {
    loader.load('textures/earth.png', (texture) => {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ map: texture });
        earth = new THREE.Mesh(geometry, material);

        loader.load('textures/earth-specular.png', (specular) => {
            material.specularMap = specular;
            material.specular = new THREE.Color('grey');
            //material.shininess = 50;

            loader.load('textures/earth-bumps.png', (bump) => {
                material.bumpMap = bump;
                material.bumpScale = 0.01;
                scene.add(earth);
            });
        });
    });
}

function createISS() {
    loader.load('textures/iss-sphere.png', (texture) => {
        const geometry = new THREE.SphereGeometry(1.05, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        iss = new THREE.Mesh(geometry, material);
        scene.add(iss);
    });
}

async function getISSPosition() {
    let response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    let json = await response.json();

    issData = json;
    //issData.longitude += 180;

    setTimeout(getISSPosition, 5000);
}

createEarth();
createISS();

getISSPosition();

setInterval(() => {
    if (earth) earth.rotation.y += 0.01;

    if (iss) {
        iss.rotation.z = issData.latitude * Math.PI / 180;
        iss.rotation.y = issData.longitude * Math.PI / 180;
        
        // Add earths rotation to the ISS
        //iss.rotation.x += earth.rotation.x;
        iss.rotation.y += earth.rotation.y;
    }
    renderer.render(scene, camera);
}, 1000 / 60);