var SceneEditor = function( camera, canvas, scene ) {
	this.scene = scene;
	this.meshes = [];

	this.geometry = new THREE.CubeGeometry( 1, 1, 1 );
	this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

	// TransformControls
	this.transformControls = new THREE.TransformControls( camera, canvas );
	this.scene.add( this.transformControls );

	var mesh = new THREE.Mesh( this.geometry, this.material );
	mesh.userData.type = 'Shpere';
	mesh.userData.material = {
		type: 'MATERIAL_TYPE_GGX',
		color: '#808080',
		emission: '#000000',
	};
	this.scene.add( mesh );

	var mesh2 = new THREE.Mesh( this.geometry, this.material );
	mesh2.position.x = 2;
	mesh2.userData.type = 'Shpere';
	mesh2.userData.material = {
		type: 'MATERIAL_TYPE_GGX',
		color: '#808080',
		emission: '#000000',
	};
	this.scene.add( mesh2 );

	this.transformControls.attach( mesh );
	this.transformControls.update();
};

SceneEditor.prototype.loadJSON = function( jsonString ) {
};


SceneEditor.prototype.createFragmentShader = function () {
	var float_fragment_shader_p1 = document.getElementById( 'float_fragment_shader_p1' ).textContent;
	var float_fragment_shader_p2 = document.getElementById( 'float_fragment_shader_p2' ).textContent;

	var intersectScene = [
		'void intersectScene( inout Intersection intersection, inout Ray ray ) {',
		'AABB aabb;',
		'Material distanceMaterial;',
		'Sphere sphere;',

		'aabb.material.type = MATERIAL_TYPE_GGX;',
		'aabb.material.color = vec3( 0.9 );',
		'aabb.material.emission = vec3( 0.0 );',
		'aabb.lb = vec3( -5.0, -0.1, -5.0 );',
		'aabb.rt = vec3( 5.0, 0.0, 5.0 );',
		'intersectAABB( intersection, ray, aabb );',

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

		'}',
	].join( "\n" );

	return float_fragment_shader_p1 + intersectScene + float_fragment_shader_p2;
}
