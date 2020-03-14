"use strict";

var vmap, zoom;

var DEFAULT_ZOOM_LV = 18;
var DEFAULT_X = 14145614.802106937;
var DEFAULT_Y = 4492811.739768455;
var DEFAULT_INPUT_ADDR = "경기도 성남시 분당구 운중동";

var ADDR_API_URL = "https://api.vworld.kr/req/search";
var KEY = "D9946739-3E1E-3F78-BBEF-16009CEDDAC9";

function geoErr() {
	alert('좌표를 가져오는 중 오류가 발생했습니다.');
}

function initMap() {
	if (!navigator.geolocation) {
		alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.\r\n도표버전으로 되돌아갑니다.");
		location.href="/index";
	} else {

		vw.ol3.MapOptions = {
			basemapType: vw.ol3.BasemapType.GRAPHIC,
			controlsAutoArrange: true,
			controlDensity: vw.ol3.DensityType.EMPTY,
			interactionDensity: vw.ol3.DensityType.FULL,
			homePosition: vw.ol3.CameraPosition,
			initPosition: vw.ol3.CameraPosition
		};

		vmap = new vw.ol3.Map("vmap", vw.ol3.MapOptions);

		var options = {
			// 가능한 경우, 높은 정확도의 위치(예를 들어, GPS 등) 를 읽어오려면 true로 설정
			// 그러나 이 기능은 배터리 지속 시간에 영향을 미친다.
			enableHighAccuracy: true, // 대략적인 값이라도 상관 없음: 기본값

			// 위치 정보가 충분히 캐시되었으면, 이 프로퍼티를 설정하자,
			// 위치 정보를 강제로 재확인하기 위해 사용하기도 하는 이 값의 기본 값은 0이다.
			maximumAge: 15000, // 5분이 지나기 전까지는 수정되지 않아도 됨

			// 위치 정보를 받기 위해 얼마나 오랫동안 대기할 것인가?
			// 기본값은 Infinity이므로 getCurrentPosition()은 무한정 대기한다.
			timeout: 15000 // 15초 이상 기다리지 않는다.
		};

		navigator.geolocation.getCurrentPosition(function(pos) {
			console.log('pos: ', pos);

			var trPos = ol.proj.transform([pos.coords.longitude, pos.coords.latitude], 'EPSG:4326', 'EPSG:900913');
			console.log('trPos: ', trPos);

			move(trPos[0], trPos[1]);

		}, geoErr, options);
	}
}

function move(x,y) {
	var _center = [ x, y ];

	var pan = ol.animation.pan({
		duration : 2000,
		source : (vmap.getView().getCenter())
	});
	vmap.beforeRender(pan);
	vmap.getView().setCenter(_center);
	setTimeout("fnMoveZoom()", 200);
}

function fnMoveZoom() {
	zoom = vmap.getView().getZoom();
	if (DEFAULT_ZOOM_LV > zoom) {
		vmap.getView().setZoom(DEFAULT_ZOOM_LV);
	}
}

function search() {
	var keyword = $("#inputAddr").val().trim();
	keyword = keyword === "" && DEFAULT_INPUT_ADDR || keyword;

	var query = {
		key: KEY,
		request: 'search',
		errorFormat: 'json',
		query: keyword,
		type: 'PLACE',
		category: '0106'
	};

	$.getJSON(ADDR_API_URL, query, function(res) {
		console.log('res::: ', res);
	});

}

function testSearch() {
	var query = {
		key: KEY,
		request: 'search',
		errorFormat: 'json',
		query: '경기도 성남시 분당구 운중동',
		type: 'PLACE',
		category: '0106'
	};

	$.getJSON(ADDR_API_URL, query, function(res) {
		console.log('test res::: ', res);
	});
}

function testSearch2() {
	var query = {
		key: KEY,
		request: 'search',
		errorFormat: 'json',
		query: '경기도 성남시 분당구 운중동',
		type: 'ADDRESS',
		category: 'ROAD'
	};

	$.getJSON(ADDR_API_URL, query, function(res) {
		console.log('test2 res::: ', res);
	});
}

initMap();