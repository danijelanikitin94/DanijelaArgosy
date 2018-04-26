function CompanyAddressAddUserGroupsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document)
        .bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
            that.refineSearch(data);
        })
        .bind(argosyEvents.ADDRESS_USER_GROUPS_LOADED, function (e, data) {
            that.options.user_groups = data.user_groups;
            that.refineSearch({});
        });
}

CompanyAddressAddUserGroupsGridView.prototype.options = {
    user_groups: null,
    companyId: 0,
    addressId: 0
};

CompanyAddressAddUserGroupsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=CompanyAddressAddUserGroupsGridView]"
};

CompanyAddressAddUserGroupsGridView.prototype.searchCriteria = {};

CompanyAddressAddUserGroupsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

CompanyAddressAddUserGroupsGridView.prototype.setupGrid = function () {
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
                title: "~{GroupName}~",
                field: "GroupName",
                template: "<div> #if (GroupName != null && GroupName.trim().length > 0) {#   #= GroupName # #}else{##}# </div>",
                encoded: false
            }],
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByUserGroupName}~", toolbar: true }
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

CompanyAddressAddUserGroupsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            if (search.user_groups != null) {
                var excludeUserGroupIds = [];
                for (var i = 0; i < search.user_groups.Records.length; i++) {
                    excludeUserGroupIds.push(search.user_groups.Records[i].UserGroupId);
                };
                search.excludeUserGroupIds = excludeUserGroupIds;
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroups",
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

CompanyAddressAddUserGroupsGridView.prototype.dataSourceOpts = {};
