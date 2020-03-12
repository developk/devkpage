"use strict";

var mapController;

function initMap() {
	vw.MapControllerOption = {
		container: "vmap",
		mapMode: "2d-map",
		basemapType: vw.ol3.BasemapType.GRAPHIC,
		controlDensity: vw.ol3.DensityType.EMPTY,
		interactionDensity: vw.ol3.DensityType.BASIC,
		controlsAutoArrange: true,
		homePosition: vw.ol3.CameraPosition,
		initPosition: vw.ol3.CameraPosition,
	};

	mapController = new vw.MapController(vw.MapControllerOption);
}

initMap();