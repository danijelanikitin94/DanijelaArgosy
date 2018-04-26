function submitEditPartForm() {
    $("form.update-part")[0].submit();
}

function showAddPartCategoryModal() {
    $.fancybox({
        href: "#divAddCategories"
    });
}

function showAddUserLimitModal() {
    var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid();
    if (grid == null || grid.dataSource == null || grid.dataSource.data().length <= 0) {
        $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, {});
    }
    $.fancybox({
        href: "#AddUserLimit"
    });
}

function showAddUserGroupLimitModal() {
    var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid();
    if (grid == null || grid.dataSource == null || grid.dataSource.data().length <= 0) {
        $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, {});
    }
    $.fancybox({
        href: "#AddGroupLimit"
    });
}

function editPartLimitsTimeFrameForCompanyUser(timeFrame) {
    
    var row = $(timeFrame).closest("tr");
    var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid().dataSource.data()[row.index()];
    
    grid.LimitQuantity = row.find('input').val().trim();
    grid.Days = row.find("select.time-frame").val();
    grid.PartId = $("#PartId").val();
    grid.GotoApprovalIfOverLimit = row.find("select.allow-approvals").val();
    if ((grid.LimitQuantity === "" || grid.LimitQuantity === "0") && grid.Active === false) {
        return false;
    }

    if (grid.LimitQuantity !== "" && grid.LimitQuantity !== "0" && grid.Days !== 'null') {
        updateCompanyUserPartLimit(grid);
    } else {
        return false;
    }
};

function editPartLimitsQuantityForCompanyUser(qty) {
    var row = $(qty).closest("tr");
    var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid().dataSource.data()[row.index()];
    var qtyValue = qty.value.trim();
    if (qtyValue === "0" && grid.Active === false) {
        return false;
    }
    grid.PartId = $("#PartId").val();
    grid.Days = row.find("select.time-frame").val();
    grid.GotoApprovalIfOverLimit = row.find("select.allow-approvals").val();
    if (grid.Days === "null" && grid.Active === false) {
        prompt.notify({
            question: "~{msgRepTimeFrame}~",
            type: "error"
        });
    }
    if (grid.LimitQuantity !== qtyValue) {
        grid.LimitQuantity = qtyValue;
        if (grid.Days !== 'null' && grid.LimitQuantity != "" && grid.LimitQuantity != null) {
            updateCompanyUserPartLimit(grid);
        } else {
            return false;
        }
    }
}

function editPartLimitsTimeFrameForUserGroup(timeFrame) {
    var row = $(timeFrame).closest("tr");
    var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid().dataSource.data()[row.index()];
    grid.LimitQuantity = row.find('input').val().trim();
    grid.Days = row.find("select.time-frame").val();
    grid.PartId = $("#PartId").val();
    grid.GotoApprovalIfOverLimit = row.find("select.allow-approvals").val();
    if ((grid.LimitQuantity === "" || grid.LimitQuantity === "0") && grid.Active === false) {
        return false;
    }

    if (grid.LimitQuantity !== "" && grid.LimitQuantity !== "0" && grid.Days !== 'null') {
        updateUserGroupPartLimits(grid);
    } else {
        return false;
    }
};

function editPartLimitsQuantityForUserGroup(qty) {
    var row = $(qty).closest("tr");
    var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid().dataSource.data()[row.index()];

    if (qty.value.trim() === "0" && grid.Active === false) {
        return false;
    }
    grid.PartId = $("#PartId").val();
    grid.Days = row.find("select.time-frame").val();
    grid.GotoApprovalIfOverLimit = row.find("select.allow-approvals").val();

    if (grid.Days === "null" && grid.Active === false) {
        prompt.notify({
            question: "~{msgRepTimeFrame}~",
            type: "error"
        });
    }
    if (grid.LimitQuantity !== qty.value.trim()) {
        grid.LimitQuantity = qty.value.trim();
        if (grid.Days !== 'null' && grid.LimitQuantity !== "" && grid.LimitQuantity != null) {
            updateUserGroupPartLimits(grid);
        } else {
            return false;
        }
    }
}

function updateUserGroupPartLimits(partLimit) {
    var params = { partLimit: partLimit };
    $.ajax({
        url: '/Admin/Parts/UpdateUserGroupPartLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if (data.ReturnCode === ReturnCode.Success) {
                prompt.notify({
                    question: "~{msgProdLimitUpate}~",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();

            var grid1 = $('div[data-argosy-control="PartUserGroupLimitsGrid"]').find('.k-grid').getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh(true);
        }
    });
    
}

function updateCompanyUserPartLimit(partLimit) {
    var params = { partLimit: partLimit };
    $.ajax({
        url: '/Admin/Parts/UpdateCompanyUserPartLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if (data.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "~{msgProdLimitSuccess}~",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();

            var grid1 = $("div[data-argosy-view=PartUserLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh();
        }
    });
    
}

function clearAllUserGroupPartLimits() {
    var params = { partId: $("#PartId").val() };
    $.ajax({
        url: '/Admin/Parts/DeleteAllUserGroupsPartLimits',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Product Limit for All Company User Groups was" + (!this.Value ? "" : " not") + " successfully deleted.",
                    type: (!this.Value ? "success" : "error")
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);

            var grid1 = $("div[data-argosy-view=PartUserGroupLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh(true);
        }
    });

    $.fancybox.close();
}

