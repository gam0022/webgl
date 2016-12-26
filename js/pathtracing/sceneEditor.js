if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP
					? this
						: oThis || window,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

Array.prototype.removeValue = function(value) {
	var index = this.indexOf(value);
	if (index !== -1) {
		this.splice(index, 1);
	}
	return this;
};

var SceneEditor = function( camera, canvas, scene, config ) {
	this.camera = camera;
	this.canvas = canvas;
	this.scene = scene;
	this.config = config;

	this.meshes = [];
	this.geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
	this.material = new THREE.MeshBasicMaterial( {
		color: 0x00ff00,
		wireframe: true,
		visible: false
	} );


	// TransformControls
	this.transformControls = new THREE.TransformControls( this.camera, this.canvas );
	this.scene.add( this.transformControls );
	//this.transformControls.addEventListener( 'mouseDown', function( e ) {} );
	//this.transformControls.addEventListener( 'mouseUp', function( e ) {} );
	//this.transformControls.addEventListener( 'change', function( e ) {} );
	this.transformControls.addEventListener( 'objectChange', this.onTransformControlsChange.bind( this ), false );


	// Raycaster
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	this.canvas.addEventListener( 'click', this.onCanvasClick.bind( this ), false );

	this.loadSceneJSON( presetScenes[config.preset]() );
};

SceneEditor.prototype.update = function() {
	createDynamicObjects();
	frame = 0;
};

SceneEditor.prototype.addMesh = function( mesh ) {
	this.meshes.push( mesh );
	this.scene.add( mesh );
};

SceneEditor.prototype.removeMesh = function( mesh ) {
	this.meshes.removeValue( mesh );
	this.scene.remove( mesh )
};

SceneEditor.prototype.removeAllMesh = function() {
	for( var i = 0, n = this.meshes.length; i < n; i++ ) {
		var mesh = this.meshes[n - i - 1];
		this.removeMesh( mesh );
	}
};

SceneEditor.prototype.loadObjectJSON = function( objectJSON ) {
	var mesh = new THREE.Mesh( this.geometry, this.material.clone() );
	mesh.userData.type = objectJSON.type;
	mesh.userData.material = objectJSON.material;
	mesh.position.set( objectJSON.position[0], objectJSON.position[1], objectJSON.position[2] );
	mesh.scale.set( objectJSON.scale[0], objectJSON.scale[1], objectJSON.scale[2] );
	this.addMesh( mesh );
	return mesh;
};

SceneEditor.prototype.loadSceneJSON = function( sceneJSON ) {
	for( var i = 0, l = sceneJSON.length; i < l; i++ ) {
		var objectJSON = sceneJSON[i];
		this.loadObjectJSON( objectJSON );
	}
};

SceneEditor.prototype.fixMeshesScale = function() {
	for( var i = 0, l = this.meshes.length; i < l; i++ ) {
		var mesh = this.meshes[i];

		if ( mesh.userData.type == "sphere" ) {
			mesh.scale.x = mesh.scale.z = mesh.scale.y;
		}
	}
};

SceneEditor.prototype.onTransformControlsChange = function() {
	this.fixMeshesScale();
	this.update();
};

SceneEditor.prototype.toggleTransformMode = function() {
	if ( this.transformControls.getMode() === "translate" ) {
		this.transformControls.setMode( "scale" );
	} else {
		this.transformControls.setMode( "translate" );
	}
};

SceneEditor.prototype.addObject = function( type ) {
	var mesh = this.loadObjectJSON( {
		type: type,
		material: {
			type: "MATERIAL_TYPE_GGX",
			color: "#ffffff",
			emission: "#000000",
			roughness: 0.2,
			refractiveIndex: 1.3,
			colorTexture: 0,
			emissionTexture: 0,
			roughnessTexture: 0,
		},
		position: [ 0.0, 1.0, 0.0 ],
		scale: [ 2.0, 2.0, 2.0 ],
	} );

	this.releaseObject();
	this.selectObject( mesh );
	this.update();
};


//
// Edit Object
//
SceneEditor.prototype.selectObject = function( object ) {
	object.material.visible = true;
	this.transformControls.detach( this.transformControls.object );
	this.transformControls.attach( object );

	this.config.objectType = object.userData.type;
	this.config.materialType = object.userData.material.type;
	this.config.materialColor = object.userData.material.color;
	this.config.materialEmission = object.userData.material.emission;
	this.config.materialRoughness = object.userData.material.roughness;
	this.config.materialRefractiveIndex = object.userData.material.refractiveIndex;

	this.config.materialColorTexture = object.userData.material.colorTexture;
	this.config.materialEmissionTexture = object.userData.material.emissionTexture;
	this.config.materialRoughnessTexture = object.userData.material.roughnessTexture;
};

SceneEditor.prototype.releaseObject = function( object ) {
	if ( !this.transformControls.object ) {
		return;
	}

	this.transformControls.object.material.visible = false;
	this.transformControls.detach( this.transformControls.object );
};

