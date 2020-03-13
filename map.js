"use strict";

var vmap;

function initMap() {
	vw.ol3.MapOptions = {
		basemapType: vw.ol3.BasemapType.GRAPHIC,
		controlsAutoArrange: true,
		controlDensity: vw.ol3.DensityType.EMPTY,
		interactionDensity: vw.ol3.DensityType.BASIC,
		homePosition: vw.ol3.CameraPosition,
		initPosition: vw.ol3.CameraPosition
	};

	vmap = new vw.ol3.Map("vmap", vw.ol3.MapOptions);
}

function fnMoveZoom() {
	zoom = vmap.getView().getZoom();
	if (16 > zoom) {
		vmap.getView().setZoom(14);
	}
};

function setMode(basemapType) {
	vmap.setBasemapType(basemapType);         
}

initMap();