function GlobalProfileUsersGridView(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

GlobalProfileUsersGridView.prototype.options = {};

GlobalProfileUsersGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=GlobalProfileUsersGridView]",
};

GlobalProfileUsersGridView.prototype.searchCriteria = {
};

GlobalProfileUsersGridView.prototype.setupGrid = function () {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,

            //APM
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
                    title: "~{UserName}~",
                    field: "UserName",
                    width: "40%"
                }, {
                    title: "~{FullName}~",
                    template: "${FirstName} ${LastName}",
                    width: "40%"
                }],
            title: "~{AssignToUsers}~",
            toolbar: [
                { name: "addProfileUsers", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addProfileUsers: function (e) {
                $.fancybox({
                    href: "#AddUserToGlobalProfile"
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
                        that.showDeleteUserFromProfile(data);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

GlobalProfileUsersGridView.prototype.showDeleteUserFromProfile = function (data) {
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
    message.question = "Are you sure you want to remove this user from this profile?";
    message.button = "Remove";
    prompt.alert(message);
};

GlobalProfileUsersGridView.prototype.deleteUserFromProfile = function (user) {
    var that = this;
    var params = { user: user };
    $.ajax({
        url: '/Admin/GlobalProfiles/DeleteUserFromProfile',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "User " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            grid.dataSource.read();

            var grid02 = $("div[data-argosy-view=AddUserToGlobalProfile]").getKendoGrid();
            grid02.dataSource.read();
        }
    });
    $.fancybox.close();
    return false;
};

GlobalProfileUsersGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.serverPaging = true;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            search.IsUserSearch = true;
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
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalProfileUsersGridView.prototype.dataSourceOpts = {};

GlobalProfileUsersGridView.prototype.addUsersToProfile = function () {
    var that = this;
    var selectedUserIds = that.getSelectedUsers();

    if (selectedUserIds.length > 0) {
        var params = { globalFormsProfileId: $("#Id").val(), userIds: selectedUserIds };
        $.ajax({
            url: "/Admin/GlobalProfiles/AddUsersToGlobalProfile",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "Users were " + (!this.Value ? "" : "not") + " successfully added to the Profile.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=GlobalProfileUsersGridView]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=AddUserToGlobalProfile]").getKendoGrid();
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

GlobalProfileUsersGridView.prototype.getSelectedUsers = function () {
    var that = this;
    var selectedUserIds = [];
    var grid = $("div[data-argosy-view=AddUserToGlobalProfile]").getKendoGrid();

    $(grid.select()).each(function (i) {
        selectedUserIds.push(grid.dataItem(this).UserId);
    });

    return selectedUserIds;
}

