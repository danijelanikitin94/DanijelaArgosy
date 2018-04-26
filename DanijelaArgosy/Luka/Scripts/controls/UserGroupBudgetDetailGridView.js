function UserGroupBudgetDetailGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.search();
}

UserGroupBudgetDetailGridView.prototype.options = {};

UserGroupBudgetDetailGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserGroupBudgetDetailGridView]",
    availableBudgetSelector:"",
    RecordSizeCategory: 40,
    canEditUser: false,
    groupBudget: 0,
    totalBudgetUsed: 0,
    budgetLeftToSpend: 0,
    alertSelector:""
};

UserGroupBudgetDetailGridView.prototype.searchCriteria = {};

UserGroupBudgetDetailGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

UserGroupBudgetDetailGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
            {
                title: "~{FullName}~",
                field: "FullName",
                width: "200px"
            }, {
                title: "~{UserName}~",
                field: "Username",
                width: "200px"
            },
            {
                title: "<div class='textr'>~{SpendingLimit}~</div>",
                field: "SpendingLimit",
                template: that.options.canEditUser ? "<div class='textr'><input class=\"numericText\" id='txtSpendingLimit_${UserId}' UserId=${UserId} name='txtSpendingLimit_${UserId}' value='${SpendingLimit}' /></div>" : "<div class='textr'><label>${SpendingLimit}</label></div>",
                width: "100px"
            }
            ],
            checkboxes: false,
            dataBound: function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">' + loadEmptyGridTemplate("~{NoBudgetsReturned}~") + '</td></tr>');
                }
                $(that.options.gridViewSelector).getKendoGrid().tbody.find(".numericText").each(function () {
                    $(this).kendoNumericTextBox({
                        min: $(this).attr("min"),
                        max: $(this).attr("max"),
                        change: function (e) {
                            e.preventDefault();
                            
                            var limit = e.sender.value();
                            if (limit <= that.options.budgetLeftToSpend || that.options.budgetType == "Group") {
                                $(document).trigger(argosyEvents.START_LOADING, { element: $(".loader"), message: "Updating budget amount"});
                                $(that.options.alertSelector).hide();
                                var userId = e.sender.element.attr("UserId");
                                var params = { userId: userId, spendingLimit: limit };
                                $.ajax({
                                    url: '/Admin/Users/UpdateUserSpendingLimit',
                                    type: "POST",
                                    data: JSON.stringify(params),
                                    dataType: "json",

                                    contentType: "application/json; charset=utf-8",
                                    success: function (result) {
                                        $(document).trigger(argosyEvents.END_LOADING, { element: $(".loader")});
                                        if (!result.IsError) {
                                            prompt.notify({
                                                question: result.Message,
                                                type: "success"
                                            });
                                        } else {
                                            prompt.clientResponseError(result.Message);
                                        }
                                        var grid = $(that.options.gridViewSelector).getKendoGrid();
                                        grid.dataSource.read();
                                        grid.refresh(true);
                                    }
                                });
                            } else {
                                $(that.options.alertSelector).html("<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button><b>Unable to assign that value:</b> The avaliable budget left to assign is " + that.options.budgetLeftToSpend + ".")
                                    .show("slow");
                            }
                        },
                        format: "c",
                        decimal: 2,
                        spinners: false
                    });
                });
                $("div[data-argosy-view=UserGroupBudgetDetailGridView] th:eq(3) ,div[data-argosy-view=UserGroupBudgetDetailGridView]  tr td:nth-child(3)").addClass("hidden-xs");
            },
            dataBinding: function (e) {
            },
            search: [
                { name: "FirstName", type: "text", placeholder: "~{FirstName}~", toolbar: false },
                { name: "LastName", type: "text", placeholder: "~{LastName}~", toolbar: false },
                { name: "UserName", type: "text", placeholder: "~{UserName}~", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchByUserFirstLastUsername}~", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

UserGroupBudgetDetailGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsers",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (that.options.budgetType == "User") {
                        that.options.totalBudgetUsed = 0;
                        $(result.Records).each(function (e) {
                            that.options.totalBudgetUsed += this.SpendingLimit;
                        });

                        that.options.budgetLeftToSpend = that.options.groupBudget - that.options.totalBudgetUsed;
                        if (that.options.budgetLeftToSpend < 0) {
                            that.options.budgetLeftToSpend = 0;
                        }
                        $(that.options.availableBudgetSelector).html(kendo.toString(that.options.budgetLeftToSpend, "C"));
                    } else {
                        $(that.options.availableBudgetSelector).html(kendo.toString(that.options.budgetLeftToSpend, "C"));
                    }
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

UserGroupBudgetDetailGridView.prototype.dataSourceOpts = {};

