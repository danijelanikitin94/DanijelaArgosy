function GlobalProfileUserGroupsGridView(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

GlobalProfileUserGroupsGridView.prototype.options = {};

GlobalProfileUserGroupsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=GlobalProfileUserGroupsGridView]"
};

GlobalProfileUserGroupsGridView.prototype.searchCriteria = {
};

GlobalProfileUserGroupsGridView.prototype.setupGrid = function () {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,
            selectable: "multiple, row",
            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "~{Name}~",
                    field: "GroupName"
                }],
            title: "~{AssignToUserGroups}~",
            toolbar: [
                { name: "addProfileUserGroups", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addProfileUserGroups: function (e) {
                $.fancybox({
                    href: "#AddUserGroupToGlobalProfile"
                });
            },
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click").click(function () {
                        that.showDeleteUserGroupFromProfile(data);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

GlobalProfileUserGroupsGridView.prototype.showDeleteUserGroupFromProfile = function (data) {
    var that = this;
    var isBtnClicked = false;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (!isBtnClicked) {
                that.deleteUserFromProfile(data);
                isBtnClicked = true;
            }
        }
    };
    message.question = "Are you sure you want to remove this user group from this profile?";
    message.button = "Remove";
    prompt.alert(message);
};

GlobalProfileUserGroupsGridView.prototype.deleteUserFromProfile = function (userGroup) {
    var that = this;
    var params = { userGroup: userGroup };
    $.ajax({
        url: '/Admin/GlobalProfiles/DeleteUserGroupFromProfile',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "User Group " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);

            var grid02 = $("div[data-argosy-view=AddUserGroupToGlobalProfile]").getKendoGrid();
            grid02.dataSource.read();
            grid02.refresh(true);
        }
    });
    $.fancybox.close();
};

GlobalProfileUserGroupsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.serverPaging = true;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            search.IsUserSearch = false;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Admin/GlobalProfiles/GetGlobalProfileUsers",
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
        id: "GlobalFormsUsersId",
        data: function (response) {
            return response.Records;
        },
        total: function (response) {
            return response.TotalRecords;
        }
    }
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalProfileUserGroupsGridView.prototype.dataSourceOpts = {};

GlobalProfileUserGroupsGridView.prototype.addUserGroupsToProfile = function () {
    var that = this;
    var selectedUserGroupIds = that.getSelectedUserGroups();

    if (selectedUserGroupIds.length > 0) {
        var params = { globalFormsProfileId: $("#Id").val(), userGroupIds: selectedUserGroupIds };
        $.ajax({
            url: "/Admin/GlobalProfiles/AddUserGroupsToGlobalProfile",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "User Groups were " + (!this.Value ? "" : "not") + " successfully added to the Profile.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=GlobalProfileUserGroupsGridView]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=AddUserGroupToGlobalProfile]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh(true);
            }
        });
    } else {
        prompt.notify({
            question: "No items selected.",
            type: "error"
        });
    }
    $.fancybox.close();
}

GlobalProfileUserGroupsGridView.prototype.getSelectedUserGroups = function () {
    var that = this;
    var selectedUserGroupIds = [];
    var grid = $("div[data-argosy-view=AddUserGroupToGlobalProfile]").getKendoGrid();

    $(grid.select()).each(function (i) {
        selectedUserGroupIds.push(grid.dataItem(this).UserGroupId);
    });

    return selectedUserGroupIds;
}

