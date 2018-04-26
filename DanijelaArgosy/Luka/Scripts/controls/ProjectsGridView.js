function ProjectsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}
ProjectsGridView.prototype.options = {};
ProjectsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=ProjectsGridView]",
};
ProjectsGridView.prototype.searchCriteria = {
    Sku: null
};
ProjectsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.search();
};

ProjectsGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            scrollable: false,
            editable: false,
            autoBind: true,
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "Project Name",
                    field: "ProjectName",
                    template: "<div><a href='/Tools/Projects/Details/${ProjectId}'>   ${ProjectName}  </a></div>",
                },
                {
                    title: "Created By",
                    template: "${FirstName} ${LastName}"
                },
                {
                    title: "Status",
                    field: "StatusDesc"
                }, {
                    title: "Rev",
                    field: "RevisionsCount"
                },
                {
                    title: "Date Created",
                    field: "DateCreated",
                    template: "${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy hh:mm:ss\")}"
                },
                {
                    title: "Artwork Approval",
                    headerAttributes: { "class": "text-center" },
                    template: "#if (IsArtworkApproved==true) {#YES#} else {#NO#}#",
                    attributes: { "class": "text-center bold" }
                },
                {
                    title: "Pricing Approval",
                    headerAttributes: { "class": "text-center" },
                    template: "#if (IsPricingApproved==true) {#YES#} else {#NO#}#",
                    attributes: { "class": "text-center bold" }
                }
            ],
            checkboxes: false,
            search: [
                { name: "ProjectName", type: "text", placeholder: "Project Name", toolbar: true },
                { name: "StatusId", type: "select", placeholder: "-- Status --", toolbar: true, autoSubmit: true, data: ProjectStatuses },
                { name: "StartDate", type: "date", placeholder: "From", toolbar: false },
                { name: "EndDate", type: "date", placeholder: "To", toolbar: false }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
    }
};
ProjectsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
   
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetProjects",
                dataType: "json",
                method: "post",
                type: "post",
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

ProjectsGridView.prototype.dataSourceOpts = {};