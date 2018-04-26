function StandardReportsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.search({});
    });
    that.search({});
}
StandardReportsGridView.prototype.options = {};
StandardReportsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=StandardReportsGridView]"
};
StandardReportsGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: false,
            selectable: false,
            exportToExcel: false,
            columns: [
            {
                field: "ReportName",
                hidden: true,
                groupHeaderTemplate: "#if(value != null) { #  #= value # # } else {#Items#}  # "
            },
            {
                title: " ",
                field: "ReportViewName",
                template: "<a href='/Admin/Reports/Details/${ReportConfigId}'>${ReportViewName}</a>"
            },
            {
                title: " ",
                field: "DateCreated",
                template: "${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy\")}",
                width: "100px",
                editable:false
            }
            ],
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var collapseButton = gridElement.find(".k-icon.k-i-collapse");
                collapseButton.click();
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                });
            }
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};



StandardReportsGridView.prototype.showDeleteModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            that.deleteReportFromGroup(data);
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.button = "~{Remove}~";
    prompt.alert(message);
};

StandardReportsGridView.prototype.deleteReportFromGroup = function (report) {
    var that = this;
    var params = { report: report };
    $.ajax({
        url: '/Admin/Reports/DeleteReportFromGroup',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);
        }
    });
    $.fancybox.close();
};

StandardReportsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.group =
    {
        field: "ReportName"
    };
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetStandardReportViews",
                dataType: "json",
                data: search,
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

StandardReportsGridView.prototype.dataSourceOpts = {};

StandardReportsGridView.prototype.getStatus = function () { };