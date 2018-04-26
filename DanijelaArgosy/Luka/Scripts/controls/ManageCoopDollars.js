function ManageCoopDollars(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.controlLoader = new ControlLoader();
    that.controlLoader.loadTemplate("ManageCoopDollars", function (template) {
        $("*[data-argosy-uuid='" + that.options.uuid + "']").append(template);
        that.initialize();
        that.loaded = true;
    });
}

ManageCoopDollars.prototype.options = {
    companyId: 0,
    siteId: 0
};

ManageCoopDollars.prototype.baseOptions = {
    baseTemplate: "#_manageCoopDollarsMainTemplate",
    bindContainer: "#_manageCoopDollarsContainer",
    viewModel: null
};

ManageCoopDollars.prototype.initialize = function () {
    var that = this;

    that.options.viewModel = new kendo.data.ObservableObject({
        companyId: that.options.companyId,
        bucketsKeyword: null,
        userKeyword: null,
        userGroupKeyword: null,
        addUsersKeyword: null,
        excludeUserIds: [],
        excludeUserGroupIds: [],
        addUserGroupsKeyword: null,
        siteId: that.options.siteId,
        newBucketName: "",
        userId: 0,
        adjustmentAmount: null,
        adjustmentComments: "",
        adjustmentPurpose: "add",
        itemTypes: "",
        currentBucket: new kendo.data.ObservableObject({
            Name: "",
            Id: null,
            Details: [],
            PartIds: []
        }),
        currentReason: new kendo.data.ObservableObject({
            Reason: "",
            Id: 0
        }),
        usersAdjustDataSource: new kendo.data.DataSource({ pageSize: 5 }),
        partsForBucketDataSource: new kendo.data.DataSource({ pageSize: 5 }),
        change: function (e) {

            $(".checkbox").each(function (i, item) {
                var element = $(item);
                element.removeAttr("checked");
            });

            $(e.sender.select()).find(".checkbox").prop("checked", true);
        },
        checkboxSelectAllUsers: function (e) {
            var usersGrid = $("div[data-id='usersBalanceGrid']").data("kendoGrid");
            if ($(e.toElement).is(":checked")) {
                $.each(usersGrid.items(), function (i, item) {
                    usersGrid.select(item);
                });
            } else {
                usersGrid.clearSelection();
                $(".checkbox").each(function (i, item) {
                    $(item).prop("checked", false);
                });
            };
        },
        checkboxSelectAllUserGroups: function (e) {
            var userGroupsGrid = $("div[data-id='userGoupsBalanceGrid']").data("kendoGrid");
            if ($(e.toElement).is(":checked")) {
                $.each(userGroupsGrid.items(), function (i, item) {
                    userGroupsGrid.select(item);
                });
            } else {
                userGroupsGrid.clearSelection();
                $(".checkbox").each(function (i, item) {
                    $(item).prop("checked", false);
                });
            };
        },
        checkboxClick: function (e) {
            
            var tr = $(e.currentTarget.parentElement.parentElement);
            if (e.currentTarget.checked) {
                tr.addClass("k-state-selected");
            } else {
                tr.removeClass("k-state-selected");
            }
        },
        showBucketFromDetails: function (e) {
            var viewModel = this,
                row = $("tr[data-uid='" + e.data.uid + "']"),
                grid = $("div[data-id='addBucketsGrid']").data("kendoGrid"),
                rows = grid.items(),
                bucket = grid.dataItem(row);
            viewModel.showBucketDetails(bucket);

            // Hack to make the row the Details button is in look selected
            // Really shouldn't have the Details button at all imo -cg
            $.each(rows, function () {
                var dataItem = grid.dataItem($(this));
                if (dataItem.uid === bucket.uid) {
                    $(this).addClass("k-state-selected");
                } else {
                    $(this).removeClass("k-state-selected");
                };
            });
        },
        showBucketFromRow:function(e) {
            var viewModel = e.data,
                grid = e.sender,
                bucket = grid.dataItem(grid.select().last());
            viewModel.showBucketDetails(bucket);
        },
        showBucketDetails: function (bucket) {
            var viewModel = this;
            viewModel.set("currentBucket", new kendo.data.ObservableObject(bucket));
            viewModel.set("bucketDetail", new kendo.data.DataSource({ pageSize: 15 }));
            $.each(viewModel.currentBucket.Details, function (i, detail) {
                viewModel.bucketDetail.add(detail);
            });
            CompanyPartsGridView.prototype.options.bucketId = viewModel.currentBucket.Id;
            $("div[data-argosy-view=CompanyPartsGridView]").getKendoGrid().dataSource.read();
            $("#detailHeaderLabel").text("Details for " + viewModel.currentBucket.get("Name"));
            $("#divBucketDetails").fadeIn();
        },
        saveBucket: function (e) {
            var viewModel = e.data,
                bucketName = viewModel.get("newBucketName"),
                alert = $("#_bucketAlert");

            alert.hide();
            if (bucketName === null || bucketName === undefined || bucketName.length <= 0) {
                alert.text("You must supply a name to continue.").fadeIn();
                return;
            }
            
            var newBucket = {
                Name: bucketName
            };
            $(document).trigger(argosyEvents.START_LOADING);
            $.ajax({
                url: "/admin/coop/SaveBucket",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                method: "POST",
                data: JSON.stringify({ 'bucket': newBucket }),
                success: function (result) {
                    if (result.ReturnCode !== 200) {
                        alert.text(result.Message).show();
                    } else {
                        prompt.notify({
                            question: "Success, bucket added.",
                            type: "success"
                        });
                        viewModel.buckets.read();
                        $("#bucketName").val(""),
                            $.fancybox.close();
                        viewModel.set("currentBucket", new kendo.data.ObservableObject(result.Records));
                    }
                },
                complete: function () {
                    $(document).trigger(argosyEvents.END_LOADING);
                }
            });
        },
        setBucket: function () {
            var bucketsDdl = $("select[data-id='ddlBucket']").data("kendoDropDownList");
            bucketsDdl.value("");
            bucketsDdl.trigger("change");
        },
        setReasonsDdl: function () {
            var reasonsDdl = $("select[data-id='ddlAdjustmentReason']").data("kendoDropDownList");
            reasonsDdl.value("");
            reasonsDdl.trigger("change");
        },
        showAddBucket: function() {
            this.setBucket();
            $("#divUsersBalance,#divUserGroupsBalance,#divCoopAdjustment").hide();
            $("#divAddBuckets").fadeIn();
        },
        showAdjustment: function() {
            this.setBucket();
            $("#divUsersBalance,#divUserGroupsBalance,#divAddBuckets").hide();
            $("#divCoopAdjustment").fadeIn();
        },
        showCoop: function () {
            this.setBucket();
            $("#divUsersBalance,#divUserGroupsBalance").fadeIn();
            $("#divCoopAdjustment,#divAddBuckets").hide();
        },
        saveAdjustment: function (e) {
            var viewModel = e.data,
                alert = $("#_coopAlert"),
                usersGrid = $("div[data-id='selectedUsersGrid']").getKendoGrid(),
                userGroupsGrid = $("div[data-id='selectedUserGroupsGrid']").getKendoGrid(),
                bucketId, reasonId;
            if (viewModel.currentBucket != null) {
                bucketId = viewModel.currentBucket.get("Id");
            } else {
                bucketId = null;
            };
            if (viewModel.currentReason != null) {
                reasonId = viewModel.currentReason.get("Id");
            } else {
                reasonId = 0;
            };
            alert.hide();
            if (bucketId == null) {
                alert.text("You must select a bucket to continue.").fadeIn();
                return;
            };
            if (reasonId === 0) {
                alert.text("You must select an adjustment reason to continue.").fadeIn();
                return;
            };
            if (usersGrid.dataSource.total() <= 0 && userGroupsGrid.dataSource.total() <= 0) {
                alert.text("You must add a user or user group to continue").fadeIn();
                return;
            }
            if (viewModel.get("adjustmentAmount") == null || viewModel.get("adjustmentAmount") <= 0) {
                alert.text("You must enter an amount greater than zero").fadeIn();
                $("#adjustmentAmount").focus();
                return;
            }
            var userIds = [], userGroupIds = [];
            $(usersGrid.dataSource.data()).each(function () {
                if (this.hasOwnProperty("UserId")) {
                    userIds.push(this.UserId);
                }
            });
            $(userGroupsGrid.dataSource.data()).each(function () {
                if (this.hasOwnProperty("UserGroupId")) {
                    userGroupIds.push(this.UserGroupId);
                }
            });
            var adjustment = {
                AdjustmentReasonId: reasonId,
                BucketId: bucketId,
                Comments: viewModel.get("adjustmentComments"),
                Purpose: viewModel.get("adjustmentPurpose"),
                AdjustmentAmount: viewModel.get("adjustmentAmount"),
                AdjusterUserId: 0,
                UserIds: userIds,
                UserGroupIds: userGroupIds
            };
            $(document).trigger(argosyEvents.START_LOADING);
            $.ajax({
                url: "/admin/coop/SaveAdjustment",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                method: "POST",
                data: JSON.stringify({ 'adjustment': adjustment }),
                success: function (result) {
                    if (result.ReturnCode !== 200) {
                        prompt.clientResponseError(result);
                    } else {
                        prompt.notify({
                            question: "Success, adjustment(s) added.",
                            type: "success"
                        });
                        viewModel.setReasonsDdl();
                        viewModel.setBucket();
                        viewModel.usersLedger.read();
                        viewModel.userGroupsLedger.read();
                        viewModel.set("adjustmentComments", "");
                        viewModel.set("adjustmentAmount", null);
                        viewModel.set("adjustmentPurpose", "add");
                        viewModel.set("excludeUserIds", []);
                        viewModel.set("excludeUserGroupIds", []);
                        viewModel.set("addUsersKeyword", null);
                        viewModel.set("addUserGroupsKeyword", null);
                        $("div[data-id='selectedUsersGrid']").data("kendoGrid").dataSource.data([]);
                        $("div[data-id='selectedUserGroupsGrid']").data("kendoGrid").dataSource.data([]);
                        $("div[data-id='addUsersGrid']").data("kendoGrid").dataSource.read();
                        $("div[data-id='addUserGroupsGrid']").data("kendoGrid").dataSource.read();
                        $("div[data-id='usersBalanceGrid']").data("kendoGrid").dataSource.read();
                        $("div[data-id='userGroupsBalanceGrid']").data("kendoGrid").dataSource.read();
                    }
                },
                complete: function (e) {
                    $(document).trigger(argosyEvents.END_LOADING);
                }
            });

        },
        removeDetail:function(e) {
            var viewModel = this,
                itemToDelete = e.data;
            $.ajax({
                url: "/admin/coop/DeleteDetail",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                method: "POST",
                data: JSON.stringify({ 'detailId': itemToDelete.Id }),
                success: function(result) {
                    if (result.ReturnCode !== 200) {
                        prompt.notify({
                            question: result.Message,
                            type: "error"
                        });
                    } else {
                        prompt.notify({
                            question: "Success, detail deleted.",
                            type: "success"
                        });

                        var index = -1, item;
                        $.each(viewModel.currentBucket.Details, function (i, detail) {
                            if (detail.Id === itemToDelete.Id) {
                                var bucketDetail = ManageCoopDollars.prototype.options.viewModel.bucketDetail;
                                item = bucketDetail.getByUid(detail.uid);
                                index = i;
                            };
                        });

                        if (index >= 0) {
                            viewModel.currentBucket.Details.splice(index, 1);
                        };
                        if (item != null) {
                            viewModel.bucketDetail.remove(item);
                        };
                    }
                }
            });
        },
        searchUserBalance: function () {
            var viewModel = this;

            viewModel.usersLedger.read();
        },
        searchUserGroupBalance: function () {
            var viewModel = this;

            viewModel.userGroupsLedger.read();
        },
        searchBuckets: function (e) {
            var viewModel = this;

            viewModel.buckets.read();
        },
        removePart: function (e) {
            this.removeDetail(e);
            this.partsForBucketDataSource.remove(e.data);
        },
        removeUser: function (e) {
            this.usersAdjustDataSource.remove(e.data);
        },
        addBucket: function (e) {

            $.fancybox({ href: "#divAddNewBucket" });
        },
        addItemTypesToDetail: function (e) {

            $.fancybox({ href: "#divAddItemTypesToBucket" });
        },
        addPartToDetail: function (e) {

            $.fancybox({ href: "#divAddParts" });
        },
        savePartToDetail: function (e) {
            var details = [],
                viewModel = e.data;

            var kendoGrid = $("div[data-argosy-view=CompanyPartsGridView]").getKendoGrid();
            
            $(kendoGrid.select()).each(function (i) {
                var part = kendoGrid.dataItem(this);
                var bucketDetail = {
                    BucketId: viewModel.currentBucket.get("Id"),
                    PartName: part.PartName,
                    PartId: part.PartId,
                    Sku: part.Sku
                };
                details.push(bucketDetail);
            });
            if (details.length > 0) {
                $.ajax({
                    url: "/admin/coop/SaveBucketDetails",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    method: "POST",
                    data: JSON.stringify({ 'details': details }),
                    success: function (result) {
                        if (result.ReturnCode !== 200) {
                            prompt.notify({
                                question: result.Message,
                                type: "error"
                            });
                        } else {
                            prompt.notify({
                                question: "Success, detail added.",
                                type: "success"
                            });
                            $(result.Records).each(function (i, bucketDetail) {
                                viewModel.currentBucket.Details.push(bucketDetail);
                                viewModel.currentBucket.PartIds.push(bucketDetail.PartId);
                                viewModel.bucketDetail.add(bucketDetail);
                            });

                            CompanyPartsGridView.prototype.options.excludePartIds = $(viewModel.currentBucket.PartIds).toArray();
                            var grid = $("div[data-argosy-view=CompanyPartsGridView]").data("kendoGrid");
                            grid.dataSource.read();
                        }
                        $.fancybox.close();
                    },
                    complete: function() {
                        $(document).trigger(argosyEvents.END_LOADING);
                    }
                });
                
            } 
        },
        saveItemTypesToDetail: function (e) {
            var viewModel = e.data,
                alert = $("#_addItemTypesAlert"),
                bucketId;
            if (viewModel.currentBucket != null) {
                bucketId = viewModel.currentBucket.get("Id");
            } else {
                bucketId = null;
            };
            var details = [{
                BucketId: bucketId,
                ItemTypes: viewModel.get("itemTypes")
            }];
            alert.hide();
            if (details[0].ItemTypes.length <= 0) {
                alert.text("Item Type value is required.").fadeIn();
                return false;
            }
            $.ajax({
                url: "/admin/coop/SaveBucketDetails",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                method: "POST",
                data: JSON.stringify({ 'details': details }),
                success: function (result) {
                    if (result.ReturnCode !== 200) {
                        alert.text(result.Message).fadeIn();
                    } else {
                        prompt.notify({
                            question: "Success, detail added.",
                            type: "success"
                        });
                        viewModel.set("itemTypes", "");
                        viewModel.currentBucket.set("Details", []);
                        $(result.Records).each(function (i, bucketDetail) {
                            viewModel.currentBucket.Details.push(bucketDetail);
                            viewModel.bucketDetail.add(bucketDetail);
                        });
                        $.fancybox.close();
                    };
                },
                complete: function () {
                    $(document).trigger(argosyEvents.END_LOADING);
                }
            });
        },
        buckets: new kendo.data.DataSource({
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                },
                model: {
                    id: "Id"
                },
                parse: function (response) {
                    return response;
                }
            },
            transport: {
                read: {
                    cache: false,
                    url: "/admin/Coop/GetAvailableBuckets",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                parameterMap: function (data, type) {
                    switch(type) {
                        case "read":
                            var viewModel = ManageCoopDollars.prototype.options.viewModel,
                                bucketId;
                            if (viewModel.currentBucket != null) {
                                bucketId = viewModel.currentBucket.get("Id");
                            } else {
                                bucketId = null;
                            };
                            data = kendoOptionsToObject(data);
                            data.BucketId = bucketId;
                            data.UserId = viewModel.get("userId");
                            data.CompanyId = viewModel.get("companyId");
                            data.Keyword = viewModel.get("bucketsKeyword");
                            break;
                    };
                    return data;
                },
                error: function (e) {
                }
            },
            pageSize: 25,
            serverFiltering: false,
            serverPaging: false
        }),
        assignedBuckets: new kendo.data.DataSource({
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                },
                model: {
                    id: "Id"
                },
                parse: function (response) {
                    return response;
                }
            },
            transport: {
                read: {
                    cache: false,
                    url: "/admin/Coop/GetAssignedBuckets",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                update: {
                    url: "/admin/Coop/RenameBucket",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                parameterMap: function (data, type) {
                    switch (type) {
                        case "read":
                            var viewModel = ManageCoopDollars.prototype.options.viewModel;
                            data = kendoOptionsToObject(data);
                            data.UserId = viewModel.get("userId");
                            data.CompanyId = viewModel.get("companyId");
                            data.Keyword = viewModel.get("bucketsKeyword");
                            break;
                        case "update":
                            data = kendo.stringify(data);
                            break;
                    };
                    return data;
                },
                error: function (e) {
                }
            },
            pageSize: 25,
            serverPaging: false,
            serverSorting: false
        }),
        bucketDetail: new kendo.data.DataSource({ pageSize: 15 }),
        reasons: new kendo.data.DataSource({
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            transport: {
                read: {
                    cache: false,
                    url: "/admin/Coop/GetAdjustmentReasons",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                error: function (e) {
                }
            },
            serverFiltering: true,
            serverPaging: true,
            serverSorting: true,
            pageSize: 25

        }),
        usersLedger: new kendo.data.DataSource({
            group: {
                field: "UserName", aggregates: [
                    { field: "UserName", aggregate: "count" }
                ]
            },
            aggregate: [{ field: "UserName", aggregate: "count" }],
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            transport: {
                read: {
                    cache: false,
                    url: "/admin/Coop/GetCoopDollarBalances",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                parameterMap: function (data) {
                    var viewModel = that.options.viewModel,
                        bucketId;
                    if (viewModel.currentBucket != null) {
                        bucketId = viewModel.currentBucket.get("Id");
                    } else {
                        bucketId = null;
                    };
                    data = kendoOptionsToObject(data);
                    data.BucketId = bucketId;
                    data.UserId = viewModel.get("userId");
                    data.CompanyId = viewModel.get("companyId");
                    data.SiteId = viewModel.get("siteId");
                    data.Keyword = viewModel.get("userKeyword");
                    data.IsUserGroup = false;
                    return data;
                },
                error: function (e) {
                }
            },
            pageSize: 25,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true
        }),
        userGroupsLedger: new kendo.data.DataSource({
            group: {
                field: "UserGroupName", aggregates: [
                    { field: "UserGroupName", aggregate: "count" }
                ]
            },
            aggregate: [{ field: "UserGroupName", aggregate: "count" }],
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            transport: {
                read: {
                    cache: false,
                    url: "/admin/Coop/GetCoopDollarBalances",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                parameterMap: function (data) {
                    var viewModel = ManageCoopDollars.prototype.options.viewModel,
                        bucketId;
                    if (viewModel.currentBucket != null) {
                        bucketId = viewModel.currentBucket.get("Id");
                    } else {
                        bucketId = null;
                    };
                    data = kendoOptionsToObject(data);
                    data.BucketId = bucketId;
                    data.UserGroupId = viewModel.get("userGroupId");
                    data.CompanyId = viewModel.get("companyId");
                    data.SiteId = viewModel.get("siteId");
                    data.Keyword = viewModel.get("userGroupKeyword");
                    data.IsUserGroup = true;
                    return data;
                },
                error: function (e) {
                }
            },
            pageSize: 25,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true
        }),
        addUsers: function (e) {
            $.fancybox({
                href: "#AddUserToAdjustment"
            });
        },
        addSelectedUsers: function(e) {
            $(document).trigger(argosyEvents.START_LOADING);
            var addUsersGrid = $("div[data-id='addUsersGrid']").data("kendoGrid"),
                selectedUsersGrid = $("div[data-id='selectedUsersGrid']").data("kendoGrid");
                
            if (addUsersGrid.select().length > 0) {
                $.each(addUsersGrid.select(),
                    function (i, user) {
                        user = addUsersGrid.dataItem(user);
                        selectedUsersGrid.dataSource.add(user);
                        e.data.excludeUserIds.push(user.UserId);
                    });
                addUsersGrid.dataSource.read();
                $.fancybox.close();
            };
            $(document).trigger(argosyEvents.END_LOADING);
        },
        searchAddUsers: function (e) {
            e.data.addUsersDataSource.read();
        },
        searchAddUserGroups: function (e) {
            e.data.addUserGroupsDataSource.read();
        },
        addUsersDataSource: new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/DataView/GetUsers",
                    dataType: "json"
                },
                parameterMap: function (data) {
                    data.Keyword = that.options.viewModel.get("addUsersKeyword");
                    data.Active = true;
                    data.ExcludeUserIds = $(that.options.viewModel.get("excludeUserIds")).toArray();
                    return data;
                }
            },
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            pageSize: 10,
            requestStart: function () {
                $(document).trigger(argosyEvents.START_LOADING);
            },
            requestEnd: function () {
                $(document).trigger(argosyEvents.END_LOADING);
            }
        }),
        addUserGroups: function (e) {
            $.fancybox({
                href: "#AddUserGroupToAdjustment"
            });
        },
        addSelectedUserGroups: function (e) {
            $(document).trigger(argosyEvents.START_LOADING);
            var addUserGroupsGrid = $("div[data-id='addUserGroupsGrid']").data("kendoGrid"),
                selectedUserGroupsGrid = $("div[data-id='selectedUserGroupsGrid']").data("kendoGrid");
            if (addUserGroupsGrid.select().length > 0) {
                $.each(addUserGroupsGrid.select(),
                    function (i, userGroup) {
                        userGroup = addUserGroupsGrid.dataItem(userGroup);
                        selectedUserGroupsGrid.dataSource.add(userGroup);
                        e.data.excludeUserGroupIds.push(userGroup.UserGroupId);
                    });
                addUserGroupsGrid.dataSource.read();
                $.fancybox.close();
            };
            $(document).trigger(argosyEvents.END_LOADING);
        },
        addUserGroupsDataSource: new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/DataView/GetUserGroups",
                    dataType: "json"
                },
                parameterMap: function (data) {
                    data.Keyword = that.options.viewModel.get("addUserGroupsKeyword");
                    data.Active = true;
                    data.excludeUserGroupIds = $(that.options.viewModel.get("excludeUserGroupIds")).toArray();
                    return data;
                }
            },
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            pageSize: 10,
            requestStart: function () {
                $(document).trigger(argosyEvents.START_LOADING);
            },
            requestEnd: function () {
                $(document).trigger(argosyEvents.END_LOADING);
            }
        }),
        usersBalanceDataBound: function (e) {
            var rows = e.sender.element.find(".k-grouping-row");
            $.each(rows, function(i, row) {
                e.sender.collapseGroup(row);
            });
        },
        selectedUsersDataSource: new kendo.data.DataSource({ pageSize: 5 }),
        selectedUserGroupsDataSource: new kendo.data.DataSource({ pageSize: 5 }),
        selectedUsersDataBound: function(e) {
            var selectedUserGroupsGrid = $("div[data-id='selectedUserGroupsGrid']").data("kendoGrid");
            if (e.sender.dataSource.total() < 1 && (selectedUserGroupsGrid == null || selectedUserGroupsGrid.dataSource.total() < 1)) {
                $("#addUsersMessage").show();
                $("button[data-bind$='saveAdjustment']").attr("disabled", true);
            } else {
                $("#addUsersMessage").hide();
                $("button[data-bind$='saveAdjustment']").attr("disabled", false);
            };
        },
        selectedUserGroupsDataBound: function (e) {
            var selectedUsersGrid = $("div[data-id='selectedUsersGrid']").data("kendoGrid");
            if (e.sender.dataSource.total() < 1 && (selectedUsersGrid == null || selectedUsersGrid.dataSource.total() < 1)) {
                $("#addUsersMessage").show();
                $("button[data-bind$='saveAdjustment']").attr("disabled", true);
            } else {
                $("#addUsersMessage").hide();
                $("button[data-bind$='saveAdjustment']").attr("disabled", false);
            };
        },
        removeSelectedUser: function(e) {
            $(document).trigger(argosyEvents.START_LOADING);
            var addUsersGrid = $("div[data-id='addUsersGrid']").data("kendoGrid"),
                selectedUsersGrid = $("div[data-id='selectedUsersGrid']").data("kendoGrid"),
                index = this.excludeUserIds.indexOf(e.data.UserId);
            if (index >= 0) {
                this.excludeUserIds.splice(index, 1);
            };
            addUsersGrid.dataSource.read();
            selectedUsersGrid.dataSource.remove(e.data);
            $(document).trigger(argosyEvents.END_LOADING);
        },
        removeSelectedUserGroup: function (e) {
            $(document).trigger(argosyEvents.START_LOADING);
            var addUserGroupsGrid = $("div[data-id='addUserGroupsGrid']").data("kendoGrid"),
                selectedUserGroupsGrid = $("div[data-id='selectedUserGroupsGrid']").data("kendoGrid"),
                index = this.excludeUserGroupIds.indexOf(e.data.UserGroupId);
            if (index >= 0) {
                this.excludeUserGroupIds.splice(index, 1);
            };
            addUserGroupsGrid.dataSource.read();
            selectedUserGroupsGrid.dataSource.remove(e.data);
            $(document).trigger(argosyEvents.END_LOADING);
        }
    });
    kendo.bind($(that.options.bindContainer), that.options.viewModel);
    kendo.bind($("._toolbar"), that.options.viewModel);
    kendo.bind($(that.options.bindContainer).find(".k-header"), that.options.viewModel);
    kendo.bind($("#_bucketsDetail"), that.options.viewModel);
    $("*[data-argosy-control]:not([data-argosy-uuid]:not([data-role]))").each(function (i) { that.controlLoader.processControlElement(this, function (a) { }); });
    $("#userCompleteInput").attr("placeholder", "by name or username");
    $(that.options.baseTemplate).show();
};