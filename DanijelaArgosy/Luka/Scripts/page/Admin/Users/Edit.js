$(document).ready(function () {
});

function setAllLimits() {
    var limit = $("#txtLimit").val();
    var timeFrame = $("#ddlTimeFrame").val();
    if (limit === 0 || limit === "") {
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
    var grid = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid();
    var count = grid.dataSource.total();
    var message = {
        question: "~{msgWantToSetAllProductLimits}~ (" + count + ")?",
        button: "Set",
        type: "warning",
        yes: function (e) {
            changePartLimits(limit, timeFrame);
            $("#txtLimit").val("0");
            $("#ddlTimeFrame").val("null");

        }
    };
    prompt.alert(message);
};

function viewPartLimits(timeFrame) {
    var row = $(timeFrame).closest("tr");
    var grid = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid().dataSource.data()[row.index()];
    grid.LimitQuantity = row.find('input').val().trim();
    grid.Days = timeFrame.value;

    if ((grid.LimitQuantity == "" || grid.LimitQuantity == "0") && grid.Active == false) {
        return false;
    }

    if (grid.LimitQuantity != "" && grid.LimitQuantity != "0" && timeFrame.value != 'null') {
        updatePartLimits(grid);
    } else {
        return false;
    }
};

function editPartLimit(qty) {
    var row = $(qty).closest("tr");
    var grid = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid().dataSource.data()[row.index()];

    if (qty.value.trim() == "0" && grid.Active == false) {
        return false;
    }

    grid.Days = row.find('select').val();

    if (grid.Days == "null" && grid.Active == false) {
        prompt.notify({
            question: "~{msgRepTimeFrame}~",
            type: "error"
        });
    }
    if (grid.LimitQuantity != qty.value.trim()) {
        grid.LimitQuantity = qty.value.trim();
        if (grid.Days != 'null' && grid.LimitQuantity != "" && grid.LimitQuantity != null) {
            updatePartLimits(grid);
        } else {
            return false;
        }
    }
}

function showAddPartCategoryModal() {
    $.fancybox({
        href: "#PartCat"
    });
}

function showAddEditProductLimitsModal() {
    $.fancybox({
        href: "#AddProLim"
    });
}

function showAddCoOpFundsModal() {
    if ($("#txtAmount").getKendoNumericTextBox() == null) {
        $("#txtAmount").kendoNumericTextBox({
            format: "c", decimals: 2,  spinners: false,value:0.0
        });
    }

    $("#txtAmount").prop("isClicked", false);

    if ($("#ddlAdjustmentReason").getKendoDropDownList() == null) {
        $.ajax({
            url: "/admin/coop/GetAvailableBucketsAndReasons",
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify({}),
            processData: false,
            success: function(result) {
                if (result.ReturnCode == ReturnCode.Failed) {
                    handleDataSourceException(result);
                } else {
                    var dataSource = result.Reasons;
                    $("#ddlAdjustmentReason").width(200).kendoDropDownList({
                        optionLabel: "Select Adjustment Reason",
                        dataTextField: "Reason",
                        dataValueField: "Id",
                        dataSource: {
                            data: dataSource
                        },
                        dataBound: function(e) {
                         
                        }
                    });
                    $("#ddlBuckets").width(200).kendoDropDownList({
                        optionLabel: "Select Bucket",
                        dataTextField: "Name",
                        dataValueField: "Id",
                        dataSource: {
                            data: result.Buckets
                        },
                        dataBound: function(e) {
                         
                        }
                    });
                    
                    $.fancybox({
                                href: "#AddCoOpFundsModal",
                                onClose: function () {
                                    $("#ddlAdjustmentReason").getKendoDropDownList().value("");
                                    $("#ddlBuckets").getKendoDropDownList().value("");
                                    $("#txtAmount").getKendoNumericTextBox().value(0);
                                    $("#txtCoopComments").val('');
                                }
                            });

                }
            },
            error: function(args) {
            }
        });
    } else {
        $.fancybox({
            href: "#AddCoOpFundsModal",
            onClose:function() {
                $("#ddlAdjustmentReason").getKendoDropDownList().value("");
                $("#txtAmount").getKendoNumericTextBox().value(0);
                $("#ddlBuckets").getKendoDropDownList().value("");
                $("#txtCoopComments").val('');
            }
        });
    }
}

function saveCoopFunds(adminUserId, userId) {
    if ($("#txtAmount").prop("isClicked") === true) {
        return false;
    }
    var ddlAdjustmentReason = $("#ddlAdjustmentReason").getKendoDropDownList(),
        adjReason = 3,
        bucket = $("#ddlBuckets").val(),
        txtAmount = $("#txtAmount").getKendoNumericTextBox(),
        comments = $("#txtCoopComments").val(),
        userIds = [];

    if (txtAmount.value() === 0) {
        prompt.notify({
            question: "~{msgEnterCoopHigherZero}~",
            type: "error"
        });
        return false;
    }
    if (ddlAdjustmentReason.value() !== "") {
        adjReason = ddlAdjustmentReason.value();
    }

    $("#txtAmount").prop("isClicked", true);
    userIds.push(userId);

    var adjustment = {
        AdjustmentReasonId: parseInt(adjReason),
        BucketId: bucket,
        Comments: comments,
        Purpose: "",
        AdjusterUserId: adminUserId,
        AdjustmentAmount: txtAmount.value(),
        UserIds: userIds
    };
    
    $.ajax({
        url: "/admin/coop/SaveAdjustment",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({ 'adjustment': adjustment }),
        processData: false,
        success: function (result) {
            if (result.ReturnCode !== 200) {
                handleDataSourceException(result);
                prompt.notify({
                    question: "~{msgErrorCoopDollarsAdded}~",
                    type: "error"
                });
                $("#txtAmount").prop("isClicked", false);
            } else {
                ddlAdjustmentReason.value("");
                txtAmount.value(0);
                var grid1 = $("div[data-id='_userCoopFundsGrid']").data("kendoGrid");
                grid1.dataSource.read();
                grid1.refresh(true);
                
                prompt.notify({
                    question: "~{msgCoopDollarsAdded}~",
                    type: "success"
                });
            }

            $.fancybox.close();
        },
        error: function (args) {
        }
    });
}
function doSomething(e) {
    e.preventDefault();
}
function closeModal() {
    $.fancybox.close();
}

function clearAllLimits() {
    var message = {
        question: "~{msgWantToClearLimits}~",

        button: "Clear",
        type: "warning",
        yes: function (e) {
            clearAllPartLimits();

        }
    };
    prompt.alert(message);
}

function userUpdate() {
    var isButtonClicked = false;
    var message = {
        question: "~{msgWantToUpdateUser}~",
        //description: "",
        button: "update",
        type: "warning",
        yes: function (e) {
            if (!isButtonClicked) {
                $("form.update-user")[0].submit();
                $.fancybox.close();
                isButtonClicked = true;
            }
        }
    };
    prompt.alert(message);
}

function changePartLimits(limit, timeFrame) {
    var params = { userId: $("#UserId").val(), limit: limit, timeFrame: timeFrame };
    $.ajax({
        url: '/Admin/Users/UpdateAllLimits',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "~{msgProductLimitsUpdated}~",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);

            var grid1 = $("div[data-argosy-view=UserPartLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh(true);
        }
    });

    $.fancybox.close();
}

