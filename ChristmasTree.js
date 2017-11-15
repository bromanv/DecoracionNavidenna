/**
 *Based on Christmas tree with three.js
 */
var xmasTree = {
	camera: null,
	scene: null,
	renderer: null,
	group: null,
	targetRotation: 0,
	targetRotationOnMouseDown: 0,
	mouseX: 0,
	mouseXOnMouseDown: 0,
	windowHalfX: 640 / 2,
	windowHalfY: 480 / 2,
	materials: [],
	addBranch: function(count, x, y, z, opts, material, rotate) {
		// prepare star-like points
		var points = [],
			l;
		for (i = 0; i < count * 2; i++) {
			if (i % 2 == 1) {
				l = count * 2;
			} else {
				l = count * 4;
			}
			var a = i / count * Math.PI;
			points.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));

			if (rotate && i % 2 == 0) {
				var sphGeometry = new THREE.SphereGeometry(8);
				sphMesh = new THREE.Mesh(sphGeometry, this.materials[0]);
				sphMesh.position.set(Math.cos(a) * l * 1.25, y, Math.sin(a) * l * 1.25);
				this.three.add(sphMesh);
			}
		}

		var branchShape = new THREE.Shape(points);
		var branchGeometry = new THREE.ExtrudeGeometry(branchShape, opts);
		var branchMesh = new THREE.Mesh(branchGeometry, material);

		branchMesh.position.set(x, y, z);

		// rotate 90 degrees
		if (rotate) {
			branchMesh.rotation.set(Math.PI / 2, 0, 0);
		} else {
			branchMesh.rotation.set(0, 0, Math.PI / 2);
		}

		// add branch to the group
		this.three.add(branchMesh);
	},

	init: function() {
		if (this.group == null) {

			THREE.ImageUtils.crossOrigin = '';
			// initialize the scene
			this.scene = new THREE.Scene();

			// set the camera
			this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
			this.camera.position.set(0, 100, 500);
			this.scene.add(this.camera);

			// create the empty scene group
			this.group = new THREE.Object3D();
			this.scene.add(this.group);

			// prepare materials
			var imgTexture = THREE.ImageUtils.loadTexture('texture.jpg');
			imgTexture.repeat.set(1, 1);
			imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
			imgTexture.anisotropy = 16;
			imgTexture.needsUpdate = true;

			var shininess = 50,
				specular = 0x333333,
				bumpScale = 1,
				shading = THREE.SmoothShading;

			this.materials.push(new THREE.MeshPhongMaterial({
				map: imgTexture,
				bumpMap: imgTexture,
				bumpScale: bumpScale,
				color: 0xff0000,
				ambient: 0xffffff,
				specular: specular,
				shininess: shininess,
				shading: shading
			}));
			this.materials.push(new THREE.MeshPhongMaterial({
				map: imgTexture,
				color: 0x008800,
				ambient: 0xffffff,
				specular: specular,
				shininess: shininess,
				shading: shading
			}));
			this.materials.push(new THREE.MeshPhongMaterial({
				map: imgTexture,
				color: 0x584000,
				ambient: 0xffffff,
				shading: shading
			}));
			this.materials.push(new THREE.MeshPhongMaterial({
				map: imgTexture,
				color: 0xff0000,
				ambient: 0xffffff,
				shading: shading
			}));

			// add the Trunk
			var trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 50, 300, 30, 1, false), this.materials[2]);
			this.three = new THREE.Object3D();
			this.three.add(trunk);

			// add branch function
			// options
			var options = {
				amount: 6,
				bevelEnabled: true,
				bevelSegments: 5,
				steps: 2
			};

			// add 10 branches
			var iBranchCnt = 14;
			for (i1 = 0; i1 < iBranchCnt; i1++) {
				this.addBranch(iBranchCnt + 3 - i1, 0, -125 + i1 * 20, 0, options, this.materials[1], true);
			}

			// add the star
			var starOpts = {
				amount: 4,
				bevelEnabled: false
			};
			this.addBranch(5, 0, 160, -2, starOpts, this.materials[3], false);
			this.group.add(this.three);

			// add snowflakes
			var sfMats = [];
			var sfTexture = THREE.ImageUtils.loadTexture('snowflake.png');
			var sfGeometry = new THREE.Geometry();
			for (i = 0; i < 10000; i++) {
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 2000 - 1000;
				vertex.y = Math.random() * 2000 - 1000;
				vertex.z = Math.random() * 2000 - 1000;

				sfGeometry.vertices.push(vertex);
			}

			var states = [
				[
					[1.0, 0.2, 0.9], sfTexture, 10
				],
				[
					[0.90, 0.1, 0.5], sfTexture, 8
				],
				[
					[0.80, 0.05, 0.5], sfTexture, 5
				]
			];
			this.snowflakes = new THREE.Object3D();

			for (i = 0; i < states.length; i++) {
				color = states[i][0];
				sprite = states[i][1];
				size = states[i][2];

				sfMats[i] = new THREE.ParticleSystemMaterial({
					size: size,
					map: sprite,
					blending: THREE.AdditiveBlending,
					depthTest: false,
					transparent: true
				});
				sfMats[i].color.setHSL(color[0], color[1], color[2]);

				particles = new THREE.ParticleSystem(sfGeometry, sfMats[i]);

				particles.rotation.x = Math.random() * 10;
				particles.rotation.y = Math.random() * 10;
				particles.rotation.z = Math.random() * 10;

				this.snowflakes.add(particles);
			}
			this.group.add(this.snowflakes);

			// Add lights:

			// add ambient (global) light
			this.scene.add(new THREE.AmbientLight(0xffffff, 1));

			// add particle of light
			this.particleLight = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10), new THREE.MeshBasicMaterial({
				color: 0xffffff
			}));
			this.particleLight.position.y = 250;
			//this.three.add(this.particleLight);

			// add flying pint light
			pointLight = new THREE.PointLight(0xffffff, 1, 1000, 2);
			this.three.add(pointLight);

			pointLight.position = this.particleLight.position;

			// add directional blue light
			var directionalLight = new THREE.DirectionalLight(0x0000ff, 2);
			directionalLight.position.set(10, 1, 1).normalize();
			this.group.add(directionalLight);

			// prepare the render object and render the scene
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});

			this.renderer.setClearColor(new THREE.Color('lightgrey'), 0);
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.domElement.style.position = 'absolute'
			this.renderer.domElement.style.top = '0px'
			this.renderer.domElement.style.left = '0px'
			document.body.appendChild(this.renderer.domElement)
			
			///imagenes
			var imgs = 
			[
				"aaron.jpg",
				"ana.jpg",
				"andres.jpg",
				"byron.jpg",
				"esteban.jpg",
				"jordan.jpg",				
				"kevin.jpg",
				"luisDiego.jpg",
				"ronald.jpg",								
				"ronny.jpg",
				"rene.jpg",
				"walter.jpg",
				"william.jpg",
				/*
				"william.jpg",
				"walter.jpg",
				"ronny.jpg",
				"ronny.jpg",
				"ronald.jpg",								
				"kevin.jpg",				
				"jordan.jpg",
				"luisDiego.jpg",
				"esteban.jpg",
				"byron.jpg",
				"andres.jpg",
				"ana.jpg",
				"aaron.jpg"*/
			];
			/*var cuadros = [	
				{x: 169, z: 0},
				{x: 149.0891671450028, z: -55.44434726459726}
				{x: 149.64206833539248, z: 78.53821607539689}
				{x: 126.49831644091608, z: -112.06772924269438}
				{x: 96.00294219756533, z: 139.08427333602793}
				{x: 59.92822591018851, z: -158.0177450138351}
				{x: 20.37069896314959, z: 167.7677997225711}
				{x: -20.370698963149568, z: -167.7677997225711}
				{x: -59.92822591018853, z: 158.0177450138351}
				{x: -96.00294219756532, z: -139.08427333602793}
				{x: -126.49831644091611, z: 112.06772924269438}
				{x: -149.64206833539245, z: -78.5382160753969}
				{x: -164.0891671450028, z: 40.44434726459725}
			];*/
			
			var cuadros = [	
				{x: 0, z: 2},//1
				{x: 0.9, z: 1.8},
				{x: 1.6, z:  1.2},
				{x: 2, z: 0.4},
				{x: 2, z: -0.4},
				{x: 1.6, z: -1.3},
				{x: 0.9, z: -1.8},
				{x: 0, z: -2},
				{x: -0.9, z: -1.8},
				{x: -1.6, z:  -1.3},
				{x: -2, z: -0.5},
				{x: -2, z: 0.4},
				{x: -1.6, z:  1.2},
				{x: -0.9, z: -1.8},
				
				{x: 169, z: 0},
			];
			var l = imgs.length*2;
			var m=70;
			for(var pos  in imgs)
			{
				var img = new THREE.MeshBasicMaterial({ 
							map:THREE.ImageUtils.loadTexture('img/'+imgs[pos])
				});
				img.map.needsUpdate = true;
				var a = pos / imgs.length * Math.PI
				var plane = new THREE.Mesh(new THREE.BoxGeometry(50,50,50),img);
				plane.overdraw = true;
				plane.rotateY(-0.05);
				//plane.position.set(( pos%2?-1:1)*Math.cos(a) * l * 1.25+(100*( pos%2?-1:1)), -125+(12*pos),  (pos%2?-1:1)*Math.sin(a) * l * 1.25);
				//console.log(imgs[pos]+"-> x:"+(Math.cos(a) * l * 6.5)+" z:"+((pos%2?-1:1) * Math.sin(a) * l * 6.5));
				//cuadros.push( { x: Math.cos(a) * l * 6.5 +( pos ==1?-15:0), z: (pos%2?-1:1) * Math.sin(a) * l * 6.5+( pos ==1?-15:0)});
				plane.position.set(cuadros[pos].x*m, -100,  cuadros[pos].z*m);
				this.three.add(plane);			
			}
			console.log(cuadros);
			
		}
	},

	animate: function() {
		requestAnimationFrame(xmasTree.animate);
		xmasTree.render();
	},
	render: function() {
		var timer = Date.now() * 0.00025;
		xmasTree.three.rotateY(0.005);

		xmasTree.snowflakes.position.y -= 1;
		if (xmasTree.snowflakes.position.y < -800)
			xmasTree.snowflakes.position.y = 0;
		xmasTree.camera.lookAt(xmasTree.scene.position);

		if(xmasMessage)
			xmasMessage.group.rotateY(0.005);
		xmasTree.renderer.render(xmasTree.scene, xmasTree.camera);
	}
}