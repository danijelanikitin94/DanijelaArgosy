function buyerGroupUpdate() {
    $("#Frequency").val($("div[data-argosy-view=BuyerGroupReports]").getKendoDropDownList().value());
    if ($("#Frequency").val() === "M") {
        $("#DayOfMonth").val($("#ddlDayOfMonth").getKendoDropDownList().value());
    } else {
        $("#DayOfMonth").val("-");
        $("#ChkSunday").val($("#ChkSunday").is(":checked"));
        $("#ChkMonday").val($("#ChkMonday").is(":checked"));
        $("#ChkTuesday").val($("#ChkTuesday").is(":checked"));
        $("#ChkWednesday").val($("#ChkWednesday").is(":checked"));
        $("#ChkThursday").val($("#ChkThursday").is(":checked"));
        $("#ChkFriday").val($("#ChkFriday").is(":checked"));
        $("#ChkSaturday").val($("#ChkSaturday").is(":checked"));
    }

    $("form.update-buyer-group")[0].submit();
};


function showAddUserToBuyerGroupModal() {
    $.fancybox({
        href: "#AddBuyerGroupUsers"
    });
};

function showAddPartToBuyerGroupModal() {
    $.fancybox({
        href: "#AddBuyerGroupParts"
    });
};

function closeModal() {
    $.fancybox.close();
};

function addUserToBuyerGroup(buyerGroupId, view) {
    var items = this.getItems(view);
    if (items.length > 0) {
        var params = { users: items, buyerGroupId: buyerGroupId };
        $.ajax({
            url: "/Admin/BuyerGroups/AddBuyerGroupUser",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    prompt.notify({
                        question: "User(s) successfully added.",
                        type: "success"
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                $("div[data-argosy-view=BuyerGroupUserGridView]").find(".k-collapse-grid").getKendoGrid().dataSource.read();
                $("div[data-argosy-view=AddUserToBuyerGroupGridView]").getKendoGrid().dataSource.read();
            }
        });
    } else {
        prompt.notify({
            question: "Select at least one item.",
            type: "error"
        });
    }
    $.fancybox.close();
};

function addPartToBuyerGroup(buyerGroupId, view) {
    var items = this.getItems(view);
    if (items.length > 0) {
        var params = { parts: items, buyerGroupId: buyerGroupId };
        $.ajax({
            url: "/Admin/Parts/UpdateBuyerGroup",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    prompt.notify({
                        question: "Part(s) successfully added.",
                        type: "success"
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                $("div[data-argosy-view=BuyerGroupPartsGridView]").find(".k-collapse-grid").getKendoGrid().dataSource.read();
                $("div[data-argosy-view=AddPartToBuyerGroup]").getKendoGrid().dataSource.read();
            }
        });
    } else {
        prompt.notify({
            question: "Select at least one item.",
            type: "error"
        });
    }
    $.fancybox.close();
};

function getItems(view) {
    var items = [];
    var kendoGrid = $("div[data-argosy-view=" + view + "]").getKendoGrid();
    $(kendoGrid.select()).each(function () {
        items.push(kendoGrid.dataItem(this));
    });
    return items;
};