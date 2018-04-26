function CustomizedReportsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.search({});
    });
    that.search({});
}
CustomizedReportsGridView.prototype.options = {};
CustomizedReportsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=CustomizedReportsGridView]"
};
CustomizedReportsGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: "inline",
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: false,
            selectable: false,
            exportToExcel: false,
            schema: {
                model: {
                    id: "ReportConfigId",
                    fields: {
                        ReportConfigId: { editable: false, nullable: true },
                        ReportViewName: { validation: { required: true } },
                        DateCreated: { editable: false }
                    }
                }
            },
            columns: [
            {
                field: "ReportName",
                hidden: true,
                groupHeaderTemplate: "#if(value != null) { #  #= value # # } else {#Items#}  # "
            },
            {
                title: " ",
                template: "<i class='fa fa-times'></i>",
                width: "5%"
            },
            {
                title: " ",
                field: "ReportViewName",
                template: "<a href='/Admin/Reports/Details/${ReportConfigId}'>${ReportViewName}</a>",
                width: "65%"
            },
            {
                title: " ",
                template: "${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy\")}",
                width: "15%"
            },
                { command: ["edit"], title: "&nbsp;", width: "15%" }
            ],
            edit: function (e) {
            },
            save: function (e) {
                var numeric = e.container.find("input[name=ReportViewName]");
                var model = this.dataItem($(numeric).closest("tr"));
                model.ReportViewName = numeric.val();
                var report = model;

                var params = { reportConfigId: report.ReportConfigId, reportViewName: report.ReportViewName };
                $.ajax({
                    url: '/Admin/Reports/UpdateReportViewName',
                    type: "POST",
                    data: JSON.stringify(params),
                    dataType: "json",
                    traditional: true,
                    contentType: "application/json; charset=utf-8",
                    success: function (result) {
                        if (!result.IsError) {
                            $(result.Data).each(function () {
                                prompt.notify({
                                    question: result.Message,
                                    type: (!this.Value ? "success" : "error")
                                });
                                var grid1 = $(that.options.gridViewSelector).getKendoGrid();
                                grid1.refresh();
                            });
                        } else {
                            prompt.clientResponseError(result);
                        }

                    }
                });

            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var collapseButton = gridElement.find(".k-icon.k-i-collapse");
                collapseButton.click();
                var grid = gridElement.getKendoGrid();
                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeleteModal(data);
                    });
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


CustomizedReportsGridView.prototype.showDeleteModal = function (data) {
    var that = this;
    var btnClicked = false;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (!btnClicked) {
                that.deleteReportFromGroup(data);
                btnClicked = true;
            }
        }
    };
    message.question = "Are you sure you want to delete this custom report?";
    message.button = "Delete";
    prompt.alert(message);
};

CustomizedReportsGridView.prototype.deleteReportFromGroup = function (report) {
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

CustomizedReportsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.group = { field: "ReportName" };
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserReportViews",
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

CustomizedReportsGridView.prototype.dataSourceOpts = {};

CustomizedReportsGridView.prototype.getStatus = function () { };