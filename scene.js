import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { ColladaLoader } from './lib/ColladaLoader.js';

var camera, controls, scene, renderer;
var objects = [], bull2Scene, offY = - 20;
var drawers = [];
var manette;
var manettePivot;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject;
let selectedDrawer;
let mouseDownPos = {x:0,y:0};
let loadingProgress = 0;
let loadingTopic = '';

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {
	console.log("init started..");
	scene = new THREE.Scene();
	//scene.background = new THREE.Color( "lightblue" );
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 50, 50, 0 );

	// controls
	controls = new OrbitControls( camera, renderer.domElement );

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 5;
	controls.maxDistance = 300;

	// world
	// loading manager
	let manager = new THREE.LoadingManager();
	manager.onProgress = updateLoadingProgress;

  	// instantiate a loader
  	var loader = new ColladaLoader(manager);


	loadModels(loader, manager);

	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( - 1, - 1, - 1 );
	scene.add( light );

	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );
 

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}

function render() {
	renderer.render( scene, camera );
}

async function updateLoadingProgress(item, loaded, total){
	document.getElementById("value").innerHTML = (loaded / total)*100 + '%';
	document.getElementById("bar").style.width = (loaded / total)*100 + '%';
	if(loaded == total)
		removeLoadingScreen();
}

async function removeLoadingScreen(){	
	document.getElementById('loading-screen').classList.add('fade-out');
	await sleep(400); // wait for the fade-out transition to end
	document.getElementById('loading-screen').remove();
}

async function loadModels(loader, manager){
	loadPannel(loader);
	loadCarcass(loader);
	loadTiroirs(loader);
}

function  loadPannel(loader){
	loadingTopic = "Chargement du panneau";
	loader.load('fix.dae', // panneau de connexion
			// Function when resource is loaded
			function (collada) {    // 53 objets
					scene.add(collada.scene);
					collada.scene.scale.x = 2.2;
					collada.scene.scale.y= 2;
					collada.scene.scale.z = 2;
					collada.scene.position.x = 8;
					collada.scene.position.y = 27 + offY;
					collada.scene.position.z = -10.6;
					collada.scene.rotation.x = 0;
					collada.scene.rotation.y = 3.14/2;
					collada.scene.rotation.z = 0;
			},
	);

	loader.load('changeable.dae', // panneau de connexion
			// Function when resource is loaded
			function (collada) {    // 53 objets
					scene.add(collada.scene);
					collada.scene.scale.x = 2.2;
					collada.scene.scale.y= 2;
					collada.scene.scale.z = 2;
					collada.scene.position.x = 8;
					collada.scene.position.y = 27 + offY;
					collada.scene.position.z = -10.6;
					collada.scene.rotation.x = 0;
					collada.scene.rotation.y = 3.14/2;
					collada.scene.rotation.z = 0;
			},
	);

	loader.load('manette.dae', // manette du panneau de connexion
			// Function when resource is loaded
			function (collada) { 
					//scene.add(collada.scene);
					manette = collada.scene;
					collada.scene.scale.x = 2.2;
					collada.scene.scale.y= 2;
					collada.scene.scale.z = 2;
					collada.scene.position.y -= 5.675;
					collada.scene.position.x = 0.86;
					collada.scene.rotation.x = 0;
					collada.scene.rotation.y = 3.14/2;
					collada.scene.rotation.z = 0;

					// Manette pivot
					const material = new THREE.MeshPhongMaterial({
						color: null,
						opacity: 0,
						transparent: true,
					  });
					var geometry = new THREE.SphereBufferGeometry( 0, 32, 32 );
					const cube = new THREE.Mesh(geometry, material);
					cube.position.set(7.15, 32.675+offY, -10.6);
					
					manettePivot = new THREE.Group();
					manettePivot.add(manette);
					
					cube.add(manettePivot);
					scene.add(cube);
			},
	);
}

function loadCarcass(loader) {
	loadingTopic = "Chargement de la carcasse";
	loader.load( 'carcasse.dae',
	    // Function when resource is loaded
	    function (collada) {
			scene.add(collada.scene) ;
			collada.scene.position.y += offY ;
			for(var i = 0 ; i < collada.scene.children.length ; i++){ objects.push(collada.scene.children[i]);} // 123 objects
	    },
	);
}