function clearAllPartLimits() {
    var params = { userId: $("#UserId").val() };
    $.ajax({
        url: '/Admin/Users/DeleteUserAllPartLimits',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "~{msgProductLimitsDeleted}~",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);

            var grid1 = $("div[data-argosy-view=UserPartLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh(true);
        }
    });

    $.fancybox.close();
}

function updatePartLimits(partLimit) {
    var params = { partLimit: partLimit };
    $.ajax({
        url: '/Admin/Users/UpdateUserPartLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "The Product Limit for " + result.Records[0].Key + " was " + (!result.Records[0].Value ? "" : "not") + " successfully updated.",
                    type: (!result.Records[0].Value ? "success" : "error")
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $("div[data-argosy-view=UserPartLimitsGrid]").find(".k-collapse-grid").getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);

            var grid1 = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh(true);
        }
    });
}

function sendResetPassword(username) {
    var params = { usernameOrEmail : username};
    $.ajax({
        url: '/Admin/Users/SendPasswordReset',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            prompt.notify({
                question: "~{msgEmailSentUser}~",
                type: "success"
            });
            $.fancybox.close();
        }
    });
}
function sendWelcomeMessage(userId) {
    var params = { userId: userId };
    $.ajax({
        url: '/Admin/Users/SendWelcomeMessage',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditonal: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            prompt.notify({
                question: "~{msgMsgSentToUser}~",
                type: "success"
            });
            $.fancybox.close();
        }
    });
}
function promptResetPassword(name,username) {
    var message = {
        question: "~{msgResetUserPassword}~",
        button: "Yes",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                sendResetPassword(username);
            }
        }
    };
    prompt.alert(message);

   
}
function promptSendWelcomeMessage(name, userId) {
    var message = {
        question: "~{msgSendWelcomeMsg}~ " + name + "?",
        button: "Yes",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                sendWelcomeMessage(userId);
            }

        }
    };
    prompt.alert(message);
}
function addPartCategory() {
    var selected = getSelectedRecordsUserPartCategories();
    
    if (selected.length != 0) {
        var params = { userId: $("#UserId").val(), partCategories: selected };
        $.ajax({
            url: '/Admin/Users/AddPartCategoryToUser',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "The part categories were " + (!this.Value ? "" : "not") + " successfully added to the user.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=UserPartCategoriesGrid]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=PartCategoryModalGridView]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh(true);
            }
        });
    }
    else {
        prompt.notify({
            question: "~{msgSelectOnePartCategoryToAdd}~",
            type: "error"
        });
    }
    $.fancybox.close();
};

