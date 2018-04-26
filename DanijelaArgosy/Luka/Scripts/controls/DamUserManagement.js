function DamUserManagement(opts) {
    var that = this;
    var controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
      controlLoader.loadTemplate("DamUserManagement", function (template) {
        $(document.body).append(template);
        that.setupTemplate();
        that.setupEventListeners();
        that.initialize();
    });
}

DamUserManagement.prototype.options = {};
DamUserManagement.prototype.controlLoader = new ControlLoader();

DamUserManagement.prototype.baseOptions = {
    assetGroupId: null,
    directoryName: "",
    templateLoaded: false,
    directoryNameHref: "#_DamUserManagementRoleName",
    templates: {
        baseTemplate: "#_DamUserManagementBaseTemplate",
        addRoleModalTemplate: "#_DamUserManagementAddRole",
        
    }
};

DamUserManagement.prototype.searchCriteria = {
};

DamUserManagement.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

DamUserManagement.prototype.setupEventListeners = function () {
    var that = this;
    $(document).bind(argosyEvents.EVENT_ADD_DAM_ROLE, function(e) {
        that.showCreateRole();
    });
}

DamUserManagement.prototype.showCreateRole = function () {
    var that = this;
    var html = $(that.options.templates.addRoleModalTemplate).html();
    $.fancybox({
        content: html,
        afterShow: function(e) {
            kendo.bind($(".fancybox-inner"), kendo.observable({
                createRole: function (e) {
                    that.createRole();
                }
            }));
        }
    });
}

DamUserManagement.prototype.createRole = function () {
    var that = this,
        wrapper = $(".fancybox-inner"),
        textbox = wrapper.find("input[type=text]"),
        toggle = wrapper.find("#addRoleSysAdmin").getKendoToggleSwitch(),
        isSysAdmin = toggle.value(),
        roleName = textbox.val();

    $.ajax({
        url: "/Tools/DigitalAssets/CreateAssetRole",
        dataType: "json",
        data: {
            isSysAdmin: isSysAdmin,
            roleName: roleName
        },
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Failed) {
                prompt.alert({
                    question: result.Message,
                    description: "Ref: " + result.Guid,
                    type: "warning",
                    yes: function (e) {

                    }
                });
            } else {
                that.viewModel.getRoles.read();
                $.fancybox.close();
            }
        }
    });
}

DamUserManagement.prototype.setupTemplate = function () {
    var that = this;
    if (!that.options.templateLoaded) {
        that.getElement().append($(that.options.templates.baseTemplate).html());
        that.options.templateLoaded = true;
    }
}

DamUserManagement.prototype.initialize = function () {
    var that = this;
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        if (data.ExcludeAssetRoleIds != null && data.ExcludeAssetRoleIds.length > 0) {
            that.currentAssetRoleId = JSON.parse(data.ExcludeAssetRoleIds)[0];
        }
    });
    that.viewModel = that.viewModel == null ? that.getViewModel() : that.viewModel;
    kendo.bind(that.getElement(), that.viewModel);
}

