$(document).ready(function () {
    $("#divAddInfo").css({ "position": "absolute", "top": "-9999px" });
    //$("#divShipAddress").hide();
    //$("#divOrderDetails").hide();
    //$(document).bind(argosyEvents.TOGGLE_SWITCH_CHANGE, function (e, toggle) {
    //    var toggleSwitch = $(toggle.hiddenElement)[0];
    //    toggleSwitchOnChange(toggleSwitch);
    //}); {
    $("#carrier").kendoDropDownList();
    configureEvents();
});
var shippingAddressItem = null;
var pricingItems = null;
var changesMade = false;
var calculating = false;
var tmpOrderNumber = "";
var tmpAction = "";
var tmpComments = "";
function configureEvents() {
    window.onbeforeunload = function () {
        if (changesMade == true) {
            return "You have unsaved changes to this order.  Are you sure you want to leave this page?";
        }
    };

    $(document).bind(argosyEvents.EVENT_PART_INPUT_QTY_CHANGED, function (e, data) {
        $(document).trigger(argosyEvents.EVENT_UPDATE_ORDER_CALCULATION, {
            orderLine: {
                Quantity: data.value,
                Id: data.cartId,
                BucketId: data.bucketId,
                UnitPrice:data.unitPrice,
            }               
        });
    });
    $(document).bind(argosyEvents.EVENT_UPDATE_ORDER_CALCULATION, function (e, data) {
        if (!calculating) {
            calculating = true;
            
            var orderNumber = $("#OrderNumber").val();
            if (data.orderLine != null) {
                var orderLine = data.orderLine;
                console.log(orderLine);
                if (pricingItems !== null) {
                    var currentItem = $.grep(pricingItems, function (item) {
                        return item.Id === orderLine.Id;
                    })[0];
                    if (currentItem == null) {
                        pricingItems.push(orderLine);
                    } else {
                        currentItem.Quantity = orderLine.Quantity;
                    }
                } else {
                    pricingItems = [];
                    pricingItems.push(orderLine);
                }
            }
            if (data.shippingAddress != null) {
                shippingAddressItem = data.shippingAddress;
            }
            $(".loading").text("loading...");
            $(document).trigger(argosyEvents.START_LOADING);
            $.ajax({
                url: "/Admin/Orders/CalculateOrder/" + orderNumber,
                dataType: "json",
                data: {
                    itemsToUpdate: JSON.stringify(pricingItems),
                    shippingAddress: shippingAddressItem,
                    carrierId: $("#carriers").val()
                },
                method: "POST",
                success: function (result) {
                    changesMade = true;
                    orderSummary = result.calculator;
                    $(".orderSubTotal").text(kendo.toString(orderSummary.SubTotal + orderSummary.Discounts, "c"));
                    $(".orderDiscount").text(kendo.toString(orderSummary.Discounts * -1, "c"));
                    $(".orderMailingCosts").text(kendo.toString(orderSummary.MailingServiceCharge, "c"));
                    $(".orderShippingCosts").text(kendo.toString(orderSummary.ShippingCost + orderSummary.FulfillmentCost, "c"));
                    $(".orderCoopFundsUsed").text(kendo.toString(-orderSummary.CoopFundsUsed, "c"));
                    $(".orderPromoDiscount").text(kendo.toString(orderSummary.PromotionDiscount.Discount, "c"));
                    $(".orderTaxes").text(kendo.toString(orderSummary.Tax, "c"));
                    $(".orderTotal").text(kendo.toString(orderSummary.Total, "c"));
                    $(orderSummary.PricingItems).each(function (i, item) {
                        $(".line" + item.Id).text(kendo.toString(((item.UnitPrice * item.Quantity) + (item.FlatFee != null ? item.FlatFee : 0)), "c"))
                    });
                    if (result.orderAddressView != null) {
                        $("#OrderShippingAddress").html($(result.orderAddressView).html());
                        $.fancybox.close();
                    }
                    $(document).trigger(argosyEvents.END_LOADING);
                    calculating = false;
                }
            });
        }
    });
}

function onChange() {
    $(document).trigger(argosyEvents.EVENT_UPDATE_ORDER_CALCULATION, {});
}

function saveOrder(orderNumber, changeStatus, overrideAll) {
    overrideAll = overrideAll == null ? false : overrideAll;
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Admin/Orders/UpdateOrder/" + orderNumber,
        dataType: "json",
        data: {
            itemsToUpdate: JSON.stringify(pricingItems),
            shippingAddress: shippingAddressItem,
            comments: $("#orderComments").val(),
            carrierId: $("#carriers").val()
        },
        method: "POST",
        success: function (result) {
            $(document).trigger(argosyEvents.END_LOADING);
            var isError = false;
            if (result != null && result.response != null && result.response.LineErrors != null && result.response.LineErrors.length > 0) {
                isError = true;
                handleLineErrors(result.response.LineErrors);
            }
            if (!isError) {
                pricingItems = null;
                shippingAddressItem = null;
                changesMade = false;
                if (changeStatus) {
                    DoChangeStatus(tmpOrderNumber, tmpAction, tmpComments, true, overrideAll);
                }
            }
        }
    });
}

