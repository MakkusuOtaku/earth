const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas when window is resized
window.addEventListener('resize', ()=>{
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight );
});

// Fullscreen when tapped on mobile, or press f
addEventListener('touchstart', () => {
    canvas.requestFullscreen();
});

addEventListener('keydown', (event) => {
    if (event.key === 'f') {
        canvas.requestFullscreen();
    } else if (event.key === 'd') {
        canvas.style.background = "radial-gradient(circle, aqua, darkblue, black";
    }
});

var earth, clouds, moon, iss;
var issData;

import * as THREE from "https://cdn.skypack.dev/three@0.134.0";

const loader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2.5;

const cameraObject = new THREE.Object3D();
cameraObject.add(camera);
scene.add(cameraObject);

/*
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-5, 5, 5);
scene.add(light);
*/

/*
const light2 = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light2);
*/

function createEarth() {
    const geometry = new THREE.SphereBufferGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        map: loader.load('textures/earth-hd.jpg'),
        emissiveMap: loader.load('textures/lights-2048x1024.jpg'),
        emissive: 0xff9900,
        specularMap: loader.load('textures/earth-specular.png'),
        specular: new THREE.Color('grey'),
        shininess: 10,
        bumpMap: loader.load('textures/earth-bumps.png'),
        bumpScale: 0.05,
    });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
}

function createClouds() {
    const geometry = new THREE.SphereBufferGeometry(1.01, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        map: loader.load('textures/earth-clouds.png'),
        transparent: true,
        opacity: 0.5,
    });
    clouds = new THREE.Mesh(geometry, material);
    earth.add(clouds);
}

async function createISS() {
    const geometry = new THREE.SphereBufferGeometry(0.005, 4, 4);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
    });

    iss = new THREE.Mesh(geometry, material);

    window.issContainer = new THREE.Object3D();
    iss.position.set(1.03, 0, 0);
    issContainer.add(iss);
    earth.add(issContainer);
}

async function createSun() {
    window.sunContainer = new THREE.Object3D();
    earth.add(sunContainer);

    /*
    const geometry = new THREE.SphereGeometry(0.01, 4, 4);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
    });

    const sunSpot = new THREE.Mesh(geometry, material);
    sunSpot.position.set(2, 0, 0);
    sunContainer.add(sunSpot);
    */

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 0, 0);
    sunContainer.add(light);
}

async function getISSPosition() {
    let response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    let json = await response.json();

    issData = json;
    //issData.longitude += 180;

    setTimeout(getISSPosition, 5000);
}

async function getSubSolarPoint() {
    //
}

createEarth();
createClouds();
createISS();
createSun();

getISSPosition();

setInterval(() => {
    if (cameraObject) cameraObject.rotation.y += 0.005;
    if (clouds) clouds.rotation.y += 0.0005;

    if (issContainer && issData) {
        issContainer.rotation.z = issData.latitude * Math.PI / 180;
        issContainer.rotation.y = issData.longitude * Math.PI / 180;

        if (sunContainer) {
            sunContainer.rotation.z = issData.solar_lat * Math.PI / 180;
            sunContainer.rotation.y = issData.solar_lon * Math.PI / 180;
        }
    }
    renderer.render(scene, camera);
}, 1000 / 60);