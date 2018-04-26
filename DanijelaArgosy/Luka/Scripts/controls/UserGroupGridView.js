function UserGroupGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.search();
}

UserGroupGridView.prototype.options = {};

UserGroupGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserGroupGridView]",
};

UserGroupGridView.prototype.searchCriteria = {
    UserGroup: null
};

UserGroupGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

UserGroupGridView.prototype.search = function () {
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
                title: "~{GroupName}~",
                field: "GroupName",
                template: "<a href='/Admin/UserGroups/Edit/${UserGroupId}'>${GroupName}<a>",
                width: "300px"
            }, {
                title: "~{Description}~",
                field: "GroupDescription",
                width: "900px"
            }, {
                title: "<div class='text-center'>~{Active}~</div>",
                field: "IsActive",
                template: "<div class='bold text-center'>#if (IsActive) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var activateButton = gridElement.find(".k-button.k-button-icontext.k-grid-activate");
                var deactivateButton = gridElement.find(".k-button.k-button-icontext.k-grid-deactivate");
                
                activateButton.unbind("click");
                deactivateButton.unbind("click");
                
                activateButton.click(function (clickEvent) {
                    that.showUpdateUserGroupModal(that.getSelectedRecords(), true);
                });
                deactivateButton.click(function (clickEvent) {
                    that.showUpdateUserGroupModal(that.getSelectedRecords(), false);
                });
            },
            toolbar: [
                { name: "deactivate", text: "<i class='fa fa-close'></i><span class='resp-hidden'> ~{Deactivate}~</span>" },
                { name: "activate", text: "<i class='fa fa-check'></i><span class='resp-hidden'> ~{Activate}~</span>" }
            ],
            search: [
                { name: "GroupName", type: "text", placeholder: "~{GroupName}~", toolbar: false },
                { name: "GroupDescription", type: "text", placeholder: "~{GroupDescription}~", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchGroupNameDescription}~", toolbar: true },
                { name: "IsActive", type: "select", toolbar: true, data:
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

UserGroupGridView.prototype.showUpdateUserGroupModal = function (usergp, activate) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            that.updateUserGroupState(usergp, activate);
        }
    };

    if (activate) {
        message.question = "~{WantToActivateSelection}~";
        message.description = "~{ActiveUserGroupsIgnored}~";
        message.button = "~{Activate}~";
    } else {
        message.question = "~{WantToDeactivateSelection}~";
        message.description = "~{InactiveUserGroupsIgnored}~";
        message.button = "~{Deactivate}~";
    }
    prompt.alert(message);
};

UserGroupGridView.prototype.updateUserGroupState = function (usergp, activate) {
    var that = this;
    var params = { userGroups: usergp, activate: activate };
    $.ajax({
        url: '/Admin/UserGroups/UpdateUserGroupStatus',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "User group " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully " + (activate ? "activated." : "deactivated."),
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

UserGroupGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

UserGroupGridView.prototype.getDataSource = function (dataSourceOpts) {
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

UserGroupGridView.prototype.dataSourceOpts = {};