function getSelectedRecordsUserPartCategories() {
    var selectedRecords = [];
    var kendoGrid = $("div[data-argosy-view=PartCategoryModalGridView]").getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

// these are kendo grids]

addExtraStylingToGrid = function () {
    $(".k-grid table tbody tr").hover(

        function () {
            $(this).toggleClass("k-grid k-state-hover");
        }
    );

    $("table.k-focusable tbody tr").hover(

        function () {
            $(this).toggleClass("k-state-hover");
        }
    );
};

// this is where the hover effect function is bound to grid]
$("#clkManagePics").on('click', function () {
    if ($("#arwManagePics").hasClass("fa-minus-circle")) {
        $("#divManagePics").hide("slow");
        $("#arwManagePics").removeClass("fa-minus-circle");
        $("#arwManagePics").addClass("fa-plus-circle");
    }
    else {
        $("#divManagePics").show("slow");
        $("#arwManagePics").removeClass("fa-plus-circle");
        $("#arwManagePics").addClass("fa-minus-circle");
    }
});

$("#grid_editlimits").kendoGrid({
    dataSource: {
        type: "odata",
        pageSize: 5
    },
    groupable: false,
    sortable: true,
    selectable: true,
    scrollable: false,
    dataBound: addExtraStylingToGrid,
    pageable: {
        refresh: false,
        pageSizes: false,
        previousNext: true,
        numeric: false,
        buttonCount: 1
    },
    columns: [{
        title: "Active",
        template: "<input type='checkbox' />",
        width: "50px"
    }, {
        title: "Product",
        template: "Product name can be long"
    }, {
        title: "Order Limit",
        template: "Product name can be long"
    }, {
        title: "Time Frame",
        template: "Product name can be long"
    }],
});

addExtraStylingToGrid = function () {
    $(".k-grid table tbody tr").hover(
        function () {
            $(this).toggleClass("k-grid k-state-hover");
        }
    );

    $("table.k-focusable tbody tr").hover(

        function () {
            $(this).toggleClass("k-state-hover");
        }
    );
};

$("#grid").kendoGrid({
    dataSource: {
        type: "odata",
        pageSize: 5
    },
    groupable: false,
    sortable: true,
    selectable: true,
    scrollable: false,
    dataBound: addExtraStylingToGrid,
    pageable: {
        refresh: true,
        pageSizes: [50, 100, 500],
        buttonCount: 5
    },
    columns: [{
        title: "Transaction Date",
        template: "10/25/2014"
    }, {
        title: "<span class='textr'>Amount</span>",
        template: "<span class='textr'>$1,500.00</span>"
    }, {
        title: "Order Number",
        template: "TWG-1254"
    }, {
        title: "Adjustment Reason",
        template: "Order Placed Debit"
    }, {
        title: "<a href='#' class='btn btn-excel'><i class='fa la fa-file-excel-o'></i></a>",
        width: "30px"
    }],
});

function addAccountingUnits() {
    $(document).trigger(argosyEvents.START_LOADING);
    var selected = this.getSelectedRecords();
    var userId = $("#UserId").val();
    if (selected.length !== 0) {
        var params = { accountUnitIds: selected, userId: userId };

        $.ajax({
            url: '/Admin/AccountUnit/AddAccountingUnitsToUser',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    prompt.notify({
                        question: "The accounting unit(s) was " + (!this.Value ? "" : "not") + " successfully added.",
                        type: (!this.Value ? "success" : "error")
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result);
                    $.fancybox.close();
                }
                var grid = $("div[data-argosy-view=UserAccountingUnits]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
              
                $("div[data-argosy-control='AccountUnitGridView']").data("kendoGrid").dataSource.read();
                $(document).trigger(argosyEvents.END_LOADING);
            }
        });
    }
    else {
        prompt.notify({
            question: "~{msgSelectOneAccUnitToAdd}~",
            type: "error"
        });
    }
}

function getSelectedRecords() {
   var selectedRecords = [];
    var kendoGrid = $("div[data-argosy-view=AccountUnitGridView]").getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this).AccountingUnitId);
    });

    return selectedRecords;
};