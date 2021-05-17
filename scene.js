import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { ColladaLoader } from './lib/ColladaLoader.js';

var camera, controls, scene, renderer;
var objects = [], bull2Scene, offY = - 20;
var drawers = [];
var manette;
var manettePivot;
var gamma3;
var tabulatrice;
var panneau;
var surLePanneau;
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
	//console.log(camera);

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


	loadModels(loader);

	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );
	const sphereSize = 1;
	const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
	scene.add( pointLightHelper );
	// panneau ne se voit plus (lumière réfléchit)
	var lightAmb = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(lightAmb);

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
	document.getElementById("value").innerHTML = ((loaded / total)*100).toFixed(2) + '%';
	document.getElementById("bar").style.width = (loaded / total)*100 + '%';
	if(loaded == total)
		removeLoadingScreen();
}

async function removeLoadingScreen(){	
	document.getElementById('loading-screen').classList.add('fade-out');
	await sleep(3000); // wait for the fade-out transition to end
	document.getElementById('loading-screen').remove();
}

async function loadModels(loader){
	loadPannel(loader);
	loadCarcass(loader);
	loadTiroirs(loader);
}

function  loadPannel(loader){
	loadingTopic = "Chargement du panneau";
	loader.load('fix.dae', // panneau de connexion
			// Function when resource is loaded
			function (collada) {    // 53 objets
				panneau = collada.scene;
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

				let size = new THREE.Vector3(5.5, 10, 0.1);
				let pos = new THREE.Vector3(panneau.position.x + 0.3, panneau.position.y, panneau.position.z);
				surLePanneau = transparentScreen(pos, panneau.rotation, size, "surLePanneau");
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
					//console.log(collada.scene);
			},
	);

	loader.load('manette.dae', // manette du panneau de connexion
			// Function when resource is loaded
			function (collada) { 
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

function transparentScreen(pos, rot, size, name) {
	var mat = new THREE.MeshLambertMaterial( { color: 0x000000, opacity: 0.4, transparent:true, visible: false } );
	var geom = new THREE.BoxGeometry(size.x, size.y, size.z);
	var screen = new THREE.Mesh( geom, mat );
	screen.name = name;
	scene.add(screen );
	screen.position.set(pos.x, pos.y, pos.z);
	screen.rotation.set(rot.x, rot.y, rot.z);
	return screen;
}

function loadCarcass(loader) {
	loadingTopic = "Chargement de la carcasse";
	// loading gamma 3
	loader.load( 'gamma3.dae',
	    // Function when resource is loaded
	    function (collada) {
			gamma3 = collada.scene;
			scene.add(collada.scene) ;
			collada.scene.position.y += offY ;
			for(var i = 0 ; i < collada.scene.children.length ; i++){ objects.push(collada.scene.children[i]);} // 123 objects
	    },
	);

	// loading bull 3 (tabulatrice)
	loader.load( 'tabulatrice.dae',
	    // Function when resource is loaded
	    function (collada) {
			tabulatrice = collada.scene;
			scene.add(collada.scene) ;
			collada.scene.position.y += offY ;
			for(var i = 0 ; i < collada.scene.children.length ; i++){ objects.push(collada.scene.children[i]);} // 123 objects
	    },
	);

	// loading connections between gamma3 and bull 3
	loader.load( 'connections.dae',
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
	loader.load( 'tiroir2.dae', 
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
			for (var i=0; i<drawers.length; i++) {
				drawers[i].children[0].rotation.z = i * 2.0 / drawers.length;
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
			openDrawer(i+1, drawers[i].children[0]);
	}
}

async function closeDrawer(scene) {
	while (scene.rotation.z < 3.14) {
		scene.rotation.z += 0.02;
		await sleep(1);
	}
}

async function openDrawer(i, scene) {
	while (scene.rotation.z > 0 + i*2.0/drawers.length) {
		scene.rotation.z -= 0.02;
		await sleep(1);
	}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function viewGamma3() {
	var pos = gamma3.position;
	//camera.position.set(pos.x + 50, pos.y + 18, pos.z);
	//controls.target = new THREE.Vector3(pos.x, pos.y + 18, pos.z)
	motionMove(new THREE.Vector3(pos.x + 50, pos.y + 18, pos.z), new THREE.Vector3(pos.x, pos.y + 18, pos.z));
}

function viewPannel() {
	var pos = panneau.position;
	//camera.position.set(pos.x + 10, pos.y, pos.z);
	//controls.target = new THREE.Vector3(pos.x, pos.y, pos.z)
	motionMove(new THREE.Vector3(pos.x + 10, pos.y, pos.z), new THREE.Vector3(pos.x, pos.y, pos.z));
}

function viewTabulatrice() {
	var pos = tabulatrice.position;
	//camera.position.set(pos.x + 65, pos.y + 20, pos.z - 15);
	//controls.target = new THREE.Vector3(pos.x + 65, pos.y + 15, pos.z - 80);
	motionMove(new THREE.Vector3(pos.x + 65, pos.y + 20, pos.z - 15), new THREE.Vector3(pos.x + 65, pos.y + 15, pos.z - 80));
}

async function motionMove(position, target) {
	console.log(position);
	var dpos = {x:(position.x - camera.position.x)*1.0/2, y:(position.y - camera.position.y)*1.0/2, z:(position.z - camera.position.z)*1.0/2};
	var dposSign = {x:Math.sign(position.x - camera.position.x), y:Math.sign(position.y - camera.position.y), z:Math.sign(position.z - camera.position.z)};
	var dtar = {x:(target.x - controls.target.x)*1.0/2, y:(target.y - controls.target.y)*1.0/2, z:(target.z - controls.target.z)*1.0/2};
	var dtarSign = {x:Math.sign(target.x - controls.target.x), y:Math.sign(target.y - controls.target.y), z:Math.sign(target.z - controls.target.z)};
	while (dpos.x * dposSign.x > 0 || dpos.y * dposSign.y > 0 || dpos.z * dposSign.z > 0) {
		if (dpos.x * dposSign.x > 0) {camera.position.x += 2 * dposSign.x; dpos.x -= dposSign.x;}
		if (dpos.y * dposSign.y > 0) {camera.position.y += 2 * dposSign.y; dpos.y -= dposSign.y;}
		if (dpos.z * dposSign.z > 0) {camera.position.z += 2 * dposSign.z; dpos.z -= dposSign.z;}
		await sleep(1);
	}
	while (dtar.x * dtarSign.x > 0 || dtar.y * dtarSign.y > 0 || dtar.z * dtarSign.z > 0) {
		if (dtar.x * dtarSign.x > 0) {controls.target.x += 2 * dtarSign.x; dtar.x -= dtarSign.x;}
		if (dtar.y * dtarSign.y > 0) {controls.target.y += 2 * dtarSign.y; dtar.y -= dtarSign.y;}
		if (dtar.z * dtarSign.z > 0) {controls.target.z += 2 * dtarSign.z; dtar.z -= dtarSign.z;}
		await sleep(1);
	}
	//console.log("dpos: ", dpos);
	//console.log(camera.position);
}

document.getElementById("lookAtGamma3").addEventListener("click", viewGamma3);
document.getElementById("lookAtPannel").addEventListener("click", viewPannel);
document.getElementById("lookAtTabulatrice").addEventListener("click", viewTabulatrice);

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
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	let objects = [surLePanneau];
	const intersects = raycaster.intersectObjects( objects );
	if ( intersects.length > 0 ) 
		window.open('https://www.aconit.org/histoire/Gamma-3/Tableau_de_connexion/', '_blank');
	// Disable drawer drag
	selectedObject = null;
	// Enable camera controls
	controls.enabled = true;
}

function onMouseMove(e){
	hoverPannel(e);
	describeDrawer(e);
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

function hoverPannel(e){
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	let objects = [surLePanneau];
	const intersects = raycaster.intersectObjects( objects );
	if ( intersects.length > 0 ) {
		surLePanneau.material.visible = true;
		document.body.style.cursor = 'pointer';
		//console.log("intersect pannel");
	} else {
		surLePanneau.material.visible = false;
		document.body.style.cursor = 'default';
		//console.log("no intersection with pannel");
	}
}

function describeDrawer(e) {
	mouse.x = e.clientX + document.body.scrollLeft;
	mouse.y = e.clientY + document.body.scrollTop;

	let description = document.getElementById("drawerDescription");
	let objects = []
	for(let i = 0; i < drawers.length; i++){
		objects.push(...drawers[i].children);
	}

	// calculate drawers intersecting the picking ray
	const intersects = raycaster.intersectObjects( objects );

	if(intersects.length){ // If we have intersections with at least one drawer
		description.style.display = "block";
		description.style.top = mouse.y + "px";
		description.style.left = mouse.x + "px";
	} else {
		description.style.display = "none";
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
