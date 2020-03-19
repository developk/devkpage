"use strict";

var vmap, zoom, markerLayer,
	DEFAULT_ZOOM_LV = 18;

var SEARCH_TYPE = {
	"PLACE": "PLACE",
	"ADDRESS": "ADDRESS"
};

var ADDR_SEARCH_TYPE = {
	"PARCEL": "PARCEL",
	"ROAD": "ROAD"
};

function geoErr() {
	alert('좌표를 가져오는 중 오류가 발생했습니다.');
}

function initMap() {
	if (!navigator.geolocation) {
		alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.\r\n도표버전으로 되돌아갑니다.");
		location.href="/index";
	} else {

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

			var mecator_1_pos = ol.proj.transform([pos.coords.longitude, pos.coords.latitude], GPS_TYPE.WGS84, GPS_TYPE.Mercator_1);
			// console.log('mecator_1_pos: ', mecator_1_pos);

			// move(mecator_1_pos[0], mecator_1_pos[1]);

			var initPosition = {
				center: mecator_1_pos,
				zoom: DEFAULT_ZOOM_LV
			};

			vw.ol3.MapOptions = {
				basemapType: vw.ol3.BasemapType.GRAPHIC,
				controlsAutoArrange: true,
				controlDensity: vw.ol3.DensityType.EMPTY,
				interactionDensity: vw.ol3.DensityType.FULL,
				homePosition: vw.ol3.CameraPosition,
				initPosition: initPosition
			};

			vmap = new vw.ol3.Map("vmap", vw.ol3.MapOptions);


			setTimeout("drawLayer()", 200);
		}, geoErr, options);
	}
}

