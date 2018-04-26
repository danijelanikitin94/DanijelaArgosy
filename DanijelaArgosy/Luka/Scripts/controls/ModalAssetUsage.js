function ModalAssetUsage(opts) {
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

ModalAssetUsage.prototype.options = {
};

ModalAssetUsage.prototype.baseOptions = {
    fancyboxHref: "div[data-argosy-modal=ModalUsage]",
    chartHref: "div[data-argosy-view=ModalUsageChart]"
};

ModalAssetUsage.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_ASSET_USAGE_LOADED";

ModalAssetUsage.prototype.show = function (ID) {
    var that = this,
        endDate = Date.today().toString("yyyy/MM/01"),
        startDate = Date.today().addMonths(-6).toString("yyyy/MM/01"),
        kendoStockChart = $(that.options.chartHref).getKendoStockChart();
    that.options.ID = ID;
    if (kendoStockChart == null) {
        $(that.options.chartHref).kendoStockChart({
            theme: "Uniform",
            dataSource: {
                transport: {
                    read: function (options) {
                        $(document).trigger(argosyEvents.START_LOADING);
                        var search = {
                            assetId: that.options.ID
                        };
                        $.ajax({
                            url: "/DataView/GetAssetHistory",
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
                    field: "OrderVolume"
                }
            ],
            legend: {
                position: "top",
                visible: true
            },
            categoryAxis: {
                field: "Date",
                labels: {
                    rotation: -45
                },
                majorGridLines: {
                    visible: false
                },
                baseUnit: "months"
            },
            navigator: {
                series: {
                    type: "area",
                    field: "OrderVolume"
                },
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
                    format: "{0}"
                }
            }
        });
       
    } else {
        $(that.options.chartHref).getKendoStockChart().dataSource.read();
        var navi = kendoStockChart._navigator;
        if (navi) {
            navi._dragEnd();
        }
    }
};

ModalAssetUsage.prototype.getAssetUsageHistory = function(ID) {

};