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

var SceneEditor = function( camera, canvas, scene ) {
	this.camera = camera;
	this.canvas = canvas;
	this.scene = scene;

	this.meshes = [];
	this.geometry = new THREE.CubeGeometry( 1, 1, 1 );
	this.material = new THREE.MeshBasicMaterial( {
		color: 0x00ff00,
		wireframe: true,
		visible: false
	} );

	// TransformControls
	this.transformControls = new THREE.TransformControls( this.camera, this.canvas );
	this.scene.add( this.transformControls );

	// Raycaster
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	// Init Scene
	var ground = new THREE.Mesh( this.geometry, this.material.clone() );
	ground.userData.type = "aabb";
	ground.userData.material = {
		type: "MATERIAL_TYPE_GGX",
		color: "#e6e6e6",
		emission: "#000000",
		roughness: 0.9,
		refractiveIndex: 1.3,
	};
	ground.position.y = -0.05;
	ground.scale.x = 10;
	ground.scale.y = 0.1;
	ground.scale.z = 10;
	this.addMesh( ground );

	var sphere = new THREE.Mesh( this.geometry, this.material.clone() );
	sphere.userData.type = "sphere";
	sphere.userData.material = {
		type: "MATERIAL_TYPE_GGX",
		color: "#808080",
		emission: "#000000",
		roughness: 0.3,
		refractiveIndex: 1.3,
	};
	sphere.position.y = 0.5;
	this.addMesh( sphere );

	var sphere2 = new THREE.Mesh( this.geometry, this.material.clone() );
	sphere2.userData.type = "sphere";
	sphere2.userData.material = {
		type: "MATERIAL_TYPE_REFRACTION",
		color: "#ffffff",
		emission: "#000000",
		roughness: 0.3,
		refractiveIndex: 1.3,
	};
	sphere2.position.x = 2;
	sphere2.position.y = 1;
	sphere2.scale.x = 2;
	sphere2.scale.y = 2;
	sphere2.scale.z = 2;
	this.addMesh( sphere2 );
};

SceneEditor.prototype.addMesh = function( mesh ) {
	this.meshes.push( mesh );
	this.scene.add( mesh );
};

SceneEditor.prototype.loadJSON = function( jsonString ) {
};

SceneEditor.prototype.toggleTransformMode = function() {
	if ( this.transformControls.getMode() === "translate" ) {
		this.transformControls.setMode( "scale" );
	} else {
		this.transformControls.setMode( "translate" );
	}
};

SceneEditor.prototype.onCanvasClick = function( e ) {
	this.mouse.x = ( e.offsetX / canvas.width ) * 2 - 1;
	this.mouse.y = - ( e.offsetY / canvas.height ) * 2 + 1;

	this.raycaster.setFromCamera( this.mouse, this.camera );
	var intersects = this.raycaster.intersectObjects( this.meshes );
	console.log( intersects );

	if ( this.transformControls.object ) {
		this.transformControls.object.material.visible = false;
		this.transformControls.detach( this.transformControls.object );
	}

	if ( intersects.length > 0 && intersects[0] !== this.transformControls.object ) {
		intersects[0].object.material.visible = true;
		this.transformControls.detach( this.transformControls.object );
		this.transformControls.attach( intersects[0].object );
	}
}

SceneEditor.prototype.castFloat = function( value ) {
	return "float( " + value + " )";
}

SceneEditor.prototype.createShaderFromHex = function( hex, scale ) {
	var color = new THREE.Color( hex );
	return "vec3(" + this.castFloat( color.r * scale ) + ", " + this.castFloat( color.g * scale ) + ", " + this.castFloat( color.b * scale ) + " )";
}

SceneEditor.prototype.createShaderFromVector3 = function( vector ) {
	return "vec3(" + this.castFloat( vector.x ) + ", " + this.castFloat( vector.y ) + ", " + this.castFloat( vector.z ) + " )";
}

SceneEditor.prototype.createMaterialShaders = function( mesh, basename ) {
	var shader = "";
	shader += [
		basename + ".material.type = " + mesh.userData.material.type + ";",
		basename + ".material.color = " + this.createShaderFromHex( mesh.userData.material.color, 1.0 ) + ";",
		basename + ".material.emission = " + this.createShaderFromHex( mesh.userData.material.emission, 5.0 ) + ";",
		basename + ".material.roughness = " + this.castFloat( mesh.userData.material.roughness )  + ";",
		basename + ".material.refractiveIndex = " + this.castFloat( mesh.userData.material.refractiveIndex ) + ";",
	].join( "\n" );
	return shader;
}

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
}

SceneEditor.prototype.createFragmentShader = function() {
	var float_fragment_shader_p1 = document.getElementById( "float_fragment_shader_p1" ).textContent;
	var float_fragment_shader_p2 = document.getElementById( "float_fragment_shader_p2" ).textContent;

	var intersectScene = [
		"void intersectScene( inout Intersection intersection, inout Ray ray ) {",
		"AABB aabb;",
		"Material distanceMaterial;",
		"Sphere sphere;",

		/*
		"aabb.material.type = MATERIAL_TYPE_GGX;",
		"aabb.material.color = vec3( 0.9 );",
		"aabb.material.emission = vec3( 0.0 );",
		"aabb.material.roughness = 0.3;",
		"aabb.material.refractiveIndex = 1.3;",
		"aabb.lb = vec3( -5.0, -0.1, -5.0 );",
		"aabb.rt = vec3( 5.0, 0.0, 5.0 );",
		"intersectAABB( intersection, ray, aabb );",
		*/

		this.createSceneIntersectShaders(),
		"}",
	].join( "\n" );

	return float_fragment_shader_p1 + intersectScene + float_fragment_shader_p2;
}