function move(x,y) {
	var _center = [ x, y ];

	var pan = ol.animation.pan({
		duration : 150,
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
	setTimeout("drawLayer()", 200);
}

function drawLayer() {
	var centerPos = vmap.getView().getCenter();
	var wgs84_pos = ol.proj.transform(centerPos, GPS_TYPE.Mercator_1, GPS_TYPE.WGS84);
	console.log('drawLayer::: ', wgs84_pos);

	var url = API_SERVER.concat("/").concat(API_VERSION);

	var query = {
		lng: wgs84_pos[0],
		lat: wgs84_pos[1],
		m: 1000
	};

	url = url.concat("/").concat(API_STORE_BY_GEO);
	getLists(url, query);
}

function search() {
	var keyword = $("#inputAddr").val().trim();
	keyword = keyword === "" && DEFAULT_INPUT_ADDR || keyword;

	var query = {
		key: GEO_KEY,
		service: 'address',
		version: '2.0',
		request: 'GetCoord',
		errorFormat: 'json',
		// refine: "false",
		address: keyword,
		type: ADDR_SEARCH_TYPE.PARCEL,
		simple: true,
		crs: GPS_TYPE.Mercator_1
		// callback: "handleSearchResult"
	};

	var url = GEO_API_URL.concat("/").concat(GEO_ADDR_URL);

	$.getJSON(url, query, handleSearchResult);

}

function searchPlace() {

	var keyword = $("#inputAddr").val().trim();
	keyword = keyword === "" && DEFAULT_INPUT_ADDR || keyword;

	var query = {
		key: GEO_KEY,
		request: 'search',
		errorFormat: 'json',
		query: keyword,
		type: SEARCH_TYPE.PLACE,
		// category: ADDR_SEARCH_TYPE.PARCEL,
		crs: GPS_TYPE.Mercator_1
	};

	var url = GEO_API_URL.concat("/").concat(GEO_SEARCH_URL);

	$.getJSON(url, query, handleSearchPlaceResult);
}

function handleSearchResult(res) {
	// console.log('res::: ', res);
	var response = res.response;

	var status = response.status,
		result = response.result;

	if (status === "ERROR") {
		alert('검색중 오류가 발생했습니다.');
		return;
	} else if (status === "NOT_FOUND") {
		searchPlace();
		return;
	}

	var point = result.point;
	// console.log('point: ', point);

	move(point.x * 1, point.y * 1);
}

function handleSearchPlaceResult(res) {
	var response = res.response;
	var status = response.status,
		page = response.page,
		record = response.record,
		result = response.result;

	if (status === "ERROR") {
		alert('검색중 오류가 발생했습니다.');
		return;
	} else if (status === "NOT_FOUND") {
		alert('검색 결과가 없습니다.');
		return;
	}

	var point = result.items[0].point;

	move(point.x * 1, point.y * 1);

}

function showLoading(el) {
	$("#" + el).busyLoad("show", {
		fontawesome: "fa fa-spinner fa-spin fa-3x fa-fw",
		animation: 'fade'
	});
}

function hideLoading(el) {
	$("#" + el).busyLoad("hide", {
		animation: "fade"
	});
}

function getLists(url, searchParams) {
	showLoading("vmap");
	$.getJSON(url, searchParams, handleStoresResults);
}

function handleStoresResults(res) {
	hideLoading("vmap");
	console.log('res::: ', res);

	var address = res.address;

	var stores = _.chain(res.stores)
		.filter({
			'type': '01'
		}) // 약국만을 대상 우체극(02), 농협(03)
		.filter(function (obj) {
			return obj.created_at !== null;
		}) // 데이터 생성일자가 없는 데이터는 신뢰하지 않음
		.filter(function (obj) {
			return (_.has(obj, 'stock_at') && _.has(obj, 'remain_stat'));
		}) // 필수 프로퍼티 체크
		.value();


	if (!markerLayer) {

		var mecator_1_pos = ol.proj.transform([stores[0].lng, stores[0].lat], GPS_TYPE.WGS84, GPS_TYPE.Mercator_1);

		move(mecator_1_pos[0], mecator_1_pos[1]);

		addMarkerLayer();
	}

	_.each(stores, function(store) {
		addMarker(store);
	});
}

function addMarkerLayer() {
	if (markerLayer != null) {
		removeAllMarker();
		markerLayer = null;
	}

	markerLayer = new vw.ol3.layer.Marker(vmap);
	vmap.addLayer(markerLayer);

	markerLayer.setZIndex(999);
}

function addMarker(store) {
	var toDay = moment().startOf('day');

	var stock_at = store.stock_at || '-';
	var stockDate = (stock_at !== '-') ? moment(stock_at, "YYYY/MM/DD HH:mm:ss") : null;

	// 같은 날 입고되었다면,
	var sAt = stockDate !== null ? toDay.isSame(stockDate, 'day') : false;

	var statusText = transformStat(store.remain_stat, sAt);

	var mOpts = {
		x: store.lng,
		y: store.lat,
		epsg: GPS_TYPE.WGS84,
		title: store.name,
		contents: statusText,
		text: {
			offsetX: 0.5, //위치설정
			offsetY: 20,   //위치설정
			font: '14px Calibri,sans-serif',
			// fill: {
			// 	color: '#6c757d'
			// },
			// stroke: {
			// 	color: '#fff', width: 3
			// },
			text: store.name
		},
		attr: {
			"id": "marker"+store.code,
			"name": "marker"+store.code,
		}
	};

	markerLayer.addMarker(mOpts);

}

function removeAllMarker() {
	if(markerLayer == null){
		alert("마커레이어가 생성되지 않았습니다.\n마커입력버튼을 먼저 실행하십시요.");
	} else {
		this.markerLayer.removeAllMarker();
	}
}

$("#btnSearchMap").click(search);
$("#inputAddr").keyup(function(e) {
	if (e.keyCode !== 13) {
		return false;
	}

	search();
});

function transformStat(remain_stat, dayDiff) {
	var stat_str = '정보없음';
	if (remain_stat === null || remain_stat === 'empty' || remain_stat === undefined) {
		if (dayDiff) {
			stat_str = '품절';
		} else {
			stat_str = '입고대기';
		}
	} else if (remain_stat === 'plenty') {
		stat_str = '100+';
	} else if (remain_stat === 'some') {
		stat_str = '99~30';
	} else if (remain_stat === 'few') {
		stat_str = '29~2';
	} else if (remain_stat === 'break') {
		stat_str = '판매중지';
	}
	return stat_str;
}

initMap();