function CompanyAddressAddUsersGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document)
        .bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
            that.refineSearch(data);
        })
        .bind(argosyEvents.ADDRESS_USERS_LOADED, function (e, data) {
            that.options.users = data.users;
            that.refineSearch({});
        });
}

CompanyAddressAddUsersGridView.prototype.options = {
    users: null,
    companyId: 0,
    addressId: 0
};

CompanyAddressAddUsersGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=CompanyAddressAddUsersGridView]"
};

CompanyAddressAddUsersGridView.prototype.searchCriteria = {};

CompanyAddressAddUsersGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

CompanyAddressAddUsersGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            dataSource: that.getDataSource(),
            groupable: false,
            exportToExcel: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            checkboxes: true,
            columns: [{
                title: "~{Name}~",
                field: "FullName",
                template: "<div> #if (FullName != null && FullName.trim().length > 0) {#   #= FullName # #}else{##}# </div>",
                encoded: false
            }],
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByUserName}~", toolbar: true }
            ]
        };
        $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
        $(document).trigger(argosyEvents.END_LOADING);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

CompanyAddressAddUsersGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            if (search.users != null) {
                var excludeUserIds = [];
                for (var i = 0; i < search.users.Records.length; i++) {
                    excludeUserIds.push(search.users.Records[i].UserId);
                };
                search.excludeUserIds = excludeUserIds;
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsers",
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
    return new kendo.data.DataSource(that.dataSourceOpts);
};

CompanyAddressAddUsersGridView.prototype.dataSourceOpts = {};
