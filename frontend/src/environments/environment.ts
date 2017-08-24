export const environment = {
    production: false,
    apiURL: 'http://localhost:8000',
    map: {
        bing: {
            key: 'ArgP-VOBAhkOoxWwLJJ483zfnTLQhs5Thbked2S4jMPu5FpTvpGIc3rAy3irEYvM'
        },
        fullExtent: [-13657661.739414563, 5700905.92043886, -13655116.88116592, 5702920.846916851],
        projectionCode: 'EPSG:3857',
        server: {
            baseURL: '//localhost:8080/geoserver'
        }
    }
};