function handleLineErrors(errors) {
    var model = {
        lineErrors: errors, 
        alertMessageContinueEnabled: true,
        clearCartResponse: function (e) {
            $.fancybox.close();
        }
    };
    $.fancybox({
        content: $("#_cartLineResponseTemplate").html(),
        afterShow: function () {
            var wrapper = this.wrap;
            setTimeout(function () {
                kendo.bind(wrapper,  model);
                $.fancybox.update();
            }, 100);
        }
    })
}

function submitEditOrderForm() {
    $("form.update-order")[0].submit();
}

function addToOrder(partId, qty, isEdelivery) {
    $(document).trigger(argosyEvents.EVENT_UPDATE_ORDER_CALCULATION, {
        "Id": 0,
        "CompanyUserId": 0,
        "PartId": partId,
        "Quantity": qty,
        "PartKitQuantity": 0,
        "PromotionId": 0,
        "UnitPrice": 0,
        "ChildItems": null,
        "CustomizationState": null,
        "DiscountAppliedQuantity": null,
        "DiscountId": null,
        "Discount": 0,
        "ParentPartId": 0,
        "PriceAggregateId": 0,
        "IsEdelivery": isEdelivery,
        "IsPriceAggregate": true,
        "IsKit": false,
        "IsMailingList": false,
        "IsThirdPartyList": false,
        "IsCustomized": false,
        "MailingListCost": 0,
        "ThirdPartListCost": 0,
        "PrePressCharge": 0,
        "DynamicSourceKey": null,
        "ItemKey": null,
        "Price": 0
    });
}

function showAddToOrder() {

}

function ChangeStatus(orderNumber, action, comments, overrideAll) {
    if (changesMade) {
        var message = {
            question: "Do you want to save changes before you " + action + " this order?",
            description: "",
            button: "Save and continue",
            buttonNo: "Discard and continue",
            buttonNoIcon: "fa-stop-circle-o",
            buttonNoClass: "btn-default",
            buttonNoHidden: false,
            type: "warning",
            yes: function (e) {
                tmpOrderNumber = orderNumber;
                tmpAction = action;
                tmpComments = comments;
                saveOrder($("input[name='OrderNumber']").val(), true, overrideAll);
            },
            no: function (e) {
                DoChangeStatus(orderNumber, action, comments, false, overrideAll);
            }
        };
        prompt.alert(message);
    } else {
        DoChangeStatus(orderNumber, action, comments, true, overrideAll);
    }
}

function DoChangeStatus(orderNumber, action, comments, displayWarning, overrideAll) {
    overrideAll = overrideAll == null ? false : overrideAll;
    var that = this;
    var singleStatusChar;
    switch (action) {
        case 'Cancel':
            singleStatusChar = 'X';
            break;
        case 'Close':
            singleStatusChar = 'C';
            break;
        case 'Approve':
            singleStatusChar = 'Approve';
            break;
        case 'Reject':
            singleStatusChar = 'Reject';
            break;
    }
    var btnClicked = false;
    var questin = overrideAll ? "Are you sure you want to " + action + " all approvals for this order?" : "Are you sure you want to " + action + " this order?";
    var message = {
        question: questin,
        description: "",
        button: "Confirm",
        type: "warning",
        yes: function (e) {
            if (!btnClicked && (typeof (e.preventDefault) === "function")) {
                $(document).trigger(argosyEvents.START_LOADING, { element: $("#wrapcontainer"), message: "~{MsgProcessing}~" });
                that.changeOrderStatus(orderNumber, singleStatusChar, comments, displayWarning, overrideAll);
                btnClicked = true;
            }
        }

    };
    prompt.alert(message);
}

function changeOrderStatus(orderNumber, status, comments, displayWarning, overrideAll) {
    overrideAll = overrideAll == null ? false : overrideAll;
    var params = { orderNumbers: orderNumber, approvalOption: status, comments: comments, overrideAll: overrideAll };

    $.ajax({
        url: '/Admin/Orders/ChangeOrderStatusByNumber',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            $(document).trigger(argosyEvents.END_LOADING, { element: $("#wrapcontainer") });
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Data).each(function () {
                    prompt.notify({
                        question: result.Messageresult.Message != null && result.Message != "Success" ? result.Message : "Order " + this.Key + " has successfully changed its Status.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
                if (!displayWarning) {
                    changesMade = false;
                }
                location.reload();
            } else {
                prompt.clientResponseError(result);
            }
        },
        complete: function (e) {
            $(document).trigger(argosyEvents.END_LOADING, { element: $("#wrapcontainer") });
        }
    });
    $.fancybox.close();
}
