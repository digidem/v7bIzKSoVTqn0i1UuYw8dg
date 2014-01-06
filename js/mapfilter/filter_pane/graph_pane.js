MapFilter.GraphPane = Backbone.View.extend({

    id: "graph-pane",

    events: {
        "click .close": "close",
        "click": "noop"
    },

    initialize: function() {
        var self = this;
        this.$el.append('<button type="button" class="close" aria-hidden="true">&times;</button>');
        var date = this.collection.dimension(function(d) { return new Date(d.attributes.today); }),
            dates = date.group(d3.time.day);

        this.barChart = MapFilter.BarChart()
            .dimension(date)
            .group(dates)
            .round(d3.time.day.round)
          .x(d3.time.scale()
            .domain([new Date(2013, 9, 1), new Date(2013, 11, 20)])
            .rangeRound([0, 1400]))
            .on("brush", function() {
                self.collection.trigger("filtered");
            });
        this.listenTo(this.collection, "filtered", this.render);
    },

    render: function() {
        if (!this.collection.length) return this;
        d3.select(this.el).call(this.barChart);
        return this;
    },

    open: function() {
        this.trigger("opened");
        this.render();
    },

    close: function() {
        this.trigger("closed");
    },

    noop: function(e) {
        e.stopPropagation();
    }
});