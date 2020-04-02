"use strict";

var REFRESH = 60; // 새로고침 간격 60초 기본값
var TASK;

$('#collapseInfo').on('hide.bs.collapse', function () {
	$("[href='#collapseInfo']").text("안내 펼치기");
}).on('show.bs.collapse', function () {
	$("[href='#collapseInfo']").text("안내 접기");
});

$("#inputGroupSelect02").change(function () {
	toggleSearchOptions(getType());
});

$("#inputAddr").keyup(function (e) {
	if (e.keyCode !== 13) {
		return false;
	}

	search();
});

$(document).on("click", "[href='#']", function (e) {
	e.preventDefault();
});

function geoErr() {
	alert('좌표를 가져오는 중 오류가 발생했습니다.');
}

function checkGeoAPI() {
	if (!navigator.geolocation) {
		alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.\r\n좌표검색이 비활성화 됩니다.");
		$('#inputGroupSelect02 option:eq(0)').prop("disabled", true);
	}
}

function getGEO(callback) {

	//위치 정보를 얻기
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

	navigator.geolocation.getCurrentPosition(callback, geoErr, options);

}

function getType() {
	return $("#inputGroupSelect02 option:selected").val();
}

function toggleSearchOptions(typ) {
	if (typ === "1") {
		$("#rowGeo").show();
		$("#rowAddr").hide();
	} else if (typ === "2") {
		$("#rowGeo").hide();
		$("#rowAddr").show();
	}
}

function getRefreshMS() {
	var refSec = parseInt($("#inputGroupSelect01 option:selected").val()) || REFRESH;
	return refSec * 1000;
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
	showLoading("stockTable");
	$("#icnSpin").show();
	$.getJSON(url, searchParams, handleStoresResults);
}

function handleStoresResults(res) {
	hideLoading("stockTable");
	$("#icnSpin").hide();
	//			console.log("res: ", res);

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

	var count = stores.length;

	var toDay = moment().startOf('day');

	var html = '';

	_.each(stores, function (store, idx) {
		html = html.concat('<tr>');
		//					html = html.concat('<td>' + (idx + 1) + '</td>');
		//				var latlng = store.lat + "," + store.lng;

		var st_time = _.find(STORES_TIME, {code: store.code}),
			norm_start = "-", week_start = "-";
		// console.log('st_time: ', st_time);

		if (st_time) {
			norm_start = _.find(st_time.start, {type: '01'}) || '-';
			week_start = _.find(st_time.start, {type: '02'}) || '-';
		}

		norm_start = norm_start !== "-" &&  norm_start.time || "미확인";
		week_start = week_start !== "-" && ("<span class='text-primary'>" + week_start.time + "</span>") || "미확인";

		html = html.concat('<th scope="row"><a href="https://map.kakao.com/?q=' + encodeURI(store.addr) + '" target="_blank">' + store.name + '</a></th>');

		var stock_at = store.stock_at || '-';
		var stockDate = (stock_at !== '-') ? moment(stock_at, "YYYY/MM/DD HH:mm:ss") : null;

		// 같은 날 입고되었다면,
		var sAt = stockDate !== null ? toDay.isSame(stockDate, 'day') : false;

		html = html.concat('<td>' + transformStat(store.remain_stat, sAt) + '</td>');

		html = html.concat('<td><a tabindex="0" href="#" class="text-decoration-none" role="button" data-toggle="popover" data-trigger="focus" data-content="' + stock_at + '">' + (stockDate && stockDate.fromNow() || '정보없음') + '</a></td>');
		html = html.concat('<td>(' + norm_start + ' / ' + week_start + ')</td>');
		html = html.concat('</tr>');
	});

	$("#tableBody").empty().append(html);

	$('[data-toggle="popover"]').popover();

	var addrInfoHtml = '검색일: ' + moment().format("LL") + "<br/>";
	if (address) {
		addrInfoHtml += "주소: " + address + '<br/>';
	}
	addrInfoHtml += "판패처: " + count + "곳";

	$("#txtAddrInfo").empty().append(addrInfoHtml);

	$("#searchAddrInfo").show();

	setTimeout(function () {
		$("#btnSearch").focusout();
	}, 100);
}

function transformStat(remain_stat, dayDiff) {
	var stat_str = '';
	if (remain_stat === null || remain_stat === 'empty' || remain_stat === undefined) {
		if (dayDiff) {
			stat_str = '<span class="badge badge-pill badge-secondary">품절</span>';
		} else {
			stat_str = '<span class="badge badge-pill badge-secondary">입고대기</span>';
		}
	} else if (remain_stat === 'plenty') {
		stat_str = '<span class="badge badge-pill badge-success">100 <i class="fas fa-arrow-alt-circle-up"></i></span>';
	} else if (remain_stat === 'some') {
		stat_str = '<span class="badge badge-pill badge-warning">99 <i class="fas fa-arrow-alt-circle-down"></i></span>';
	} else if (remain_stat === 'few') {
		stat_str = '<span class="badge badge-pill badge-danger">29 <i class="fas fa-arrow-alt-circle-down"></i></span>';
	} else if (remain_stat === 'break') {
		stat_str = '<span class="badge badge-pill badge-secondary">판매중지</span>';
	}
	return stat_str;
}

function registerInterval() {

	if (TASK) {
		TASK = clearInterval(TASK);
	}

	TASK = setInterval(search, getRefreshMS());
}

function search() {
	var type = getType(),
		searchParams = {},
		url = API_SERVER.concat("/").concat(API_VERSION);

	$('[data-toggle="popover"]').popover('dispose');

	if (type === "1") {

		getGEO(function (pos) {

			console.log("pos:: ", pos);
			$("#geoInfo").empty().html("현위치<br/>위도: " + pos.coords.latitude + "<br/>경도: " + pos.coords.longitude + "<br/>반경: 1km");

			searchParams.lat = pos.coords.latitude;
			searchParams.lng = pos.coords.longitude;

			searchParams.m = 1000;
			url = url.concat("/").concat(API_STORE_BY_GEO);

			getLists(url, searchParams);
		});

	} else if (type === "2") {
		searchParams.address = $("#inputAddr").val().trim();
		if (!searchParams.address || searchParams.address === '') {
			searchParams.address = DEFAULT_INPUT_ADDR;
		}

		url = url.concat("/").concat(API_STORE_BY_ADDR);

		getLists(url, searchParams);
	}


	if (!TASK) {
		registerInterval();
	}
}

checkGeoAPI();