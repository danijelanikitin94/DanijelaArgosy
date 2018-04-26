function CompanyAddresses(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.searchCriteria = data;
        that.setupGrid();
    });
    that.setupGrid();
}

CompanyAddresses.prototype.options = {};

CompanyAddresses.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-control='CompanyAddresses']",
    companyId: 0
};

CompanyAddresses.prototype.searchCriteria = {
    Keyword: null
};

CompanyAddresses.prototype.setupGrid = function () {
    var that = this;
    var grid = $(that.options.gridViewSelector).data("kendoGrid");
    if (grid == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: false,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 2
            },
            columns: [
                {
                    title: "~{AttnContact}~",
                    field: "Name"
                },
                {
                    field: "~{Company}~",
                    template: "<a href='/Admin/AddressBook/Edit/${AddressId}'>${Company}<a>"
                },
                {
                    title: "~{Address}~",
                    template:
                        "${AddressLine1}, ${AddressLine2.length > 0 ? AddressLine2 + \", \" : \"\"} ${City}, ${State.Name} ${ZipCode}"
                }
            ],
            dataBinding: function () {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByNameAddress}~", toolbar: true }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    }
}

CompanyAddresses.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 50;
    that.dataSourceOpts.serverPaging = true;
    that.dataSourceOpts.serverSorting = true;
    that.dataSourceOpts.serverFiltering = true;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetCompanyAddresses",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        }
    };
    that.dataSourceOpts.schema = {
        data: function (response) {
            return response.Records;
        },
        total: function (response) {
            return response.TotalRecords;
        }
    }
    that.dataSourceOpts.requestStart = function () {
        $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
    };
    that.dataSourceOpts.requestEnd = function () {
        $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

CompanyAddresses.prototype.dataSourceOpts = {};

