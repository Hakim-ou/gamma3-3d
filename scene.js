import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { ColladaLoader } from './lib/ColladaLoader.js';

var camera, controls, scene, renderer;
var objects = [], bull2Scene, offY = - 20;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {
	console.log("init started..");
	scene = new THREE.Scene();
//	scene.background = new THREE.Color( "lightblue" );
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

  	// instantiate a loader
  	var loader = new ColladaLoader();

	loadCarcass(loader);

	loader.load( 'panneau.dae', // panneau de connexion

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
					//console.log('long ' + collada.scene.children.length);
			},
			// Function called when download progresses
			function (xhr) {
					console.log('panneau ' + (xhr.loaded / xhr.total * 100) + '% loaded');
			}
	);

	var offZ = 1.78;
    for (var i = 0; i < 14; i++)
         loadTiroir(loader, i*offZ);

	loadTiroir(loader);

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
	console.log("animate started..");
	requestAnimationFrame( animate );
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
console.log(camera.position) ;
	render();
}

function render() {
	renderer.render( scene, camera );
}

function loadCarcass(loader) {

	loader.load( 'carcasse.dae', // Gamma 3 et 

	    // Function when resource is loaded
	    function (collada) {
			scene.add(collada.scene) ;
			collada.scene.position.y += offY ;
			for(var i = 0 ; i < collada.scene.children.length ; i++){ objects.push(collada.scene.children[i]);} // 123 objects

			//console.log('long ' + collada.scene.children.length);
	    },
	    // Function called when download progresses
	    function (xhr) {
	        console.log('carcass ' + (xhr.loaded / xhr.total * 100) + '% loaded');
	    }
	);
}

function loadTiroir(loader) {

	loader.load( 'tiroir.dae', // Gamma 3 et 

	    // Function when resource is loaded
	    function (collada) {
			scene.add(collada.scene) ;
			collada.scene.position.y += offY ;
			collada.addEventListener(MouseEvent.MOUSE_DOWN, closeDrawer);
			//for(var i = 0 ; i < collada.scene.children.length ; i++){ objects.push(collada.scene.children[i]);} // 123 objects

			//console.log('long ' + collada.scene.children.length);
	    },
	    // Function called when download progresses
	    function (xhr) {
	        console.log('tiroir ' + (xhr.loaded / xhr.total * 100) + '% loaded');
	    }
	);
}

function closeDrawer(collada) {
	collada.scene.rotation.y = 0;
}
