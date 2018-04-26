function UserBudgetsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.search();
}

UserBudgetsGridView.prototype.options = {};

UserBudgetsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserBudgetsGridView]",
};

UserBudgetsGridView.prototype.searchCriteria = {};

UserBudgetsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

UserBudgetsGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            dataBound: function (e) {
                $("div[data-argosy-view=UserBudgetsGridView] th:eq(2) ,div[data-argosy-view=UserBudgetsGridView]  tr td:nth-child(3)").addClass("hidden-xs");
            },
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
            {
                title: "~{GroupName}~",
                field: "GroupName",
                template: "<a href='/Tools/UserBudgets/Edit/${UserGroupId}'>${GroupName}<a>"
            }, {
                title: "~{GroupManager}~",
                field: "ManagerName"
            },
             {
                 title: "~{ManagementType}~",
                 field: "GroupManager",
                 template: "<div>#if (ManagementType == 2) {#User#} else { if (ManagementType == 1) {#Group#} else {#None#}}#</div>"
             },
            {
                title: "<div class='textr'>~{GroupBudget}~</div>",
                field: "UserGroupBudget",
                template: "<div class='textr'>#:kendo.toString(UserGroupBudget,'c')#</div>"                
            }
            ],
            dataBinding: function (e) {
            },
            search: [
                { name: "GroupName", type: "text", placeholder: "~{GroupName}~", toolbar: false },
                { name: "GroupDescription", type: "text", placeholder: "~{GroupDescription}~", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchByGroupNameDescription}~", toolbar: true },
                {
                    name: "IsActive", type: "select", toolbar: true, data:
                        [
                            { value: "true", text: "~{Active}~", selected: true },
                            { value: "false", text: "~{Inactive}~" },
                            { value: "null", text: "~{All}~" }
                        ]
                },
                {
                    name: "IsRetail", type: "select", placeholder: "-- ~{Retail}~ --", toolbar: false, data:
                        [
                            { value: "true", text: "~{Yes}~" },
                            { value: "false", text: "~{No}~" },
                            { value: "null", text: "~{All}~" }
                        ]
                }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

UserBudgetsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroups",
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

UserBudgetsGridView.prototype.dataSourceOpts = {};

