function AccountUnitGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

AccountUnitGridView.prototype.options = {
    userId: 0,
    companyId: 0
};

AccountUnitGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AccountUnitGridView]",
    forModal:false,
};

AccountUnitGridView.prototype.searchCriteria = {
};

AccountUnitGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AccountUnitGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{AccountingUnit}~",
                    field: "AccountUnitDesc",
                    template: "<a href='/Admin/AccountUnit/Edit/${AccountingUnitId}'>${AccountUnitDesc}<a>",
                }, {
                    title: "~{ProcessLevel}~",
                    field: "ProcessLevel"
                }, {
                    title: "~{Department}~",
                    field: "DepartmentDescription"
                }, {
                    title: "~{State}~",
                    field: "State"
                }, {
                    title: "<div class='text-center'>~{Active}~</div>",
                    field: "IsActive",
                    template: "<div class='bold text-center'>#if (IsActive == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>"
                }
            ],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var activateButton = gridElement.find(".k-button.k-button-icontext.k-grid-activate");
                var deactivateButton = gridElement.find(".k-button.k-button-icontext.k-grid-deactivate");
                if (!that.options.forModal) {
                    activateButton.unbind("click");
                    deactivateButton.unbind("click");

                    activateButton.click(function(clickEvent) {
                        that.showUpdateAUModal(that.getSelectedRecords(), true);
                    });
                    deactivateButton.click(function(clickEvent) {
                        that.showUpdateAUModal(that.getSelectedRecords(), false);
                    });
                } else {
                    activateButton.hide();
                    deactivateButton.hide();
                    gridElement.find(".k-grid-export-excel").hide();
                }
                $("div[data-argosy-view=AccountUnitGridView] th:eq(2) ,div[data-argosy-view=AccountUnitGridView]  tr td:nth-child(3)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=AccountUnitGridView] th:eq(3),div[data-argosy-view=AccountUnitGridView]  tr td:nth-child(4)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=AccountUnitGridView] th:eq(4),div[data-argosy-view=AccountUnitGridView]  tr td:nth-child(5)").addClass("hidden-sm hidden-xs");
            },
            toolbar: [
                { name: "deactivate", text: "<i class='fa fa-close'></i><span class='resp-hidden'> ~{Deactivate}~</span>" },
                { name: "activate", text: "<i class='fa fa-check'></i><span class='resp-hidden'> ~{Activate}~</span>" }
            ],
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByNameState}~", toolbar: true },
                {
                    name: "IsActive", type: "select", toolbar: true, data:
                      [
                          { value: "true", text: "~{Active}~", selected: true },
                          { value: "false", text: "~{Inactive}~" },
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

AccountUnitGridView.prototype.showUpdateAUModal = function (units, activate) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            that.updateAUState(units, activate);
        },
        no: function(e) {
            
        }
    };

    if (activate) {
        message.question = "~{WantToActivateSelection}~";
        message.description = "~{ActiveAccountsIgnored}~";
        message.button = "~{Activate}~";
    } else {
        message.question = "~{WantToDeactivateSelection}~";
        message.description = "~{InactiveAccountsIgnored}~";
        message.button = "~{Deactivate}~";
    }
    prompt.alert(message);
};

AccountUnitGridView.prototype.updateAUState = function (units, activate) {
    var that = this;
    $(units).each(function(i, au) {
        au.IsActive = activate;
    });
    var params = { accountUnits: units };
    $.ajax({
        url: '/Admin/AccountUnit/UpdateACUnitStatus',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Account unit(s) were " + (result.ReturnCode == ReturnCode.Success ? "" : "not") + " successfully " + (activate ? "activated." : "deactivated."),
                    type: (!this.Value ? "success" : "error")
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

AccountUnitGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

AccountUnitGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this, url;
    if (that.options.type === "admin") {
        url = "/DataView/GetAccountUnits";
    } else {
        url = "/DataView/GetAvailableAccountUnitsForUser";
    };
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria, that.options);
            $.ajax({
                url: url,
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
    that.dataSourceOpts.schema = {
        data: function (response) {
            return response.Records;
        },
        total: function (response) {
            return response.TotalRecords;
        }
    };
    that.dataSourceOpts.serverPaging = true;
    that.dataSourceOpts.pageSize = 20;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

AccountUnitGridView.prototype.dataSourceOpts = {};
