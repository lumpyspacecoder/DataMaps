var chart = null;

function reactiveArea() {
    var site = Session.get('selectedSite');
    Meteor.subscribe('liveData');
    var ozoneCursor = LiveData.find({
        siteRef: site
    }, {
        limit: 240
    });
    var ozoneConDataforGraph = [];
    ozoneCursor.forEach(function (time) {
        ozoneConDataforGraph.push({
            x: new Date(time.epoch * 1000),
            y: parseFloat(time.O3_conc)
        });
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    chart = $('#container-chart-reactive').highcharts({
        chart: {
            type: 'areaspline'
        },

        title: {
            text: 'Ozone Readings at ' + site
        },

        credits: {
            text: 'UH-HNET',
            href: 'http://hnet.uh.edu'
        },

        xAxis: {
            type: 'datetime'
        },

        yAxis: {
            title: {
                text: 'Ozone Concentration'
            },
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },

        tooltip: {
            pointFormat: site + ' had an ozone concentration of <b>{point.y:,.0f}</b><br/>ppm in {point.x}'
        },

        plotOptions: {
            areaspline: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },

        series: [{
            name: 'Ozone Concentration',
            data: ozoneConDataforGraph,
            color: '#5CA221'
        }]
    });
}

Template.currentsites.rendered = function () {

    Tracker.autorun(function () {
        reactiveArea();
    });
};

Template.currentsites.events({
    // depending on which site the user clicks to learn more about, session variable will be changed and passed to currentsites.js
    'change #siteselect': function (e) {
        var newValue = $(e.target).val();
        Session.set('selectedSite', newValue);
    }
});

Template.currentsites.onCreated(function () {
    // creation of reactive var which will be a mongo query for the menu of live data monitors
    var self = this;
    self.autorun(function () {
        self.subscribe('LiveMenu');
    });
});

Template.currentsites.helpers({
    currentSites: function () {
        var data = LiveData.find().fetch();
        var distinctData = _.uniq(data, false, function (d) {
            return d.siteRef;
        });
        console.log("here at pluck");
        return _.pluck(distinctData, 'siteRef');
    }
});