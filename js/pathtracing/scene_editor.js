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
	var mesh = new THREE.Mesh( this.geometry, this.material.clone() );
	mesh.userData.type = "Sphere";
	mesh.userData.material = {
		type: "MATERIAL_TYPE_GGX",
		color: "#808080",
		emission: "#000000",
	};
	mesh.position.y = 0.5;
	//mesh.visible = false;
	this.addMesh( mesh );

	var mesh2 = new THREE.Mesh( this.geometry, this.material.clone() );
	mesh2.userData.type = "Sphere";
	mesh2.userData.material = {
		type: "MATERIAL_TYPE_REFRACTION",
		color: "#ffffff",
		emission: "#000000",
	};
	mesh2.position.x = 2;
	mesh2.position.y = 1;
	mesh2.scale.x = 2;
	mesh2.scale.y = 2;
	mesh2.scale.z = 2;
	this.addMesh( mesh2 );
};

SceneEditor.prototype.addMesh = function( mesh ) {
	this.meshes.push( mesh );
	this.scene.add( mesh );
};

SceneEditor.prototype.loadJSON = function( jsonString ) {
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

SceneEditor.prototype.createShaderFromHex = function( hex ) {
	var color = new THREE.Color( hex );
	return "vec3(" + color.r + ", " + color.g + ", " + color.b + " )";
}

SceneEditor.prototype.createShaderFromVector3 = function( vector ) {
	return "vec3(" + vector.x + ", " + vector.y + ", " + vector.z + " )";
}

SceneEditor.prototype.createSceneIntersectShaders = function() {
	var shader = "";
	for( var i = 0, l = this.meshes.length; i < l; i++ ) {
		var mesh = this.meshes[i];
		switch( mesh.userData.type ) {
			case "Sphere":
				shader += [
					"sphere.material.type = " + mesh.userData.material.type + ";",
					"sphere.material.color = " + this.createShaderFromHex( mesh.userData.material.color ) + ";",
					"sphere.material.emission = " + this.createShaderFromHex( mesh.userData.material.emission ) + ";",
					"sphere.position = " + this.createShaderFromVector3( mesh.position ) + ";",
					"sphere.radius = " + ( 0.5 * mesh.scale.x ).toFixed(2) + ";",
					"intersectSphere( intersection, ray, sphere );",
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

		"aabb.material.type = MATERIAL_TYPE_GGX;",
		"aabb.material.color = vec3( 0.9 );",
		"aabb.material.emission = vec3( 0.0 );",
		"aabb.lb = vec3( -5.0, -0.1, -5.0 );",
		"aabb.rt = vec3( 5.0, 0.0, 5.0 );",
		"intersectAABB( intersection, ray, aabb );",

		this.createSceneIntersectShaders(),

		/*
		aabb.material.type = MATERIAL_TYPE_GGX;
		aabb.material.color = vec3( 0.9 );
		aabb.material.emission = vec3( 0.0 );
		aabb.lb = vec3( -5.0, -0.1, -5.0 );
		aabb.rt = vec3( 5.0, 0.0, 5.0 );
		intersectAABB( intersection, ray, aabb );

		aabb.material.type = MATERIAL_TYPE_GGX_REFRACTION;
		aabb.lb = vec3( -4.0, 0.0, -4.0 );
		aabb.rt = vec3( -3.0, 1.0, -3.0 );
		intersectAABB( intersection, ray, aabb );

		distanceMaterial.type = MATERIAL_TYPE_DIFFUSE;
		distanceMaterial.color = vec3( 0.4, 0.4, 0.8 );
		distanceMaterial.emission = vec3( 0.0 );
		intersectDistanceFucntion( intersection, ray, distanceMaterial );

		sphere.material.emission = vec3( 0.0 );
		sphere.material.type = MATERIAL_TYPE_GGX_REFRACTION;
		sphere.material.color = vec3( 1.0, 1.0, 1.0 );
		sphere.position = vec3( -2.0, 0.7, 3.0 );
		sphere.radius = 0.7;
		intersectSphere( intersection, ray, sphere );
		*/

		"}",
	].join( "\n" );

	return float_fragment_shader_p1 + intersectScene + float_fragment_shader_p2;
}