function loadTiroirs(loader) {
	loadingTopic = "Chargement des tiroirs";
	const offTiroir = 1.8;
	loader.load( 'tiroir.dae', 
	    // Function when resource is loaded
	    function (collada) {
			for (let i = 0; i <= 13; i++){
				let drawerClone = collada.scene.clone();
				scene.add(drawerClone) ;
				drawerClone.position.y += offY;
				drawerClone.position.y -= i*offTiroir;
				drawerClone.position.x -= 0.3;
				drawers.push(drawerClone);
			}	   
	    },
	);
}

function closeAllDrawers(){
	for(let i = 0; i < drawers.length; i++){
		if(!drawers[i].children[0].rotation.z < 3.14){
			closeDrawer(drawers[i].children[0]);
		}
	}
}

function openAllDrawers(){
	for(let i = 0; i < drawers.length; i++){
		if(drawers[i].children[0].rotation.z > 0)
			openDrawer(drawers[i].children[0]);
	}
}

async function closeDrawer(scene) {
	while (scene.rotation.z < 3.14) {
		scene.rotation.z += 0.02;
		await sleep(1);
	}
}

async function openDrawer(scene) {
	while (scene.rotation.z > 0) {
		scene.rotation.z -= 0.02;
		await sleep(1);
	}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Deprecated
function onClick2(e) {
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	for(let i = 0; i < drawers.length; i++) {
		if (raycaster.ray.isIntersectionBox(new THREE.Box3().setFromObject(drawers[i]))) {
			if (drawers[i].closed) {
				openDrawer(drawers[i]);
			} else {
				closeDrawer(drawers[i]);
			}
			break;
		}
	}
}

function onMouseDown(e){
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	// Gather objects mesh
	let objectsMesh = [];
	if (manette) {
		objectsMesh.push(...manette.children)
	}

	for(let i = 0; i < drawers.length; i++){
		objectsMesh.push(...drawers[i].children);
	}

	// calculate drawers intersecting the picking ray
	const intersects = raycaster.intersectObjects( objectsMesh );

	if(intersects.length){ // If we have intersections with at least one drawer
		// Index 0 is the closest drawer
		let object = intersects[0].object;
		// Disable camera controls (way more convenient)
		controls.enabled = false;
		// Enable drawer drag :
		//	- save the selected drawer
		// 	- and the mouse down position (so we can update the rotation angle relative to that first mouse touchdown)
		selectedObject = object;
		mouseDownPos={x:e.clientX, y:e.clientY};
	}
}

function onMouseUp(e){
	// Disable drawer drag
	selectedObject = null;
	// Enable camera controls
	controls.enabled = true;
}

function onMouseMove(e){
	if(selectedObject) {
		for (let i=0; i<manette.children.length; i++) { // 10 objects
			if (Object.is(selectedObject, manette.children[i])) {
				dragManette(e);
				return;
			}
		}
		selectedDrawer = selectedObject;
		dragTiroir(e);
	}
}

function dragManette(e) {
	// New z
	let z = -(e.clientY - mouseDownPos.y)/35 + manettePivot.rotation.z;
	// Bornes (0 <= z <= 3.14)
	z = z > 3.14 ? 3.14 : z;
	z = z < 0 ? 0 : z;
	manettePivot.rotation.z = z;
	mouseDownPos.y = e.clientY;
}

function dragTiroir(e) {
	// New z
	let z = selectedDrawer.rotation.z + (e.clientX - mouseDownPos.x)/50;
	// Bornes (0 <= z <= 3.14)
	z = z > 3.14 ? 3.14 : z;
	z = z < 0 ? 0 : z;
	selectedDrawer.rotation.z = z;
	mouseDownPos.x = e.clientX;
}

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);

document.getElementById("closeDrawersButton").addEventListener("click", closeAllDrawers);
document.getElementById("openDrawersButton").addEventListener("click", openAllDrawers);