DamUserManagement.prototype.getViewModel = function () {
    var that = this,
        viewModel = kendo.observable({
            currentRole: null,
            getRoles: new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        var search = {};
                        $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
                        $.ajax({
                            url: "/Tools/DigitalAssets/GetAssetRoles",
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
                },
                schema: {
                    data: "Records",
                    total: "TotalRecords",
                    model: {
                        id: "Id"
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            }),
            getCurrentAdminStatus: function() {
                if (this.currentRole != null) {
                    return this.currentRole.IsAdmin;
                } else {
                    return false;
                }
            },
            showDetails: function (e) {
                var grid = $(e.currentTarget).closest("[data-role=grid]");
                var masterRow = $(e.currentTarget).closest("tr");
                var detailsRow = masterRow.next();
                this.currentRole = grid.getKendoGrid().dataItem(masterRow);
                grid.find(".k-master-row").show();
                grid.find(".k-detail-row").hide();
                masterRow.hide();
                detailsRow.show();
                if (detailsRow.attr("data-initialized") != "true") {
                    kendo.bind(detailsRow, this);
                    detailsRow.attr("data-initialized", true);
                } else {
                    this.getRoleGroups().read();
                }
            },
            hideDetails: function (e) {
                var detailsRow = $(e.currentTarget).closest("tr");
                var masterRow = detailsRow.prev();
                masterRow.show();
                detailsRow.hide();
            },
            dataBound: function (e) {
                $("#_DamUserManagementModals").find("[data-argosy-control]").each(function(i) {
                    that.controlLoader.processControlElement(this);
                });
            },
            addSelectedUsers: function (e) {
                var grid = $(e.currentTarget).closest(".fancybox-inner").find(".k-widget").getKendoGrid();
                var selected = grid.select();
                var data = [];
                $(selected).each(function (i) {
                    var item = grid.dataItem(this);
                    data.push(item.UserId);
                });
                if (data.length > 0) {
                    $.ajax({
                        url: "/Tools/DigitalAssets/UpdateAssetRoleUsers",
                        dataType: "json",
                        data: {
                            userIds: data,
                            assetRoleId: that.currentAssetRoleId
                        },
                        success: function (result) {
                            if (result.ReturnCode == ReturnCode.Failed) {
                                handleDataSourceException(result);
                            } else {
                                $(document).trigger(argosyEvents.EVENT_RELOAD_ASSET_USERS, {
                                    assetRoleId: that.currentAssetRoleId
                                });
                            }
                        }
                    });
                }
                $.fancybox.close();
            },
            showUpdateRole: function (e) {
                var kendos = this,
                    html = $("#_DamUserManagementUpdateRole").html(),
                    model = kendo.observable({
                        data: new kendo.data.ObservableObject(e.data),
                        updateRole: function (e) {
                            $.fancybox.close();
                            var data = e.data.data,
                                toggle = $("#updateRoleSysAdmin").data("kendoToggleSwitch"),
                                isSysAdmin = toggle.value();
                            data.IsSystemAdministrator = isSysAdmin;
                            $(document).trigger(argosyEvents.START_LOADING, { element: $("#wrapcontainer"), message: "~{MsgDamUpdatingRole}~" });
                            $.ajax({
                                url: "/Tools/DigitalAssets/UpdateAssetRole",
                                dataType: "json",
                                type: "POST",
                                traditional: true,
                                contentType: "application/json; charset=utf-8",
                                data: JSON.stringify(data),
                                success: function (result) {
                                    if (result.ReturnCode == ReturnCode.Failed) {
                                        $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer')});
                                        var message = {
                                            question: result.Message,
                                            type: "warning",
                                        };
                                        prompt.alert(message);
                                    } else {
                                        that.viewModel.getRoles.read();
                                        $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer') });
                                    }
                                }
                            });
                        },
                    });
                $.fancybox({
                    content: html,
                    afterShow: function (e) {
                        kendo.bind($("#_updateRole"), model);
                        $(".focus-me").focus().select();
                    }
                });
            },
            addSelectedUserGroups: function (e) {
                var grid = $(e.currentTarget).closest(".fancybox-inner").find(".k-widget").getKendoGrid();
                var selected = grid.select();
                var data = [];
                $(selected).each(function (i) {
                    var item = grid.dataItem(this);
                    data.push(item.UserGroupId);
                });
                if (data.length > 0) {
                    $.ajax({
                        url: "/Tools/DigitalAssets/UpdateAssetRoleUserGroups",
                        dataType: "json",
                        data: {
                            userGroupIds: data,
                            assetRoleId: that.currentAssetRoleId
                        },
                        success: function (result) {
                            if (result.ReturnCode == ReturnCode.Failed) {
                                handleDataSourceException(result);
                            } else {
                                $(document).trigger(argosyEvents.EVENT_RELOAD_ASSET_USERGROUPS, {
                                    assetRoleId: that.currentAssetRoleId
                                });
                            }
                        }
                    });
                }
                $.fancybox.close();
            }
        });
    return viewModel;
}