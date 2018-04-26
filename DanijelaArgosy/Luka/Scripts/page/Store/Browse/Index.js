$(document).ready(function () {
    if (window.location.href.indexOf("#") < 0) {
        
        if (window.initialPartCat) {
            var location = $('[data-argosy-categoryname="' + window.initialPartCat + '"]').first().attr('href');
            if (location && location.length > 0) {
                window.location = location;
            } else {
                $("#logo_header").trigger('click');
            }
        } else {
            $("#logo_header").trigger('click');
        }
    }
});

function createChart() {
    $("#usage-chart").kendoStockChart({
        dataSource: {
            transport: {
                read: {
                    url: "/Content/images/placeholder/json1.json",
                    dataType: "json"
                }
            }
        },
        theme: "Metro",
        dateField: "Date",
        series: [{
            type: "column",
            field: "Close"
        }],
        navigator: {
            series: {
                type: "area",
                field: "Close"
            },
            select: {
                from: "2009/02/05",
                to: "2011/10/07"
            }
        },
        valueAxis: {
            labels: {
                format: "{0}"
            }
        },
        categoryAxis: {
            notes: {
                data: [{
                    value: "2001/01/01",
                    label: {
                        text: "01"
                    }
                }, {
                    value: "2002/01/01",
                    label: {
                        text: "02"
                    }
                }, {
                    value: "2003/01/01",
                    label: {
                        text: "03"
                    }
                }, {
                    value: "2004/01/01",
                    label: {
                        text: "04"
                    }
                }, {
                    value: "2005/01/01",
                    label: {
                        text: "05"
                    }
                }, {
                    value: "2006/01/01",
                    label: {
                        text: "06"
                    }
                }, {
                    value: "2007/01/01",
                    label: {
                        text: "07"
                    }
                }, {
                    value: "2008/01/01",
                    label: {
                        text: "08"
                    }
                }, {
                    value: "2009/01/01",
                    label: {
                        text: "09"
                    }
                }, {
                    value: "2010/01/01",
                    label: {
                        text: "10"
                    }
                }, {
                    value: "2011/01/01",
                    label: {
                        text: "11"
                    }
                }, {
                    value: "2012/01/01",
                    label: {
                        text: "12"
                    }
                }]
            }
        }
    });
}