SceneEditor.prototype.onCanvasClick = function( e ) {
	this.mouse.x = ( e.offsetX / canvas.width ) * 2 - 1;
	this.mouse.y = - ( e.offsetY / canvas.height ) * 2 + 1;

	this.raycaster.setFromCamera( this.mouse, this.camera );
	var intersects = this.raycaster.intersectObjects( this.meshes );

	this.releaseObject();

	if ( intersects.length > 0 ) {
		// Select Object
		var clickedObject = intersects[0].object;
		if ( clickedObject && clickedObject !== this.transformControls.object ) {
			this.selectObject( clickedObject );
		}
	}
};

SceneEditor.prototype.updateSelectedObject = function( value, key1, key2 ) {
	var mesh = this.transformControls.object;

	if ( !mesh ) {
		alert( "先に Object を選択してください" );
		return;
	}

	if ( key2 ) {
		mesh.userData[key1][key2] = value;
	} else {
		mesh.userData[key1] = value;
	}

	this.update();
}

SceneEditor.prototype.fitToGroundSelectedObject = function() {
	var mesh = this.transformControls.object;

	if ( !mesh ) {
		alert( "先に Object を選択してください" );
		return;
	}

	mesh.position.y = mesh.scale.y * 0.5;
	this.transformControls.update();
	this.update();
};

SceneEditor.prototype.removeSelectedObject = function() {
	var mesh = this.transformControls.object;

	if ( !mesh ) {
		alert( "先に Object を選択してください" );
		return;
	}

	this.releaseObject();
	this.removeMesh( mesh );
	this.update();
};


//
// Create GLSL
//
SceneEditor.prototype.castFloat = function( value ) {
	return "float( " + value + " )";
};

SceneEditor.prototype.createShaderFromHex = function( hex, scale ) {
	var color = new THREE.Color( hex );
	return "vec3(" + this.castFloat( color.r * scale ) + ", " + this.castFloat( color.g * scale ) + ", " + this.castFloat( color.b * scale ) + " )";
};

SceneEditor.prototype.createShaderFromVector3 = function( vector ) {
	return "vec3(" + this.castFloat( vector.x ) + ", " + this.castFloat( vector.y ) + ", " + this.castFloat( vector.z ) + " )";
};

SceneEditor.prototype.createMaterialShaders = function( mesh, basename ) {
	var shader = "";
	shader += [
		basename + ".material.type = " + mesh.userData.material.type + ";",
		basename + ".material.color = " + this.createShaderFromHex( mesh.userData.material.color, 1.0 ) + ";",
		basename + ".material.emission = " + this.createShaderFromHex( mesh.userData.material.emission, 10.0 ) + ";",
		basename + ".material.roughness = " + this.castFloat( mesh.userData.material.roughness )  + ";",
		basename + ".material.refractiveIndex = " + this.castFloat( mesh.userData.material.refractiveIndex ) + ";",
		basename + ".material.colorTexture = " + mesh.userData.material.colorTexture + ";",
		basename + ".material.emissionTexture = " + mesh.userData.material.emissionTexture + ";",
		basename + ".material.roughnessTexture = " + mesh.userData.material.roughnessTexture + ";",
	].join( "\n" );
	return shader;
};

SceneEditor.prototype.createSceneIntersectShaders = function() {
	var shader = "";
	for( var i = 0, l = this.meshes.length; i < l; i++ ) {
		var mesh = this.meshes[i];
		switch( mesh.userData.type ) {
			case "sphere":
				shader += [
					this.createMaterialShaders( mesh, "sphere" ),
					"sphere.position = " + this.createShaderFromVector3( mesh.position ) + ";",
					"sphere.radius = " + this.castFloat( 0.5 * mesh.scale.y ) + ";",
					"intersectSphere( intersection, ray, sphere );",
				].join( "\n" );
				break;
			case "aabb":
				var offset = mesh.scale.clone().multiplyScalar( 0.5 );
				shader += [
					this.createMaterialShaders( mesh, "aabb" ),
					"aabb.lb = " + this.createShaderFromVector3( mesh.position.clone().sub( offset ) ) + ";",
					"aabb.rt = " + this.createShaderFromVector3( mesh.position.clone().add( offset ) ) + ";",
					"intersectAABB( intersection, ray, aabb );",
				].join( "\n" );
				break;
			default:
				console.log( "invalid userData.type: " + mesh.userData.type );
				break;
		}
	}
	return shader;
};

SceneEditor.prototype.createFragmentShader = function() {
	var float_fragment_shader_p1 = document.getElementById( "float_fragment_shader_p1" ).textContent;
	var float_fragment_shader_p2 = document.getElementById( "float_fragment_shader_p2" ).textContent;

	var intersectScene = [
		"void intersectScene( inout Intersection intersection, inout Ray ray ) {",
		"AABB aabb;",
		"Material distanceMaterial;",
		"Sphere sphere;",

		this.createSceneIntersectShaders(),
		"}",
	].join( "\n" );

	return float_fragment_shader_p1 + intersectScene + float_fragment_shader_p2;
};
