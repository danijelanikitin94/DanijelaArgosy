function OrderApprovalsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.search({});
    });
    that.search({});
}
OrderApprovalsGridView.prototype.options = {};
OrderApprovalsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=OrderApprovalsGridView]"
};
OrderApprovalsGridView.prototype.search = function () {
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
                    title: "~{Name}~",
                    template: "${FirstName} ${LastName}"
                },
                {
                    title: "~{ApprovalDate}~",
                    template: "${kendo.toString(kendo.parseDate(ApprovalDate),\"MM/dd/yyyy\")}"
                },
                {
                    title: " ",
                    template: "#if (Approved==true) {#<i class=\"fa fa-check text-success\" aria-hidden=\"true\" title='Approved'></i>#} else {#<i class=\"fa fa-ban text-danger\" aria-hidden=\"true\" title='Denied'></i>#}#"
                }
            ],
            detailTemplate: kendo.template($("#template").html()),
            detailInit: function (e) {
                var commentsDataSource = new kendo.data.DataSource({
                    data: [ { title: "~{Comments}~", content: e.data.ApprovalComments } ]
                });
                var detailRow = e.detailRow;
                detailRow.find(".approvals").kendoTabStrip({
                    scrollable: false,
                    sortable: true,
                    pageable: true,
                    dataTextField: "title",
                    dataContentField: "content",
                    dataSource: commentsDataSource
                }).data("kendoTabStrip").select(0); 
            }
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

OrderApprovalsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetOrderApprovals",
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


OrderApprovalsGridView.prototype.dataSourceOpts = {};

OrderApprovalsGridView.prototype.getStatus = function () { };