function editPartLimit(qty) {
    var row = $(qty).closest("tr");
    var limit = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid().dataSource.data()[row.index()];
    limit.Days = row.find('select').val();
    if (limit.LimitQuantity != qty.value.trim()) {
        limit.LimitQuantity = qty.value.trim();
        if (limit.Days != 'null' && limit.LimitQuantity != "" && limit.LimitQuantity != null) {
            updatePartLimits(limit);
        } else {
            return false;
        }
    }
}
function updatePartLimits(partLimit) {
    var params = { partLimit: partLimit };
    $.ajax({
        url: '/Admin/Users/UpdateUserPartLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if (data.result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "~{msgProdLimitUpate}~",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $('div[data-argosy-control="PartUserLimitsGrid"]').find('.k-grid').getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);
        }
    });
}

function addPartCategories() {
    var items = this.getSelectedRecords();
    if (items.length > 0) {
        var params = { partId: $("#PartId").val(), partCategories: items };
        $.ajax({
            url: "/Admin/Parts/AddPartToPartCategory",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "The Part was " + (!this.Value ? "" : "not") + " successfully added to the Part Group.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=PartGroupCategoriesGrid]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=CompanyCategoriesGridView]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh(true);
            }
        });
    } else {
        prompt.notify({
            question: "~{msgNoItemSelected}~",
            type: "error"
        });
    }
    $.fancybox.close();
};

function getSelectedRecords() {
    var selectedRecords = [];
    var kendoGrid = $("div[data-argosy-view=CompanyCategoriesGridView]").getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};


function closeCommentModal() {
    $.fancybox.close();
};

function clearAllLimits() {
    var message = {
        question: "~{msgProdLimitClear}~",

        button: "Clear",
        type: "warning",
        yes: function (e) {
            clearPartLimitForAllCompanyUsers();
            $.fancybox.close();
        }
    };
    prompt.alert(message);
}

function clearPartLimitForAllCompanyUsers() {
    var params = { partId: $("#PartId").val() };
    $.ajax({
        url: '/Admin/Parts/DeletePartLimitForAllCompanyUsers',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Product Limit for All Company Users was" + (!this.Value ? "" : " not") + " successfully deleted.",
                    type: (!this.Value ? "success" : "error")
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();

            var grid1 = $("div[data-argosy-view=PartUserLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh();
        }
    });

    $.fancybox.close();
}

function updateAllCompanyUserLimits(limit, timeFrame, companyId) {
    var params = { partId: $("#PartId").val(), limit: limit, timeFrame: timeFrame, companyId:companyId };
    $.ajax({
        url: '/Admin/Parts/UpdateAllCompanyUserLimits',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Product Limit for All Company Users was" + (!this.Value ? "" : " not") + " successfully updated.",
                    type: (!this.Value ? "success" : "error")
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();

            var grid1 = $("div[data-argosy-view=PartUserLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh();
        }
    });
    $.fancybox.close();
}

function updateAllCompanyUserGroupLimits(limit, timeFrame, companyId) {
    var params = { partId: $("#PartId").val(), limit: limit, timeFrame: timeFrame, companyId:companyId };
    $.ajax({
        url: '/Admin/Parts/UpdateAllCompanyUserGroupLimits',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Product Limit for All Company User Groups was" + (!this.Value ? "" : " not") + " successfully updated.",
                    type: (!this.Value ? "success" : "error")
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();

            var grid1 = $("div[data-argosy-view=PartUserGroupLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh();
        }
    });
    $.fancybox.close();
}

function setProductLimitForAllUserGroups(companyId) {
    var limit = $("#txtUserGroupPartLimit").val();
    var timeFrame = $("#ddlUserGroupPartLimitTimeFrame").val();
    if (limit == 0 || limit == "") {
        prompt.notify({
            question: "~{msgProdLimitZero}~",
            type: "error"
        });

        return false;
    }

    if (timeFrame == "null") {
        prompt.notify({
            question: "~{msgRepTimeFrame}~",
            type: "error"
        });

        return false;
    }
    var grid = $("div[data-argosy-view=AddEditUserGroupPartLimits]").getKendoGrid();
    var count = grid.dataSource.total();
    var message = {
        question: "Do you want to set all user groups(" + count + ") product limits to " + limit + " per " + $("#ddlUserGroupPartLimitTimeFrame option:selected").text() + "?",
        button: "Set",
        type: "warning",
        yes: function (e) {
            updateAllCompanyUserGroupLimits(limit, timeFrame, companyId);
            $("#txtLimit").val("0");
            $("#ddlTimeFrame").val("null");

        }
    };
    prompt.alert(message);
};

function setProductLimitForAllCompanyUsers(companyId) {
    var limit = $("#txtUserPartLimit").val();
    var timeFrame = $("#ddlUserPartLimitTimeFrame").val();
    if (limit == 0 || limit == "") {
        prompt.notify({
            question: "~{msgProdLimitZero}~",
            type: "error"
        });

        return false;
    }

    if (timeFrame == "null") {
        prompt.notify({
            question: "~{msgRepTimeFrame}~",
            type: "error"
        });

        return false;
    }
    var grid = $("div[data-argosy-view=AddEditCompanyUsersPartLimit]").getKendoGrid();
    var count = grid.dataSource.total();
    var message = {
        question: "Do you want to set all company users(" + count + ") product limits to " + limit + " per " + $("#ddlUserPartLimitTimeFrame option:selected").text() + "?",
        button: "Set",
        type: "warning",
        yes: function (e) {
            updateAllCompanyUserLimits(limit, timeFrame, companyId);
            $("#txtUserPartLimit").val("0");
            $("#ddlUserPartLimitTimeFrame").val("null");

        }
    };
    prompt.alert(message);
};