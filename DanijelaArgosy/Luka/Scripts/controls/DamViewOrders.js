function DamViewOrders(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("DamViewOrders", function (template) {
        $(document.body).append(template);
        that.setupEventListeners();
        that.init();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

DamViewOrders.prototype.options = {
    detailsModalHref: "#_DamViewOrderDetailsModal",
    buttonsTemplateHref: "#_DamViewOrderButtonsTemplate"
};

DamViewOrders.prototype.baseOptions = {
};

DamViewOrders.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_DAM_VIEW_CART_LOADED";
DamViewOrders.prototype.EVENT_LISTENERS_LOADED = "DAM_DIRECTORY_VIEW_CART_LOADED";
DamViewOrders.prototype.EVENT_DATABOUND = "DAM_VIEW_CART_DATABOUND";

DamViewOrders.prototype.dataSourceOpts = {};

DamViewOrders.prototype.setupEventListeners = function () {
};

DamViewOrders.prototype.init = function () {
    var that = this;
    var parentElement = that.getElement();
    parentElement.kendoArgosyGrid({
        scrollable: false,
        editable: false,
        autoBind: true,
        dataSource: that.getDataSource({}),
        groupable: false,
        sortable: false,
        selectable: "multiple, row",
        checkboxes: true,
        exportToExcel: false,
        pageable: {
            refresh: true,
            pageSizes: [50, 100, 200],
            buttonCount: 3
        },
        columns: [
            {
                title: "~{DateOrdered}~",
                field: "OrderDate",
                template: "#= kendo.toString(kendo.parseDate(OrderDate, 'yyyy-MM-dd'), 'MM/dd/yyyy') #"
            },
            {
                title: "~{OrderNumber}~",
                field: "OrderNumber",
                template: "<a data-argosy-action='show-details-modal' data-argosy-id='${Id}'>${OrderNumber}</a>"
               
            },
            {
                title: "~{Status}~",
                field: "Status",
            },
            {
                title: "~{Expiration}~",
                field: "ExpirationDate",
                template: "#= kendo.toString(kendo.parseDate(ExpirationDate, 'yyyy-MM-dd'), 'MM/dd/yyyy') #"
            },
            {
                title: "<div class='textr'>~{Assets}~</div>",
                template: "<div class='textr'>${kendo.toString(OrderLines.length, 'n0')}</div>"
            },
            {
                title: "",
                template: $(that.options.buttonsTemplateHref).html()
            }
        ],
        dataBound: function (e) {
           var detailsButtons = e.sender.element.find("*[data-argosy-action=show-details-modal]");
           detailsButtons.click(function (e) {
                var row = e.target.closest("tr");
                var data = that.getElement().getKendoGrid().dataItem(row);
                var html = $(that.options.detailsModalHref).html();
                var template = kendo.template(html);
                var result = template(data);
                $.fancybox({
                    content: result
                });
                $.fancybox.wrap.find("*[data-argosy-action=download-file]").click(function (e) {
                    var downloadPath = $(this).attr("data-argosy-path");
                    downloadFile(downloadPath, true, "");
                });
            });
            var downloadButtons = e.sender.element.find("*[data-argosy-action=download-file]");
            downloadButtons.click(function (e) {
                var downloadPath = $(this).attr("data-argosy-path");
                downloadFile(downloadPath, true, "");
               
            });
           
            that.setAutoRefresh();
        }
    });
    parentElement.getKendoGrid().dataSource.read();
};

DamViewOrders.prototype.setAutoRefresh = function () {
    var that = this;
    var isProcessing = false;
    var grid = that.getElement().getKendoGrid();
    $(grid.dataItems()).each(function (e) {
        if (this.Status == "Processing") {
            isProcessing = true;
        }
    });
    // if there is an order processing automatically refresh the grid every minute.
    if (isProcessing) {
        setTimeout(function(e) {
            grid.dataSource.read();
        }, 60 * 1000);
    }
}

DamViewOrders.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

DamViewOrders.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
            };
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Tools/DigitalAssets/GetOrders",
                dataType: "json",
                data: options.data,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};