var xmasMessage = {
	text : "Feliz Navidad\nles desea I + D\nPrides",
	height : 2,
	size : 18,
	hover : 10,
	curveSegments : 4,
	bevelThickness : 2,
	bevelSize : 1.5,
	bevelSegments : 3,
	bevelEnabled : true,
	font : undefined,
	fontName : "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
	fontWeight : "regular", // regular bold
	mirror : false,
	fontMap : {
				"helvetiker": 0,
				"optimer": 1,
				"gentilis": 2,
				"droid/droid_sans": 3,
				"droid/droid_serif": 4
			},
	weightMap : {
		"regular": 0,
		"bold": 1
	},	
	reverseFontMap : [],
	reverseWeightMap : [],
	permalink:{},
	
	
	decimalToHex:function ( d ) {
		var hex = Number( d ).toString( 16 );
		hex = "000000".substr( 0, 6 - hex.length ) + hex;
		return hex.toUpperCase();
	},
	
	init:function () {
				
		for ( var i in this.fontMap ) this.reverseFontMap[ this.fontMap[i] ] = i;
		for ( var i in this.weightMap ) this.reverseWeightMap[ this.weightMap[i] ] = i;
		
		var targetRotation = 0;
		var targetRotationOnMouseDown = 0;
		var mouseX = 0;
		var mouseXOnMouseDown = 0;
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
		var fontIndex = 1;
		
		var hash = (window.ahash == undefined ? "" :window.ahash )
		if ( hash.length !== 0 ) {
			var colorhash  = hash.substring( 0, 6 );
			var fonthash   = hash.substring( 6, 7 );
			var weighthash = hash.substring( 7, 8 );
			var bevelhash  = hash.substring( 8, 9 );
			var texthash   = hash.substring( 10 );
			this.hex = colorhash;			
			this.fontName = this.reverseFontMap[ parseInt( fonthash ) ];
			this.fontWeight = this.reverseWeightMap[ parseInt( weighthash ) ];
			this.bevelEnabled = parseInt( bevelhash );
			this.text = decodeURI( texthash );
			this.updatePermalink();
		} else {
			pointLight.color.setHSL( 0.1, 1, 1 );
			this.hex = this.decimalToHex( pointLight.color.getHex() );
		}
		materials = [
			new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
			new THREE.MeshPhongMaterial( { color: 0x94a9ff } ) // side
		];
		
		this.group = new THREE.Group();
		this.group.position.y = 100;
				
		this.loadFont();
		
		var plane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 100, 100 ),
			new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 1, transparent: true } )
		);
		
		plane.position.y = 100;
		plane.rotation.x = - Math.PI / 2;		
		
		// RENDERER		
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		
				
	},
	
	boolToNum: function ( b ) {
		return b ? 1 : 0;
	},
	
	updatePermalink:function () {
		var link = this.hex + this.fontMap[ this.fontName ] + this.weightMap[ this.fontWeight ] + this.boolToNum( this.bevelEnabled ) + "#" + encodeURI( this.text );
		this.permalink.href = "#" + link;
		window.ahash = link;
	},
	
	loadFont:function () {
		var loader = new THREE.FontLoader();
		loader.load( 'fonts/' + this.fontName + '_' + this.fontWeight + '.typeface.json', function ( response ) {
			xmasMessage.font = response;
			xmasMessage.refreshText();
		} );
	},
	
	createText:function () {
		textGeo = new THREE.TextGeometry( this.text, {
			font: this.font,
			size: this.size,
			height: this.height,
			curveSegments: this.curveSegments,
			bevelThickness: this.bevelThickness,
			bevelSize: this.bevelSize,
			bevelEnabled: this.bevelEnabled,
			material: 0,
			extrudeMaterial: 1
		});
		textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();
		
		if ( ! this.bevelEnabled ) {
			var triangleAreaHeuristics = 0.1 * ( this.height * this.size );
			for ( var i = 0; i < textGeo.faces.length; i ++ ) {
				var face = textGeo.faces[ i ];
				if ( face.materialIndex == 1 ) {
					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
						face.vertexNormals[ j ].z = 0;
						face.vertexNormals[ j ].normalize();
					}
					var va = textGeo.vertices[ face.a ];
					var vb = textGeo.vertices[ face.b ];
					var vc = textGeo.vertices[ face.c ];
					var s = THREE.GeometryUtils.triangleArea( va, vb, vc );
					if ( s > triangleAreaHeuristics ) {
						for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
							face.vertexNormals[ j ].copy( face.normal );
						}
					}
				}
			}
		}
		var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
		this.textMesh1 = new THREE.Mesh( textGeo, materials );
		this.textMesh1.position.x = 80;
		this.textMesh1.position.y = this.hover;
		this.textMesh1.position.z = 0;
		this.textMesh1.rotation.x = 0;
		this.textMesh1.rotation.y = Math.PI * 2;
		this.group.add( this.textMesh1 );
		if ( !this.mirror ) {
			this.textMesh2 = new THREE.Mesh( textGeo, materials );
			this.textMesh2.position.x = -80;
			this.textMesh2.position.y = this.hover;
			this.textMesh2.position.z = this.height;
			this.textMesh2.rotation.y = Math.PI;
			this.textMesh2.rotation.z = Math.PI * 2;
			this.group.add( this.textMesh2 );
		}
	},
	
	refreshText:function () {
		xmasMessage.updatePermalink();
		xmasMessage.group.remove( xmasMessage.textMesh1 );
		if ( xmasMessage.mirror ) 
			xmasMessage.group.remove( xmasMessage.textMesh2 );
		if ( !xmasMessage.text ) return;
			xmasMessage.createText();
	},
	
	animate:function () {
		requestAnimationFrame( xmasMessage.animate );
		xmasMessage.render();		
	},
	
	render:function () {
		group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;		
		renderer.clear();
		renderer.render( scene, camera );
	}
}