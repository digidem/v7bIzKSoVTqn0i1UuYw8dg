$(function() {

    var monitoringPoints = new MapFilter.Collection(void 0, {
        model: MonitoringPoint,
        url: 'data/formhub.json',
        comparator: 'start'
    });

    var app = new MapFilter({

        // The html element to attach the application to
        el: $("#app"),

        collection: monitoringPoints,

        // An array of filters to explore the data.
        // `field` is the field/attribute to filter by
        // `type` should be `discrete` for string data and `continuous` for numbers or dates
        // `expanded` sets whether the filter view is expanded or collapsed by default
        filters: [{
            type: "continuous",
            field: "today",
            expanded: true
        }, {
            type: "discrete",
            field: "happening",
            expanded: true
        }, {
            type: "discrete",
            field: "people",
            expanded: true
        }],

        // Initial map center point (TODO: set this & zoom based on data bounds)
        mapCenter: [2.6362, -59.4801],

        // Initial map zoom
        mapZoom: 10,

        // Template to generate maptile urls. See http://leafletjs.com/reference.html#url-template
        tileUrl: 'http://{s}.tiles.mapbox.com/v3/gmaclennan.wapichana_background/{z}/{x}/{y}.png'
    });

});