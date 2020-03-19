"use strict";

var API_SERVER = "https://8oi9s0nnth.apigw.ntruss.com/corona19-masks";
var API_VERSION = "v1";
var API_STORES = "stores/json";
var API_SALES = "sales/json";
var API_STORE_BY_GEO = "storesByGeo/json";
var API_STORE_BY_ADDR = "storesByAddr/json";

var DEFAULT_LAT = "37.3919917";
var DEFAULT_LNG = "127.0762659";
var DEFAULT_M = 1000;

var DEFAULT_X = 14145614.802106937;
var DEFAULT_Y = 4492811.739768455;

var DEFAULT_INPUT_ADDR = "경기도 성남시 분당구 운중동";

var GEO_API_URL = "https://api.vworld.kr/req";

var GEO_ADDR_URL = "address?callback=?";
var GEO_SEARCH_URL = "search?callback=?";

var GEO_KEY = "D9946739-3E1E-3F78-BBEF-16009CEDDAC9";

var GPS_TYPE = {
    "WGS84": "EPSG:4326",
    "GRS80": "EPSG:4019",
    "Mercator_1": "EPSG:3857",
    "Mercator_2": "EPSG:900913",
    "WEST_GRS80_1": "EPSG:5180",
    "WEST_GRS80_2": "EPSG:5185",
    "CENTRAL_GRS80_1": "EPSG:5181",
    "CENTRAL_GRS80_2": "EPSG:5186",
    "JEJU_GRS80": "EPSG:5182",
    "EAST_GRS80_1": "EPSG:5183",
    "EAST_GRS80_2": "EPSG:5187",
    "KE_SEA_GRS80_1": "EPSG:5184",
    "KE_SEA_GRS80_2": "EPSG:5188",
    "UTM-K": "EPSG:5179"
};

var STORES_TIME = [
    {
        name: '청호약국',
        start: [
            {
                type: "01",
                time: "19:00"
            },
            {
                type: "02",
                time: "14:00"
            }
        ]
    },
    {
        name: '소망약국',
        start: [
            {
                type: "02",
                time: "14:00"
            }
        ]
    },
    {
        name: '옵티마우리들약국',
        start: [
            {
                type: "02",
                time: "14:00"
            }
        ]
    },
    {
        name: "운중약국",
        start: [
            {
                type: "01",
                time: "09:00"
            },
            {
                type: "02",
                time: "09:00"
            }
        ]
    },
    {
        name: "이오약국",
        start: [
            {
                type: "02",
                time: "13:00"
            }
        ]
    }
];

moment.locale('ko');