"use strict";

var MAP_API_KEY = "D9946739-3E1E-3F78-BBEF-16009CEDDAC9";
var AUTH_DOM = "https://myblog.dogfootk.kro.kr/";

//var API_URL = "http://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=" + MAP_API_KEY + "&domain=" + AUTH_DOM;
var API_URL = "https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=" + MAP_API_KEY;
//var API_URL = "http://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=" + MAP_API_KEY;

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

function pages(data, textStatus, jqxhr) {
//	console.log('data: ', data);
//	console.log('textStatus: ', textStatus);
//	console.log('jqxhr: ', jqxhr);
	console.log('지도 로드 성공!');
	
	initMap();
}

function mapLoadFail(jqxhr, settings, exception) {
	console.error('jqxhr: ', jqxhr);
	console.error('settings: ', settings);
	console.error('exception: ', exception);
	
	alert('지도를 로드할 수 없습니다.');
}

$.getScript(API_URL)
	.done(pages)
	.fail(mapLoadFail);