function ModalProductUsage(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ModalUsage", function (template) {
        if ($(that.options.fancyboxHref).length === 0) {
            $(document.body).append(template);
        }
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ModalProductUsage.prototype.options = {
};

ModalProductUsage.prototype.baseOptions = {
    fancyboxHref: "div[data-argosy-modal=ModalUsage]",
    chartHref: "div[data-argosy-view=ModalUsageChart]"
};

ModalProductUsage.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_PRODUCT_USAGE_LOADED";

ModalProductUsage.prototype.show = function (partId) {
    var that = this,
        today = Date.today(),
        endDate = today.toString("yyyy/MM/01"),
        startDate = today.addMonths(-12).toString("yyyy/MM/01"),
        kendoStockChart = $(that.options.chartHref).getKendoStockChart();
    that.options.partId = partId;
    if (kendoStockChart == null) {
        $(that.options.chartHref).kendoStockChart({
            theme: "Uniform",
            dataSource: {
                transport: {
                    read: function (options) {
                        $(document).trigger(argosyEvents.START_LOADING);
                        var search = {
                            PartId: that.options.partId
                        };
                        $.ajax({
                            url: "/DataView/GetProductHistory",
                            dataType: "json",
                            data: search,
                            success: function (result) {
                                if (result.ReturnCode == ReturnCode.Failed) {
                                    handleDataSourceException(result);
                                } else {
                                    options.success(result);
                                }
                                $(document).trigger(argosyEvents.END_LOADING);
                                $.fancybox({
                                    href: that.options.fancyboxHref,
                                    type: "inline",
                                    scrolling: "no",
                                    afterClose: function () {
                                        $(that.options.chartHref).data("kendoStockChart").destroy();
                                        $(that.options.chartHref).empty();
                                    }
                                });
                                $(that.options.chartHref).getKendoStockChart()._navigator._dragEnd();
                            },
                            error: function (result) {
                                options.error(result);
                            }
                        });
                    }
                }
            },
            dateField: "Date",
            series: [
                {
                    type: "column",
                    field: "OrderVolume",
                    name: "~{QtyOrdered}~"
                },
                {
                    type: "column",
                    field: "ShipmentVolume",
                    name: "~{QtyShipped}~"
                }
            ],
            categoryAxis: {
                field: "Date",
                labels: {
                    rotation: -45
                },
                majorGridLines: {
                    visible: false
                }
            },
            legend: {
                position: "top",
                visible: true
            },
            navigator: {
                series: [
                {
                    type: "area",
                    field: "OrderVolume"
                },
                {
                    type: "area",
                    field: "ShipmentVolume"
                }
                ],
                select: {
                    from: startDate,
                    to: endDate
                },
                categoryAxis: {
                    labels: {
                            rotation: "auto"
                    },
                    baseUnit: "months"
                }
            },
            valueAxis: {
                labels: {
                    format: "n0"
                }
            }
        });
    } else {
        kendoStockChart.dataSource.read();
        var data = kendoStockChart.dataSource.data();
        if (data.length > 0) {
            var lastDataElem = data[data.length - 1],
                navi = kendoStockChart._navigator,
                select = navi.options.select,
                lastMonth = lastDataElem._date_Date.getMonth();

            lastDataElem._date_Date.setMonth(lastMonth - 12);

            var fromDay = lastDataElem._date_Date.getDate(),
            fromMonth = lastDataElem._date_Date.getMonth() + 1,
            fromYear = lastDataElem._date_Date.getFullYear();

            select.to = lastDataElem.Date;
            select.from = fromYear + "/" + fromMonth + "/" + fromDay;
            kendoStockChart.refresh();
            if (navi) {
                navi._dragEnd();
            }
        }
    }
};

ModalProductUsage.prototype.getPartUsageHistory = function (partId) {

};