var presetScenes = {
	basic: function() {
		return [
			{
				type: "aabb",
				material: {
					type: "MATERIAL_TYPE_GGX",
					color: "#ffffff",
					emission: "#000000",
					roughness: 0.9,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,

				},
				position: [ 0.0, -0.05, 0.0 ],
				scale: [ 10.0, 0.1, 10.0 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_GGX",
					color: "#ff0707",
					colorTexture: 0,
					emission: "#000000",
					roughness: 0.2,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,
				},
				position: [ 0.0, 0.9, 0.0 ],
				scale: [ 1.8, 1.8, 1.8 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_GGX",
					color: "#50f0f0",
					colorTexture: 0,
					emission: "#111122",
					roughness: 0.5,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.earth_inverse,
					roughnessTexture: textureChoices.none,
				},
				position: [ -3.5, 0.8, 0.0 ],
				scale: [ 1.6, 1.6, 1.6 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_REFRACTION",
					color: "#ffffff",
					colorTexture: 0,
					emission: "#000000",
					roughness: 0.3,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,
				},
				position: [ 4.0, 0.7, 0.0 ],
				scale: [ 1.4, 1.4, 1.4 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_SPECULAR",
					color: "#ffffff",
					colorTexture: 0,
					emission: "#000000",
					roughness: 0.3,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,
				},
				position: [ -2.5, 0.7, -2.0 ],
				scale: [ 1.4, 1.4, 1.4 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_GGX_REFRACTION",
					color: "#ffffff",
					colorTexture: 0,
					emission: "#000000",
					roughness: 0.3,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,
				},
				position: [ 2.0, 0.7, 1.0 ],
				scale: [ 1.4, 1.4, 1.4 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_DIFFUSE",
					color: "#4b2d0e",
					colorTexture: 0,
					emission: "#000000",
					roughness: 0.3,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,
				},
				position: [ 2.0, 0.7, 1.0 ],
				scale: [ 0.5, 0.5, 0.5 ],
			},
			{
				type: "aabb",
				material: {
					type: "MATERIAL_TYPE_GGX_REFRACTION",
					color: "#ffffff",
					colorTexture: 0,
					emission: "#4a4713",
					roughness: 0.15,
					refractiveIndex: 1.6,
					colorTexture: textureChoices.none,
					emissionTexture: textureChoices.earth_inverse,
					roughnessTexture: textureChoices.none,
				},
				position: [ 0.0, 2.0, -4.0 ],
				scale: [ 8.0, 4.0, 0.1 ],
			},
		];
	},

	table: function() {
		var tableMaterial = {
			type: "MATERIAL_TYPE_GGX",
			color: "#79520b",
			emission: "#000000",
			roughness: 0.1,
			refractiveIndex: 1.3,
			colorTexture: textureChoices.none,
			emissionTexture: textureChoices.none,
			roughnessTexture: textureChoices.none,
		};
		var tableSizeA = 2.0;
		var tableSizeB = 1.5;
		var tableSizeC = 0.2;
		var tableSizeD = 2.4;

		var scene = [
			{
				type: "aabb",
				material: {
					type: "MATERIAL_TYPE_GGX",
					color: "#ffffff",
					emission: "#000000",
					roughness: 0.4,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.checkered,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.checkered,

				},
				position: [ 0.0, -0.05, 0.0 ],
				scale: [ 10.0, 0.1, 10.0 ],
			},
			{
				type: "sphere",
				material: {
					type: "MATERIAL_TYPE_GGX",
					color: "#ff5050",
					colorTexture: 0,
					emission: "#000000",
					roughness: 0.2,
					refractiveIndex: 1.3,
					colorTexture: textureChoices.gam0022,
					emissionTexture: textureChoices.none,
					roughnessTexture: textureChoices.none,
				},
				position: [ 0.0, tableSizeB + tableSizeC + 0.9, 0.0 ],
				scale: [ 1.8, 1.8, 1.8 ],
			},

			// table
			{
				type: "aabb",
				material: tableMaterial,
				position: [ -tableSizeA, 0.5 * tableSizeB, -tableSizeA ],
				scale: [ tableSizeC, tableSizeB, tableSizeC ],
			},
			{
				type: "aabb",
				material: tableMaterial,
				position: [ -tableSizeA, 0.5 * tableSizeB, tableSizeA ],
				scale: [ tableSizeC, tableSizeB, tableSizeC ],
			},
			{
				type: "aabb",
				material: tableMaterial,
				position: [ tableSizeA, 0.5 * tableSizeB, -tableSizeA ],
				scale: [ tableSizeC, tableSizeB, tableSizeC ],
			},
			{
				type: "aabb",
				material: tableMaterial,
				position: [ tableSizeA, 0.5 * tableSizeB, tableSizeA ],
				scale: [ tableSizeC, tableSizeB, tableSizeC ],
			},
			{
				type: "aabb",
				material: tableMaterial,
				position: [ 0, tableSizeB + 0.5 * tableSizeC, 0 ],
				scale: [ tableSizeD * tableSizeA, tableSizeC, tableSizeD * tableSizeA ],
			},
		];

		return scene;
	},
};
