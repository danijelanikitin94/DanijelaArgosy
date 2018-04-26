var controlLoader = null;
var app_Version_Num = "";
var argosyEvents = new ArgosyEvents();
var pricingManager = null;
var showDebugInfo;
var countryStateMap = null;
var validSessionRequestRunning = false;
var productDetailControl = null;
var personalizedProofCollectionDetailsControl = null;
var jsConsole = {
    log: function (message) {
        if (showDebugInfo === true) {
            window.console && console.log(message);
        }
    },
    warn: function (message) {
        if (showDebugInfo === true) {
            window.console && console.warn(message);
        }
    },
    error: function (message) {
        window.console && console.error(message);
    }
};

// custom kendo bindings
// this should allow you to set data-bind="content: renderSomethingNow"
// and the content of this element should be rendered by firing the function and passing the 
// current object model in.
kendo.data.binders.keyPress = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        var keyPress = this.bindings.keyPress;
        $(element).bind("keypress", function(){
            keyPress.get();
        });
    },
    refresh: function () {}
});
kendo.data.binders.keyDown = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        var keyDown = this.bindings.keyDown;
        $(element).bind("keydown", function(){
            keyDown.get();
        });
    },
    refresh: function () {}
});
kendo.data.binders.objectData = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var that = this;
        //call the base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        var that = this;
        var content = that.bindings.objectData.get();
    }
});

function framebuster() {
    if (window.parent != window) {
        window.parent.location = window.location;
    }
}

$(document).ready(function () {
    framebuster();
    kendo.culture("~{LangCulture}~");
    controlLoader = new ControlLoader(true);
    globalPageInit();
    addArgosyActions();
    controlLoader.loadControl("PricingManager", {}, function (control) {
        pricingManager = control;
    });
    controlLoader.loadControl("ModalProductDetail", {}, function (control) {
        productDetailControl = control;
        var sku = getQuerystring("showSku");
        if (sku != null && sku.trim().length > 0) {
            $(document).trigger(argosyEvents.SHOW_PART_DETAILS_MODAL, sku.trim());
        }
    });

    controlLoader.loadControl("PersonalizedProofCollectionDetails", {}, function (control) {
        personalizedProofCollectionDetailsControl = control;
    });

    addPageScript();
    
    // force arrays to be returned from jquery params in a serializable fashion.  without this you would
    // have things like Sort[]=BlahBlahBlah
    $.ajaxSettings.traditional = true;
    setupDomEvents();
    setupPageEvents();
    setupPageDefaultFocus();
    setupFormDefaultSubmits($("body"));
    setupGlobalImageEditor();
    startExpirationTimeout();
    setupPartTypeAheadSearch($("#searchInput"));
    setupPartTypeAheadSearch($("input[name=searchFor]"));
    $(".fancybox").fancybox();
    $(".parthistory").fancybox({
        href: "#coming_content"
    });
    $('.fancybox-ajax').fancybox({
        type: 'ajax',
        transitionIn: 'none',
        transitionOut: 'none',
    });
});

function setupPartTypeAheadSearch(element) {
    var opts = {
        filter: "startswith",
        minLength: 2,
        dataSource: {
            type: "odata",
            serverFiltering: true,
            transport: {
                read: function(options) {
                    var filterValue = options.data.filter.filters[0].value;
                    $.ajax({
                        url: "/api/lucenesearch/PartTypeAhead?prefix=" + filterValue,
                        dataType: "json",
                        method: "GET",
                        success: function (result) {
                            options.success(result);
                        }
                    });
                }
            },
            schema: {
                data: function(response) {
                    return response;
                },
                total: function(response) {
                    return response.length;
                }
            }
        }
    };
    element.kendoAutoComplete(opts);
}

var loadingMap = false;
function getCountryStateMap() {
    if (!loadingMap) {
        loadingMap = true;
        $.ajax({
            url: "/DataView/GetCountryStateMap",
            dataType: "json",
            cache: true,
            success: function(result) {
                countryStateMap = result;
                $(document).trigger(argosyEvents.EVENT_COUNTRY_STATE_MAP_LOADED);
            }
        });
    }
}

function startExpirationTimeout() {
    // fire this every 31 minutes since auth is set to sliding 30 minutes
    setTimeout(function () {
        checkForSecurityRedirect();
    }, (31 * 60 * 1000));
}

function checkForSecurityRedirect() {
    var isNotLoginPage = window.location.href.toLowerCase().indexOf("/login") === -1;
    var isNotRegisterPage = window.location.href.toLowerCase().indexOf("/register") === -1;
    var isNotResetPassword = window.location.href.toLowerCase().indexOf("/security") === -1;
    if (!validSessionRequestRunning && isNotLoginPage && isNotRegisterPage && isNotResetPassword) {
        validSessionRequestRunning = true;
        jQuery.ajax({
            type: "GET",
            contentType: "application/json",
            url: "/Security/IsSessionExpired",
            dataType: "json",
            success: function (result) {
                if (!result.IsAuthenticated) {
                    window.location = result.RedirectTo;
                } else {
                    startExpirationTimeout();
                }
            },
            error: function (result) {
                location.reload();
            },
            complete: function () {
                validSessionRequestRunning = false;
            }
        });
    }
}
var ReturnCode = {
    Failed: 500,
    Success: 200
};
function hideTopNav() {
    $(".navbar-static-top, nav").hide();
}

function setupDomEvents() {
    var targetNodes = $("section");
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var myObserver = new MutationObserver(mutationHandler);
    var obsConfig = { childList: true, characterData: false, attributes: false, subtree: true };

    //--- Add a target node to the observer. Can only add one node at a time.
    targetNodes.each(function () {
        myObserver.observe(this, obsConfig);
    });
}

function mutationHandler(mutationRecords) {
    mutationRecords.forEach(function (mutation) {
        if (mutation.addedNodes != null && mutation.addedNodes.length > 0) {
            $(mutation.addedNodes).each(function (i) {
                var item = $(this);
                setupFormDefaultSubmits(item);
                item.find(".fancybox").fancybox();
            });
        }
    });
}

function reloadImage(image, defaultTimeout) {
    if (defaultTimeout == null) {
        defaultTimeout = 500;
    }
    $(image).hide();
    setTimeout(function (e) {
        image.src = "/Store/Proofing/GetProofingImage?imagePath=" + image.src;
        $(image).show();
    }, defaultTimeout);
}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(.+)@([^\(\);:,<>]+\.[a-zA-Z]{2,4})/);
    return pattern.test(emailAddress);
}
function getCartCount() {
    var url = "/Store/Cart/GetCartCount";

    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (count) {
            $('._emCartCount').html("(" + count + ")");
        }
    });
}
function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
function setupPageEvents() {
    $(document).bind(argosyEvents.PAGE_DOM_CHANGE, function (e, data) {
        convertInputsInElements(e, data);
        setupFormDefaultSubmits($(data));
        if ($(data).hasClass("fancybox-wrap")) {
            setTimeout(function (E) {
                setFancyboxFocus();
            }, 250);
        }
    });
    $(document).bind(argosyEvents.SHOW_PART_DETAILS_MODAL, function (e, data) {
        var partId = null,
            showAddToCart = true,
            hideCartInputs = false,
            isInventoryView = false;
        if ($.type(data) === "object") {
            partId = data.partId;
            showAddToCart = data.showAddToCart == null ? true : (data.showAddToCart == "true" || data.showAddToCart == true);
            hideCartInputs = data.hideCartInputs == null ? hideCartInputs : data.hideCartInputs;
            isInventoryView = data.isInventoryView == null ? isInventoryView : data.isInventoryView;
        } else {
            partId = data;
        }
        if (productDetailControl != null) {
            var callback = function (part) {
                productDetailControl.show(part, hideCartInputs, isInventoryView, showAddToCart);
                $(document).trigger(argosyEvents.END_LOADING);
            };
            if (isNaN(partId)) {
                getPartBySku(partId, callback);
            } else {
                getPart(parseInt(partId), callback);
            }
        }
    });
    $(document).bind(argosyEvents.PART_ADDED_TO_CART, function (e, data) {
        getCartCount();
    });
    $(document).bind(argosyEvents.ITEM_DELETED_FROM_CART, function (e, data) {
        getCartCount();
    });
    $(document).bind(argosyEvents.PROMPT_NOTIFY, function (e, data) {
        prompt.notify({
            question: data.message,
            type: data.type
        });
    });
    $(document).bind(argosyEvents.START_LOADING, function (e, data) {
        if (data != null) {
            if (data.name != null && data.name.trim().length > 0) {

                $(document).find("*[data-argosy-loading=" + data.name + "]").each(function (i) {
                    var element = $(this);
                    block(element, element.attr("data-argosy-loading-message"), element.attr("data-argosy-loading-blank") == "true");
                });
            } else if (data.element != null) {
                block(data.element, data.message);
            }
        } else {
            block();
        }
    });
    $(document).bind(argosyEvents.END_LOADING, function (e, data) {
        if (data != null && data.name != null && data.name.trim().length > 0) {
            $(document).find("*[data-argosy-loading]").each(function (i) {
                if ($(this).attr("data-argosy-loading").toLowerCase().indexOf(data.name.trim().toLowerCase()) > -1) {
                    unblock(this);
                }
            });
        } else if (data != null && data.element != null) {
            unblock(data.element);
        } else {
            unblock();
        }
    });
}

function loadEmptyGridTemplate(message) {
    var data = {
        Message: message
    };
    return kendo.Template.compile($('#_GlobalNoResultsTemplate').html())(data);
}

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function unblock(element) {
    if (element != null) {
        $(element).unblock();
    } else {
        $.unblockUI();
    }
}

function disable(element) {
    var overlayCss = {
        backgroundColor: "gray",
        opacity: 0.75,
        cursor: 'wait'
    };
    $(element).block({ message: "", baseZ: 9500, overlayCSS: overlayCss });
}

function enable(element) {
    $(element).unblock();
}

function block(element, message, blankElement) {
    if (blankElement == null) {
        blankElement = false;
    }
    if (message == null) {
        message = blankElement ? "" : "~{MsgLoading}~";
    }
    var css = {
        'background-color': 'transparent',
        "background-size": "32px auto",
        "background-repeat": "no-repeat",
        "background-position": "center top",
        "-moz-opacity": "1",
        "opacity": "1",
        'border': 'none',
        "height": "100px",
        'z-index': '9999',
    };
    var overlayCss = {
        backgroundColor: "transparent",
        opacity: 1,
        cursor: 'wait'
    };
    if (element != null) {
        if (blankElement) {
            css = {};
        }
        $(element).block({ centerX: true, centerY: true, css: css, message: "<div class='loading-message-wrapper' style='padding: 10px 5px; margin-top: 0px; border-radius: 5px; background-color: #fafafa; border: #ccc 1px solid; box-shadow: 0px 0px 13px 0px rgba(52, 50, 50, 0.09);'><div style='color: #666; margin-top: 0; padding-top: 0'> <img style='margin: 0 10px; width: 20px' src='/content/images/generic.gif'>" + message + "</div></div>", overlayCSS: overlayCss, baseZ: 500 });
    } else {
        $.blockUI({ message: "<div class='loading-message-wrapper' style='padding: 10px 5px;  margin-top: 0px; border-radius: 5px; background-color: #fafafa; border: #ccc 1px solid; box-shadow: 0px 0px 13px 0px rgba(52, 50, 50, 0.09);'><div style='color: #666; margin-top: 0; padding-top: 0'><img style='margin: 0 10px; width: 20px;' src='/content/images/generic.gif'>" + message + "</div></div>", css: css, overlayCSS: overlayCss, baseZ: 9500 });
        $('.blockUI.blockMsg').center();
    }
}

function handleDataSourceException(results) {
    //todo figure out a way to do  results.Guid that will not fail galderma scan
    window.location = "/Error";
}

_defaultDataSourceConfig = {
    pageSize: 50,
    page: 1,
    serverPaging: true,
    serverSorting: true,
    serverFiltering: true,
    pageable: {
        refresh: true,
        pageSizes: [50, 100, 500],
        buttonCount: 5
    },
    filter: [],
    schema: {
        data: "Records",
        total: "TotalRecords",
        errors: "Guid"
    },
    error: function (e) {
        window.location = "/Error";
    }
};

function addPageScript() {
    if (location.pathname.indexOf("mockups") > -1) {
        $.getScript("/scripts/page" + convertToJavascriptFile(location.pathname));
    }
}

function convertToJavascriptFile(pageName) {
    if (pageName == "/") {
        pageName = "/browse-products.html";
    }
    return pageName.substring(0, pageName.indexOf(".")) + ".js";
}

function pluralize(val, qty) {
    return val + (qty > 1 ? "s" : "");
}

function appendLoadingAttribute(element, name, isBlank) {
    var currentValues = "";

    if (isBlank == null) {
        isBlank = false;
    }

    if (element.attr("data-argosy-loading") != null) {
        currentValues += element.attr("data-argosy-loading") + ",";
    }
    element.attr("data-argosy-loading-blank", isBlank);

    currentValues += name;
    element.attr("data-argosy-loading", currentValues);
}

function convertPartToPricing(part, options) {
    var defaults = {
        value: part.DefaultQuantity,
        cartId: 0,
        overrideQuantitySettings: false,
        renderPriceBreak: part.IsLimitPartOrderQuantity && part.Discounts && part.Discounts.length > 0 && !part.IsEdeliveryOnly,
        renderPriceInput: part.Discounts == null || part.Discounts.length === 0 || !part.IsEdeliveryOnly,
        change: function (e) { },
        dataBound: function (e) { },
        spin: function (e) { },
        isCartQty: true,
        isEdeliverySelected: false,
        disabled: false,
        spinEventTriggered: false,
        appendZeroDiscount: false,
        rank: 0,
        min: 1,
        isEditable: !part.Options.IsMailingListRequired,
        minQty: part.MinOrderQty,
        maxQty: part.MaxOrderQty
    };
    options = $.extend({}, defaults, options);

    if (options.appendZeroDiscount && options.renderPriceBreak) {
        var baseDiscount = part.Discounts[0];
        part.Discounts.splice(0, 0, $.extend({}, baseDiscount,
        {
            Id: 0,
            Quantity: 0,
            Range: "0",
            Discount: 0,
            CostPerEach: 0
        }));
    }
    
    var discounts = part.Discounts;
    /*
    if (part.MinCartQty > 0 && part.Discounts != null && part.Discounts.length > 0) {
        $.each(part.Discounts, function (i, discount) {
             if (discount.Quantity >= part.MinCartQty) {
                 discounts.push(discount);
             }
        });
    }*/
    
    
    return {
        part: {
            partId: part.PartId,
            sku: part.Sku,
            partName: part.Name,
            partDesc: part.Description,
            isEdeliveryOnly: part.IsEdeliveryOnly,
            discounts: discounts,
            isExpired: part.IsExpired,
            flagOffered: part.FlagOffered,
            cpq: part.CPQ,
            isOrderByCpq: part.IsOrderByCPQ,
            rank: options.rank,
            isEditable: !part.Options.IsMailingListRequired
        },
        discounts: part.Discounts,
        options: options,
        change: options.change,
        dataBound: options.dataBound,
        value: options.value,
        spin: options.spin,
        min: options.min,
        isInputDisabled: function (item) {
            if (this.part.isEdeliveryOnly) {
                this.options.value = 1;
                this.set("options", this.options);
            }
            if (!this.part.hasOwnProperty("isEditable")) {
                this.part.isEditable = true;
            }
            return this.part.isEdeliveryOnly ||
                this.options.isEdeliverySelected ||
                this.options.disabled ||
                !this.part.isEditable;
        }
    };
}

function addArgosyActions(baseSelector) {
    if (baseSelector == undefined) {
        baseSelector = null;
    }
    var items = (baseSelector == null) ? $("*[data-argosy-action]") : $(baseSelector).find("*[data-argosy-action]");
    items.each(function (e) {
        var element = $(this);
        var actions = element.attr("data-argosy-action").toLowerCase();
        if (actions.indexOf(",") > -1) {
            actions = actions.split(",");
        } else {
            var tmp = actions;
            actions = [];
            actions.push(tmp);
        }
        element.unbind("click").unbind("change").unbind("hover");
        $(actions).each(function (i) {
            var action = this.toString();
            switch (action) {
                case "addproducthover":
                    element.click(function (e) {
                        var selector = element.attr("data-argosy-target");
                        var target = element.closest(".product-image-wrapper").find(selector);
                        if (!target.hasClass("hover")) {
                            target.addClass("hover");
                        } else {
                            target.removeClass("hover");
                        }
                    });
                    break;
                case "masonhover":
                    element.mouseenter(function (e) {
                        var selector = element.attr("data-argosy-target");
                        var target = element.closest(".product-image-wrapper").find(selector);
                        if (!target.hasClass("display-info")) {
                            target.addClass("display-info");
                        }
                    }).mouseleave(function (e) {
                        var selector = element.attr("data-argosy-target");
                        var target = element.closest(".product-image-wrapper").find(selector);
                        if (target.hasClass("display-info")) {
                            target.removeClass("display-info");
                        }
                    });
                    break;
                case "addproducthover-list":
                    element.click(function (e) {
                        var selector = element.attr("data-argosy-target");
                        var target = element.closest("#grid_product").find(selector);
                        if (!target.hasClass("hover")) {
                            target.addClass("hover");
                        } else {
                            target.removeClass("hover");
                        }
                    });
                    break;
                case "addrapidorder":
                    element.click(function (e) {
                        var dataId = element.attr("data-argosy-dataid"),
                            target = $(this),
                            url = "/Store/Browse/AddRemoveFavorites",
                            data = {};
                        data.isFavorite = !target.hasClass("selected");
                        data.partId = dataId;
                        target.toggleClass("selected");

                        $.ajax({
                            url: url,
                            dataType: "json",
                            data: JSON.stringify(data),
                            type: "POST",
                            contentType: "application/json; charset=utf-8"
                        });
                        $(document).trigger(argosyEvents.EVENT_FAVORITES_ADDED_REMOVED, dataId);
                    });
                    break;
                case "addtocart":
                    element.unbind("click");
                    element.click(function (e) {
                        var partId = element.attr("data-argosy-dataid"),
                            qty = element.attr("data-argosy-qty"),
                            partName = element.attr("data-argosy-partname"),
                            textBox = $("#addToCartQuantity_" + partId),
                            alert = $("#_ProductDetailModalAlert"),
                            data = {};
                        if (qty) {
                            data.qty = parseInt(qty);
                        } else {
                            if (textBox.length > 0) {
                                data.qty = parseInt(textBox.val());
                            } else {
                                data.qty = 1;
                            }
                        }
                        if (data.qty == null || isNaN(data.qty)) {
                            data.qty = parseInt(textBox.attr("value"));
                        }
                        var callback = function (part) {
                            var isOkToAdd = checkBeforeAddingToCart(part, data.qty, alert);
                            if (isOkToAdd) {
                                alert.hide();
                                data.partId = partId;
                                sendPartToCart(data, partName);
                            }    
                        }
                         getPart(partId,callback);
                    });
                    break;
                case "showproductdetails":
                    element.click(function () {
                        var dataId = element.attr("data-argosy-dataid");
                        var showAddToCart = element.attr("data-argosy-show-add-to-cart");
                        $(document).trigger(argosyEvents.SHOW_PART_DETAILS_MODAL, {
                            partId: dataId,
                            showAddToCart: showAddToCart == null ? true : showAddToCart
                        });
                    });
                    break;
                case "showpersonalizedproofcollectiondetails":
                    element.click(function () {
                        var partNumber = element.attr("data-argosy-dataid"),
                            customMsg =element.attr("data-argosy-msg");
                        if (customMsg === "null"){
                            customMsg ='';
                        }
                        $(document).trigger(argosyEvents.SHOW_PERSONALIZED_PROOF_COLLECTION_DETAILS, {partNumber:partNumber,customMsg:customMsg});
                    });
                    break;
                case "selectallpersonalizedproofcollectionitems":
                    element.click(function (e) {
                        $(document).trigger(argosyEvents.SELECT_ALL_PERSONALIZED_PROOF_COLLECTION_ITEMS, { isChecked: e.target.checked });
                    });
                    break;
                case "reorderselectedpersonalizedproofcollectionitems":
                    element.click(function () {
                        $(document).trigger(argosyEvents.REORDER_SELECTED_PERSONALIZED_PROOF_COLLECTION_ITEMS);
                    });
                    break;
                case "edittheme":
                    element.click(function () {
                        var themeId = element.attr("data-argosy-dataid");
                        changeCSS("/Style/ChangeCss?id=" + themeId);
                        $(document).trigger(argosyEvents.SHOW_THEME, themeId);
                    });
                    break;
                case "showstandardthemes":
                    element.click(function () {
                        $(document).trigger(argosyEvents.SHOW_STANDARD_THEMES);
                    });
                    break;
                case "showassetdetails":
                    element.click(function (e) {
                        var dataId = element.attr("data-argosy-dataid");
                        $(document).trigger(argosyEvents.SHOW_ASSET_DETAILS_MODAL, dataId);
                    });
                    break;
                case "showcategory":
                    element.click(function (e) {
                        var categoryName = element.attr("data-argosy-categoryName");
                        window.location.hash = '#Category:' + categoryName;
                    });
                    break;
                case "showproductusagehistory":
                    element.click(function (e) {
                        var dataId = element.data("argosy-dataid");
                        var partName = element.data("argosy-partname");
                        $(document).trigger(argosyEvents.SHOW_PART_USAGE_MODAL, { partId: dataId, partName: partName });
                    });
                    break;
                case "showviewingrights":
                    element.click(function () {
                        var inclusionTags = element.data("inclusionTags"),
                            exclusionTags = element.data("exclusionTags");
                        var part = {
                            partId: element.data("partId"),
                            partName: element.data("partName"),
                            companyId: element.data("companyId"),
                            inclusionTags: inclusionTags,
                            exclusionTags: exclusionTags
                        };
                        $(document).trigger(argosyEvents.SHOW_VIEWING_RIGHTS_MODAL, part);
                    });
                    break;
                case "showpartconfigureoptions":
                    element.click(function (e) {
                        var dataId = element.data("argosy-dataid");
                        $(document).trigger(argosyEvents.SHOW_PART_CONFIGURATION_MODAL, dataId);
                    });
                    break;
                case "showpartquantitymodal":
                    element.click(function (e) {
                        var dataId = element.data("argosy-dataid");
                        $(document).trigger(argosyEvents.SHOW_PART_QUANTITY_MODAL, dataId);
                    });
                    break;
                case "showkitinventorymodal":
                    element.click(function (e) {
                        var dataId = element.data("argosy-dataid");
                        $(document).trigger(argosyEvents.SHOW_KIT_INVENTORY_DETAILS_MODAL, dataId);
                    });
                    break;
                case "showassetusagehistory":
                    element.click(function (e) {
                        var dataId = element.data("argosy-dataid");
                        var assetName = element.data("argosy-assetname");
                        $(document).trigger(argosyEvents.SHOW_ASSET_USAGE_MODAL, { assetId: dataId, assetName: assetName });
                    });
                    break;
                case "shareasset":
                    element.click(function (e) {
                        var dataId = element.data("argosy-dataid");
                        $(document).trigger(argosyEvents.SHOW_SHARE_ASSET_MODAL, dataId);
                    });
                    break;
                case "updatepartquantities":
                    var input = $(element);
                    if (!$.isKendo(input)) {
                        input.kendoNumericTextBox({
                            min: input.val(),
                            format: "n0",
                            step: 1,
                            decimals: 0,
                            spinners: false,
                            change: function (e) {
                                var dataId = e.sender.element.attr("data-argosy-dataid");
                                var value = e.sender.value();
                                $(document).trigger(argosyEvents.UPDATE_PART_QUANTITIES, {
                                    partId: dataId,
                                    value: value
                                });
                            }
                        });
                    } else {
                        input.on('change paste', function (e) {
                            var dataId = parseInt(e.target.attributes["data-argosy-dataid"].value);
                            var value = null;
                            if ($.isKendo(e.target)) {
                                value = $.getKendoControl($(e.target)).value();
                            } else {
                                value = $(e.target).val();
                            }
                            $(document).trigger(argosyEvents.UPDATE_PART_QUANTITIES, {
                                partId: dataId,
                                value: value
                            });
                        });
                    }
                    break;
                case "select-global-profile":
                    element.change(function (e) {
                        var val = $(this).val();
                        $(document).trigger(argosyEvents.SELECT_GLOBAL_PROFILE, {
                            globalProfileId: val,
                            element: this
                        });
                    });
                    break;
                case "select-standard-profile":
                    element.change(function (e) {
                        var val = $(this).val();
                        $(document).trigger(argosyEvents.SELECT_STANDARD_PROFILE, {
                            standardProfileId: val,
                            element: this
                        });
                    });
                    break;
                case "select-proofing-profile":
                    element.change(function (e) {
                        var val = $(this).val();
                        triggerProfileChangeEvent(val);
                    });
                    break;
                case "change-folder-view":
                    element.click(function (e) {
                        var dataId = element.attr("data-argosy-dataid");
                        var dataName = element.attr("data-argosy-dataname");
                        var dataDescription = element.attr("data-argosy-datadescription");
                        var uid = element.attr("data-argosy-datauid");

                        $(document).trigger(argosyEvents.ASSET_DIRECTORY_CHANGED, {
                            Id: dataId,
                            Name: dataName,
                            Description: dataDescription,
                            uid: uid
                        });
                    });
                    break;
                case "show-large-image":
                    element.dblclick(function (e) {
                        var dataHref = element.attr("data-argosy-datahref");
                        if (dataHref != null && dataHref.length > 0) {
                            if (getFileExtension(dataHref) == ".pdf" && dataHref.indexOf("w=") < 0) {
                                dataHref = dataHref + "?w=" + window.innerWidth + "&h=" + window.innerHeight;
                            }
                            $.fancybox({
                                href: dataHref,
                                type: "image"
                            });
                        }
                    });
                    break;
                case "show-large-image-single":
                    element.click(function (e) {
                        var dataHref = element.attr("data-argosy-datahref");
                        if (dataHref != null && dataHref.length > 0) {
                            if (getFileExtension(dataHref) == ".pdf" && dataHref.indexOf("w=") < 0) {
                                dataHref = dataHref + "?w=" + window.innerWidth + "&h=" + window.innerHeight;
                            }
                            $.fancybox({
                                href: dataHref,
                                type: "image"
                            });
                        }
                    });
                    break;
                case "select-all-assets":
                    element.change(function (e) {
                        $(document).trigger(argosyEvents.SELECT_ALL_ASSETS, { isChecked: e.target.checked });
                    });
                    break;
                case "asset-action-change":
                    element.change(function (e) {
                        $(document).trigger(argosyEvents.DO_ASSET_ACTION, { action: element.val() });
                        setTimeout(function () {
                            element.getKendoDropDownList().select(0);
                        }, 500);
                    });
                    break;
                case "add-asset-to-cart":
                    element.click(function (e) {
                        var dataId = element.attr("data-argosy-dataid");
                        $(document).trigger(argosyEvents.ADD_ASSET_TO_CART, dataId);
                    });
                    break;
                default:
            }
        });
    });
    $(document).trigger(argosyEvents.PAGE_DOM_CHANGE, baseSelector);
}

function triggerProfileChangeEvent(val, callback, showLoading) {
    if (val.indexOf("-") !== -1) {
        var pieces = val.split("-");
        switch (pieces[0]) {
            case "global":
                $(document).trigger(argosyEvents.SELECT_GLOBAL_PROFILE, {
                    globalProfileId: pieces.length == 3 ? (pieces[2] == "a" ? -1 : parseInt(pieces[2])) : (pieces[1] == "a" ? -1 : parseInt(pieces[1])),
                    instanceId: pieces.length == 3 ? parseInt(pieces[1]) : 0,
                    element: this,
                    callback: callback,
                    showLoading: showLoading
                });
                break;
            case "profile":
                $(document).trigger(argosyEvents.SELECT_STANDARD_PROFILE, {
                    standardProfileId: parseInt(pieces[1]),
                    element: this,
                    callback: callback,
                    showLoading: showLoading
                });
                break;
        }
    } else {
        callback();
    }
}
function reorderOrder(orderNumber) {
    var url = "/Admin/Orders/ReOrder",
        passObj = {},
        successfulReorder = false;
    passObj.orderNumber = orderNumber;
    block(null, "Reordering " + orderNumber);
    $.ajax({
        url: url,
        dataType: "json",
        data: JSON.stringify(passObj),
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function (e) {
            var success = e.IsError === false,
                message = "Success, " + orderNumber + " has been reordered.",
                type = "success";

            if (!success) {
                message = e.Message;
                type = "error";
            } else {
                window.location = e.Data;
            }
            var promptData = {
                message: message,
                type: type
            };
            successfulReorder = success;
            $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
        },
        error: function (e) {
            var promptData = {
                message: "Unable to re-order at this time.",
                type: "error"
            };
            $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
        },
        complete: function (e) {
            if (successfulReorder) {
                block(null, "~{MsgTransferToCart}~ ");
            } else {
                unblock();
            }
        }
    });
}
function placeSavedOrder(orderId) {
    var url = "/Admin/Orders/PlaceSavedOrder",
        passObj = {},
        successfulReorder = false;
    passObj.orderId = orderId;

    
    var btnClicked = false;
    var message = {
        question: "~{MsgSureAboutPlacing}~",
        description: "",
        button: "Confirm",
        type: "warning",
        yes: function (e) {
            if (!btnClicked && (typeof (e.preventDefault) === "function")) {
                block(null, "~{MsgVerifyingOrder}~");
                $.ajax({
                    url: url,
                    dataType: "json",
                    data: JSON.stringify(passObj),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    success: function (e) {
                        var success = e.IsError === false,
                            message = "~{MsgOrderUpdated}~",
                            type = "success";

                        if (!success) {
                            message = e.Message;
                            type = "error";
                            unblock();

                        } else {
                            window.location.reload(true);
                        }
                        var promptData = {
                            message: message,
                            type: type
                        };
                        successfulReorder = success;
                        $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                    },
                    error: function (e) {
                        var promptData = {
                            message: "Unable to place order at this time.",
                            type: "error"
                        };
                        $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                    }
                });
                btnClicked = true;
            }
        }

    };
    prompt.alert(message);
 
}
function checkBeforeAddingToCart(part,qty,alert) {
    $("._alertModalMsgs").addClass("hide");
    var isOkToAdd = true;
    if (!part.CanDirectMail && !part.CanUpload  && !part.IsConfigurable) {
        if (qty <= 0) {
            $("._ProductQuantityModalAlertForZero").removeClass("hide");
            isOkToAdd = false;
        } else if (part.IsOrderByCPQ && !IsMultipleOf(qty, part.CPQ)) {
            $("._ProductCPQAlertForMax").removeClass("hide");
            isOkToAdd = false;
        } else if (userSettings.EnforceMinMaxOrderQty && (qty > part.MaxOrderQty || qty < part.MinOrderQty)) {
            if (qty > part.MaxOrderQty) {
                $("._ProductQuantityModalAlertForMax").removeClass("hide");
            }
            if (qty < part.MinOrderQty) {
                $("._ProductQuantityModalAlertForMin").removeClass("hide");
            }
            isOkToAdd = false;
        }

    }
    if (!isOkToAdd) {
        alert.removeClass("hide");
    } else {
        alert.addClass("hide");
    };
    $.fancybox.update()
    return isOkToAdd;
}
function IsMultipleOf(quantity, multiple) {
    return quantity % multiple === 0;
}
function sendPartsToCartOrCustomization(partObjs, partName, onComplete) {
    var url = "/Store/Cart/BulkAddToCart";
    callCarts(partObjs, partName, url, onComplete);
}
function sendPartToCartOrCustomization(partObj, partName, onComplete) {
    sendPartToCartOrCustomization([partObj], partName, url, onComplete);
}
function sendPartsToCart(partObjs, partName, onComplete) {
    var url = "/Store/Cart/BulkAddToCart";
    callCarts(partObjs, partName, url, onComplete);
}

function sendPartToCart(partObj, partName, onComplete) {
    sendPartsToCart([partObj], partName, onComplete);
}

function callCart(partObj, partName, url) {
    callCarts([partObj], partName, url);
}

var addingToCart = [];
function callCarts(partObjs, partName, url, onComplete) {
    url = "/Store/Cart/BulkAddToCart";
    block(null, "~{MsgAddingToCart}~");
    var toAddToCart = [];
    $.each(partObjs,  function (i, item) {
        var searchPartIds = $.grep(addingToCart, function(partId) {
            return partId == item.partId;
        });
        if (!searchPartIds.length > 0) {
            addingToCart.push(item.partId);
            toAddToCart.push(item);
        }
    });
    if (toAddToCart.length > 0) {
        $.ajax({
            url: url,
            dataType: "json",
            data: JSON.stringify(toAddToCart),
            type: "POST",
            contentType: "application/json; charset=utf-8",
            success: function (e) {
                callCartSuccess(e, partName, onComplete != null);
            },
            error: function () {
                var promptData = {
                    message: "Unable to add to cart",
                    type: "error"
                };
                $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
            },
            complete: function (e) {
                unblock();
                $.each(toAddToCart, function (i, item) {
                    addingToCart = addingToCart.filter(function (partId) {
                        return partId !== item.partId;
                    });
                });
            }
        });
    }
}

function callCartSuccess(e, partName, hideMessage) {
    var success = e.ReturnCode === ReturnCode.Success,
        message = partName + " ~{AddedToCart}~",
        type = "success";
    if (!success) {
        message = e.Message;
        type = "error";
    }
    var promptData = {
        message: message,
        type: type
    };
    if (e.ReturnResponse !== null && e.ReturnResponse !== undefined) {
        if (e.ReturnResponse.PostJsonData !== null && e.ReturnResponse.PostJsonData !== undefined && e.ReturnResponse.PostJsonData.length > 0) {
            $.submitAsForm(e.ReturnResponse.ReturnUrl, e.ReturnResponse.PostJsonData);
        } else if (e.ReturnResponse.ReturnUrl != null) {
            window.location = e.ReturnResponse.ReturnUrl;
        } else {
            if (!hideMessage) {
                $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
            }
            $(document).trigger(argosyEvents.PART_ADDED_TO_CART, partName);
        }
    } else {
        if (!hideMessage) {
            $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
        }
        $(document).trigger(argosyEvents.PART_ADDED_TO_CART, partName);
    }
}

function setActiveMenuItem() {
    var url = window.location.href.toLowerCase(),
        menu = $('#menu');
    menu.find(' a.active').removeClass('active');
    if (url.indexOf("digitalassets") >= 0) {
        menu.find('.select-digital-assets-menu').addClass('active');
    }
    else if (url.indexOf("retail") >= 0) {
        menu.find('.select-retail-menu').addClass('active');
    } else if (url.indexOf("admin") >= 0) {
        menu.find('.select-admin-menu').addClass('active');
    } else if (url.indexOf("tools") >= 0) {
        menu.find('.select-tools-menu').addClass('active');
    } else if (url.indexOf("account") >= 0) {
        menu.find('.select-account-menu').addClass('active');
    } else {
        menu.find('.select-store-menu').addClass('active');
    }

}
function showPartQuantityModal(part) {
    var modalPartQtyView = "div[data-argosy-view=ModalPartQuantityView]",
        modalViewTemplate = "#_ProductModelViewTemplate",
        modalPartQtyViewTemplate = "#_ProductQuantityModalViewTemplate",
        modalPartQtyFancyboxHref = "div[data-argosy-modal=ModalPartQuantity]",
        partName = part.PartName,
        quantityViewModel = kendo.observable({
            quantity: part.DefaultQuantity,
            partId: part.PartId,
            part: new kendo.data.ObservableObject(part),
            priceBreakDataBound: function (e) {
                var $dropDown = $(e.sender.element),
                    dataWidth = $dropDown.data("kendoDropDownList").list.width(),
                    containerWidth = 70;
                $dropDown.data("kendoDropDownList").list.width("auto");
                $dropDown.closest(".k-widget").width(containerWidth);
            },
            addToCart: function (e) {
                var kendoObj = this,
                    url = "/Store/Cart/AddToCart",
                    alert = $("#_ProductQuantityModalAlert"),
                    data = {
                        qty: kendoObj.get("quantity")
                    },
                    isOkToAdd = checkBeforeAddingToCart(part, data.qty, alert);
                if (isOkToAdd) {
                    alert.hide();
                    data.part = part;
                    data.partId = part.PartId;
                    callCart(data, partName, url);
                    $.fancybox.close();
                }
            },
            updateQuantity: function (e) {
                var kendoObj = this;
                kendoObj.quantity = parseInt(e.sender.value());
            }
        }), 
        updateQuantityHack = function () {
            var inputs = $.fancybox.wrap.find("select.price-break-dropdown,input.qty_input:not([data-role])");
            $(inputs).each(function (i) {
                if ($.isKendo(this)) {
                    $.getKendoControl($(this)).value(part.DefaultQuantity);
                } else {
                    $(this).val(part.DefaultQuantity);
                }
            });
        };
    
    if ($(modalPartQtyView).length <= 0) {
        $(document.body).append($(modalViewTemplate).html());
    }

    if (part.IsOrderByCPQ && (part.DefaultQuantity % part.CPQ) != 0) {
        quantityViewModel.quantity = 1 * part.CPQ;
        part.DefaultQuantity = 1 * part.CPQ;
    }

    $(modalPartQtyView).html(kendo.Template.compile($(modalPartQtyViewTemplate).html())(part));
    kendo.bind($('#_ProductQtyBindHref'), quantityViewModel);
    $.fancybox({
        href: modalPartQtyFancyboxHref,
        type: "inline",
        scrolling: "no",
        afterShow: function (e) {
            updateQuantityHack();
            addArgosyActions($.fancybox.wrap);
        }
    });
}
function kendoOptionsToObject(options) {
    if (options.data != null) { // if transport.read
        options = options.data;
    }
    var data = {};
    if (options != null) {
        if (options.page != null) {
            data.Page = options.page;
        }
        if (options.pageSize != null) {
            data.PageSize = options.pageSize;
        }
        if (options.skip != null) {
            data.Skip = options.skip;
        }
        if (options.take != null) {
            data.Take = options.take;
        }
        if (options.sort != null && options.sort.length > 0) {
            var sortOptions = [];
            $(options.sort).each(function (i) {
                sortOptions.push(this.field + "-" + this.dir);
            });
            data.Sort = sortOptions;
        }
        if (options.filter != null) {
            data = parseFilterExpression(data, options.filter);
        }
    }
    return data;
}

function parseFilterExpression(data, filter) {
    if (filter.field != null) {
        data[filter.field] = filter.value;
    }
    if (filter.filters != null && filter.filters.length > 0) {
        for (var i = 0; i < filter.filters.length; i++) {
            data = parseFilterExpression(data, filter.filters[i]);
        }
    }
    return data;
}

function getInputValue(input) {
	var returnVal = null;
	var value = null;
	input = $(input);
	if (input.getKendoDatePicker() != null) {
		val = input.getKendoDatePicker().value();
		if (val != null) {
			returnVal = val.toJSON();
		}
	} else if ($.isKendo(input)) {
		var control = $.getKendoControl(input);
		val = control.value();
		if (val != null) {
			returnVal = val;
		}
	} else {
        var type = "";
        if (input.is("div") && $(input).find("input[type='checkbox']").length > 0) {
            input = $(input).find("input[type='checkbox']");
            type = "checkbox";
        } else if (input.is("input")) {
            type = String(input.attr('type')).toLowerCase();
		}
        switch (type) {
            case "checkbox":
            case "radio":
                returnVal = input.is(":checked");
                break;
            default:
                var elementVal = input.val();
                if (input.data("getValue") != undefined) {
                    elementVal = input.data("getValue")();
                }
                if (elementVal != "" && elementVal != null) {
                    returnVal = elementVal;
                }
                break;
        }
    }
    if (returnVal != null && (typeof returnVal) == "string" && returnVal.toLowerCase() == "null") {
        returnVal = null;
    }
    return returnVal;
}

function setInputValue(input, value) {
    if (!(input instanceof jQuery)) {
        input = $(input);
    }
    var inputType = "";
    if (input.is("div") && $(input).find("input[type='checkbox']").length > 0) {
        input = $(input).find("input[type='checkbox']");
        inputType = "checkbox";
    } else if (input.is("select")) {
        inputType = "select";
    } else {
        inputType = input.attr("type");
    }

    if ($.isKendo(input)) {
        var kendoObject = $.getKendoControl(input);
        if (kendoObject != null && !input.is("select")) {
            kendoObject.value(value);
            return;
        } else if (kendoObject != null && kendoObject.dataSource != null) {
            var data = kendoObject.dataSource.data();
            var exists = $.grep(data, function(item) {
                return item.value === value;
            });
            if (exists.length === 0) {
                kendoObject.dataSource.add({ Text: value, Value: value });
            }
            kendoObject.select(function (item) {
                return item.value === value;
            });
            return;
        }
    }

    switch (inputType) {
        case "checkbox":
            if (value != null && value) {
                input.attr("checked", "checked");
            } else {
                input.removeAttr("checked");
            }
            break;
        default:
            try {
                if (input.attr("maxlength") != null) {
                    var maxLength = parseInt(input.attr("maxlength"));
                    if (maxLength > 0 && value.length > maxLength) {
                        value.substring(0, maxLength);
                    }
                }
            } catch(err) {
                // ignore this it's a null value;
            } 
            input.val(value);
            break;
    }
}

function kendoOptionsToQuerystring(options) {
    var params = [];

    if (options != null && options.data != null) {
        if (options.data.page != null) {
            params.push("page=" + options.data.page);
        }
        if (options.data.pageSize != null) {
            params.push("pageSize=" + options.data.pageSize);
        }
        if (options.data.skip != null) {
            params.push("skip=" + options.data.skip);
        }
        if (options.data.take != null) {
            params.push("take=" + options.data.take);
        }
        if (options.data.sort != null && options.data.sort.length > 0) {
            var sortOptions = [];
            $(options.data.sort).each(function (i) {
                sortOptions.push(this.field + "-" + this.dir);
            });
            params.push("sort=" + sortOptions.join(","));
        }
    }
    if (params.length > 0) {
        return "?" + params.join("&");
    } else {
        return "";
    }
}

function convertInputsInElements(e, data) {
    var parentElement = $(data);
    parentElement.find("input:not([data-argosy-control]):not([data-role])").each(function (i) {
        var item = $(this);
        switch (item.attr("type")) {
            case "text":
                item.addClass("k-textbox");
                break;
            case "number":
                item.kendoNumericTextBox({
                    spinners: false,
                });
                break;
            case "date":
                item.kendoDatePicker({
                });
                break;
        }
    });
    parentElement.find("select:not([data-argosy-control]):not([data-role])").each(function (i) {
        var item = $(this);
        item.kendoDropDownList();
        item.getKendoDropDownList().list.width("auto");
    });
    parentElement.find("*[data-argosy-control]:not([data-argosy-uuid]:not([data-role]))").each(function (i) {
        var wrapper = $(this);
        controlLoader.processControlElement(this, function (a) {
            var searchName = wrapper.attr("data-argosy-search");
            wrapper.removeAttr("data-argosy-search");
            if (wrapper.find("select").length > 0) {
                wrapper.find("select").attr("data-argosy-search", searchName);
            } else if (wrapper.find("input").length > 0) {
                wrapper.find("input").attr("data-argosy-search", searchName);
            }
        });
    });
    parentElement.find("*[data-link]").each(function (i) {
        $.addChangeEvent(this);
    });
}

function getInputControl(inputType, attributes) {
    var finalInput = null;
    if (attributes == null) {
        attributes = {};
    }
    if (attributes.placeholder == null) {
        attributes.placeholder = "";
    }
    if (attributes["class"] == null) {
        attributes["class"] = "";
    }
    switch (inputType) {
        case "text":
        case "number":
        case "date":
            var input = $("<input />", {
                type: inputType,
                placeholder: attributes.placeholder,
                "class": attributes["class"]
            });
            finalInput = input;
            break;
        case "checkbox":
            var checkboxId = kendo.guid();
            var wrapper = $("<div />");
            wrapper.append($("<input />", {
                type: inputType,
                id: checkboxId,
                "class": attributes["class"]
            }));
            wrapper.append($("<label />", {
                text: attributes.placeholder,
                'for': checkboxId
            }));
            if (attributes.checked != null && attributes.checked) {
                wrapper.find("input").attr("checked", "checked");
            }
            finalInput = wrapper;
            break;
        case "select":
            var select = $("<select />", {
                type: inputType,
                placeholder: attributes.placeholder,
                "class": attributes["class"]
            });
            if (attributes.data != null && attributes.data.length > 0) {
                if (attributes.placeholder !== null && attributes.placeholder.length > 0) {
                    select.append($("<option />", {
                        text: attributes.placeholder,
                        value: ""
                    }));
                };
                $(attributes.data).each(function () {
                    select.append($("<option />", {
                        text: this.text,
                        value: this.value,
                        selected: (this.selected != null && this.selected)
                    }));
                });
            }
            finalInput = select;
            break;
        case "argosy":
            var element = $("<div />", attributes);
            element.removeAttr("dataargosysearch");
            finalInput = element;
            break;
    }
    if (finalInput != null) {
        if (attributes.dataArgosySearch != null) {
            finalInput.attr('data-argosy-search', attributes.dataArgosySearch);
        }
        if (attributes["class"] != null) {
            finalInput.attr('class', attributes["class"]);
        }
        return finalInput.outerHtml();
    }
    return "";
}

function getQuerystring(key, default_) {
    if (default_ == null) {
        default_ = "";
    }
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)", "i");
    var qs = regex.exec(window.location.href);
    if (qs == null) {
        return default_;
    } else {
        return qs[1];
    }
}

function globalPageInit() {

    //ipad refresh on rotate
    if (window.addEventListener) {
        window.addEventListener("orientationchange", function () {
            window.location.reload();
        }, false);
    }

    //    $(document).on('click', '#menu .top-search .icon-magnifier', function(){
    //        var $topSearch = $('#menu .top-search');
    //        $topSearch.toggleClass('active');
    //        if ($topSearch.hasClass("active")){
    //            $topSearch.find('input').focus();
    //        }
    //    });

    $(document).on('click', "span.quick-view", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $.magnificPopup.open({
            items: {
                src: $(this).data('prdid'),
                type: 'inline'
            }
        });
    });

    if ($(window).width() > 900) {
        $(".prod-th").mouseenter(function (e) {
            $(".quick-view").hide();
            $(".quick-view", this).stop().fadeIn(300);
        }).mouseleave(function (e) {
            $(".quick-view").hide();
        });
    }
    var url = $("#imgCompanyLogo").attr('src');
    if (url === undefined) {
        url = "";
    }
    var $mobileNav = $("<div class='mobile-nav'><table class='w100'><tr><td class='textl w100'><a href='/'><img class='padl10 img-responsive company-logo' src='" + url + "' /></a></td><td><a href='/Store/contactus' class='co-neutral'><i class='f24 fa fa-phone'></i></a></td><td class='padr5 padl10'><a href='\#divUserLogin' class='fancybox co-neutral'><i class='f24 fa fa-user'></i></a></td><td><a class='mobile-button neutral-link' id='show-nav'><i class='f24 fa fa-navicon'></i></a></td></tr></table></div>");
    var $menu = $("#menu");
    // clone menu for mobile and remove id
    var $newNav = $menu.clone();
    $newNav.removeAttr('id');
    $newNav.addClass('mobile-menu');
    $mobileNav.append($newNav);

    $("body").prepend($mobileNav);

    $newNav.find('li.has-sub > a').each(function () {
        var tis = $(this);
        var state = false;
        var subMenu = tis.next('ul').slideUp();
        tis.on('click', function (e) {
            e.preventDefault();
            state = !state;
            subMenu.slideToggle(state);
            tis.closest('li').toggleClass('active', state);
        });
    });

    $('ul.mobile-menu').hide();

    $('#show-nav').on('click', function () {
        $("ul.mobile-menu").slideToggle();
    });

    function initMenu() {
        $menu.find('.open').removeClass('open');
    }

    $(document).on('click', '#menu.click-me .has-sub > a', function (e) {
        // handle desktop menu clicks
        e.preventDefault();
        e.stopPropagation();
        var that = $(this);
        var thatParent = that.parent();
        if (thatParent.hasClass('level-1')) {
            if (thatParent.hasClass('open')) {
                initMenu();
            } else {
                initMenu();
                thatParent.addClass('open');
                that.next('ul').toggleClass('open');
            }
        } else {
            if (that.next('ul').hasClass('open')) {
                // hide the sub attached to this link
                thatParent.find('ul').removeClass('open');
            } else {
                // close any open subs and then open sub attached to this link
                that.closest('ul.open').find('ul').removeClass('open');
                that.next('ul').addClass('open');
            }
        }
    });
    $(".topNavSearch").each(function (i, element) {
        element = $(element);
        if (element.is("input")) {
            element.keypress(function (event) {
                if (event.keyCode == 13) {
                    if (event.preventDefault()) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                    window.location = "/Search?searchFor=" + encodeURIComponent(element.val());
                }
                event.returnValue = true;
            });
        } else {
            element.click(function (e) {
                var input = element.parent().parent().find("input");
                window.location = "/Search?searchFor=" + encodeURIComponent(input.val());
            });
        }
    });
}

// thanks http://blog.stevenlevithan.com/archives/parseuri!
// simple solutions.
function parseUri(str) {
    var o = parseUri.options,
		m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

function downloadFile(path, forceDownload, overrideFileName, partId) {
    if (forceDownload == null) {
        forceDownload = false;
    }
    if (overrideFileName == null) {
        overrideFileName = "";
    }
    currentPage = window.location.pathname;
    $("#file-download").attr("src", "/download?path=" + path + "&forceDownload=" + forceDownload + "&overrideFileName=" + overrideFileName + "&currentPage=" + currentPage + "&partId=" + partId);
}


function showImage(id, image) {
    if (id != "") {
        $.fancybox(image, {
            afterClose: function () {
                $(document).trigger(argosyEvents.SHOW_PART_DETAILS_MODAL, {
                    partId: id,
                    showAddToCart: false
                });
            }
        });
    } else {
        $.fancybox(image);
    }
}


// each element on a page will receive an onkeypress event
// that ties to the enter button that is either defined as 
// an attribute 
// example of tying input to a specific submit button:
// <input type='text' class="submitAction" submit='btnSubmitSearch' /><input type='button' id='btnSubmitSearch' />
// example of tying an input to a default submit for a page:
// <input type='text' class="submitAction" /><input type='button' id='btnSubmitSearch' class="defaultButton" />
function setupFormDefaultSubmits(parentElement) {
    var globalDefaultButtons = jQuery(".defaultButton");
    var globalDefaultButton = null;
    if (globalDefaultButtons.length > 1) {
        jsConsole.warn("Multiple default buttons for page.  first button will be used by default.");
    }
    if (globalDefaultButtons.length > 0) {
        var firstButton = jQuery(globalDefaultButtons[0]);
        // probably should verify that there is an onclick or something on the firstbutton
        globalDefaultButton = firstButton;
        jsConsole.log("default button [" + firstButton.attr("id") + "]");
    } else {
        jsConsole.warn("No default buttons for page.");
    }
    $(parentElement).find(".submitAction").each(function (i) {
        var element = jQuery(this);
        var submitButtonToUse = null;
        var submitSelector = "";
        if (element.data()["defaultSubmit"] == null) {
            if (element.attr("submit") != undefined && element.attr("submit") != null) {
                switch (element.attr("submit").substr(0, 1)) {
                    case ".":
                    case "#":
                        submitSelector = element.attr("submit");
                        break;
                    default:
                        submitSelector = "#" + element.attr("submit");
                        break;
                }
                var submitButtons = jQuery(submitSelector);
                if (submitButtons.length > 0) {
                    submitButtonToUse = jQuery(submitButtons[0]);
                } else {
                    jsConsole.warn("could not find submit button " + element.attr("submit") + ".");
                }
            }
            var fancybox = element.closest(".fancybox-inner");
            if (fancybox) {
                var button = fancybox.find(".fancyboxDefaultSubmit");
                if (button) {
                    submitButtonToUse = button;
                }
            }
            if (submitButtonToUse == null && globalDefaultButton != null) {
                submitButtonToUse = globalDefaultButton;
            }
            if (!element.is("textarea")) {
                if (submitButtonToUse != null) {
                    jsConsole.log(element.attr("id") + " submits with " + submitSelector);
                    element.unbind("keypress");
                    element.keypress(function (e) {
                        setFormSubmit(e, submitButtonToUse);
                    });
                } else {
                    jsConsole.warn(element.attr("id") + " has no button assignment");
                }
                element.data("defaultSubmit", {
                    isConfigured: true,
                    submitButton: submitButtonToUse
                });
            }
        }
    });
}

function setFormSubmit(event, button) {
    if (event.keyCode == 13) {
        jQuery(button)[0].click();
        if (event.preventDefault()) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
    event.returnValue = true;
}
function setFancyboxFocus() {
    if ($.fancybox.wrap) {
        var defaults = $.fancybox.wrap.find("input.defaultFancyboxFocus:not(.k-textbox)");
        if (defaults.length > 1) {
            jsConsole.warn("Multiple default elements to focus on.  first element will be used by default.");
        }
        if (defaults.length > 0) {
            if ($.isKendo(defaults)) {
                $.getKendoControl(defaults).focus();
            } else {
                jQuery(defaults[0]).focus();
            }
        }
    }
}

// the first element with the class defaultFocus
// will be made the focused element upon page load.

function setupPageDefaultFocus() {
    var defaults = jQuery(".defaultFocus");
    if (defaults.length > 1) {
        jsConsole.warn("Multiple default elements to focus on.  first element will be used by default.");
    }
    if (defaults.length > 0) {
        jQuery(defaults[0]).focus();
    }
}

function setupGlobalImageEditor() {
    $("body")
        .append($("<div />",
        {
            "class": "hide",
            "id": "GlobalImageEditor"
        }));
    var imageEditor = $("#GlobalImageEditor");
    imageEditor.kendoImageEditor({

    });

    imageEditor = imageEditor.getKendoImageEditor();
    $(document).bind(argosyEvents.EVENT_SHOW_IMAGE_EDITOR, function (e, data) {
        if (imageEditor != null) {
            imageEditor.value(data.imageUrl);
            imageEditor.edit(data.imageUrl, function (image) {
                $(data.input).val(image.UploadFileUrl);
                $(data.preview).attr("src", image.PreviewFileUrl + "?w=150&h=150");
                if (data.returnHref != null) {
                    $.fancybox({
                        href: data.returnHref
                    });
                }
            }, function () {
                if (data.returnHref != null) {
                    $.fancybox({
                        href: data.returnHref
                    });
                }
            }, data.isFixedAspectRatio, data.minHeight, data.minWidth);
        }
    });
}

//////////////////////////////////////////////////////////////////////////
/////////       THIS IS AN IN MEMORY PART CACHE         //////////////////
//////////////////////////////////////////////////////////////////////////
var __partCache = new Array();
function getPart(partId, callback) {
    //var part = __partCache[partId];
    //if (part == null) {

    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Store/Part/GetPartById/" + partId,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (p) {
            //__partCache[partId] = p;
            callback($.extend(true, {}, p));
            $(document).trigger(argosyEvents.END_LOADING);
        }
    });
    //} else {
    //    var data = JSON.stringify(part);
    //
    //    callback(part);
    //}
}
function getPartBySku(partSku, callback) {
    //var part = __partCache[partId];
    //if (part == null) {
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Store/Part/GetPartBySku/" + partSku,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (p) {
            //__partCache[partId] = p;
            callback($.extend(true, {}, p));
            $(document).trigger(argosyEvents.END_LOADING);
        }
    });
    //} else {
    //    var data = JSON.stringify(part);
    //
    //    callback(part);
    //}
}
function addPart(part) {
    __partCache[part.PartId] = part;
}
function addParts(parts) {
    $(parts).each(function (i, part) {
        __partCache[part.PartId] = part;
    });
}
function getUser(userId, callback) {
    //var part = __partCache[partId];
    //if (part == null) {

    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Admin/Users/GetUser/" + userId,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (p) {
            //__partCache[partId] = p;
            callback($.extend(true, {}, p));
            $(document).trigger(argosyEvents.END_LOADING);
        }
    });
    //} else {
    //    var data = JSON.stringify(part);
    //
    //    callback(part);
    //}
}
//////////////////////////////////////////////////////////////////////////
/////////            END IN MEMORY CACHE                //////////////////
//////////////////////////////////////////////////////////////////////////

function qualifyURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}

/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */
function jsonPath(obj, expr, arg) {
    var P = {
        resultType: arg && arg.resultType || "VALUE",
        result: [],
        normalize: function (expr) {
            var subx = [];
            return expr.replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) { return "[#" + (subx.push($1) - 1) + "]"; })
                       .replace(/'?\.'?|\['?/g, ";")
                       .replace(/;;;|;;/g, ";..;")
                       .replace(/;$|'?\]|'$/g, "")
                       .replace(/#([0-9]+)/g, function ($0, $1) { return subx[$1]; });
        },
        asPath: function (path) {
            var x = path.split(";"), p = "$";
            for (var i = 1, n = x.length; i < n; i++)
                p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
            return p;
        },
        store: function (p, v) {
            if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
            return !!p;
        },
        trace: function (expr, val, path) {
            if (expr) {
                var x = expr.split(";"), loc = x.shift();
                x = x.join(";");
                if (val && val.hasOwnProperty(loc))
                    P.trace(x, val[loc], path + ";" + loc);
                else if (loc === "*")
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { P.trace(m + ";" + x, v, p); });
                else if (loc === "..") {
                    P.trace(x, val, path);
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { typeof v[m] === "object" && P.trace("..;" + x, v[m], p + ";" + m); });
                }
                else if (/,/.test(loc)) { // [name1,name2,...]
                    for (var s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++)
                        P.trace(s[i] + ";" + x, val, path);
                }
                else if (/^\(.*?\)$/.test(loc)) // [(expr)]
                    P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";") + 1)) + ";" + x, val, path);
                else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { if (P.eval(l.replace(/^\?\((.*?)\)$/, "$1"), v[m], m)) P.trace(m + ";" + x, v, p); });
                else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
                    P.slice(loc, x, val, path);
            }
            else
                P.store(path, val);
        },
        walk: function (loc, expr, val, path, f) {
            if (val instanceof Array) {
                for (var i = 0, n = val.length; i < n; i++)
                    if (i in val)
                        f(i, loc, expr, val, path);
            }
            else if (typeof val === "object") {
                for (var m in val)
                    if (val.hasOwnProperty(m))
                        f(m, loc, expr, val, path);
            }
        },
        slice: function (loc, expr, val, path) {
            if (val instanceof Array) {
                var len = val.length, start = 0, end = len, step = 1;
                loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function ($0, $1, $2, $3) { start = parseInt($1 || start); end = parseInt($2 || end); step = parseInt($3 || step); });
                start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
                end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
                for (var i = start; i < end; i += step)
                    P.trace(i + ";" + expr, val, path);
            }
        },
        eval: function (x, _v, _vname) {
            try { return $ && _v && eval(x.replace(/@/g, "_v")); }
            catch (e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
        }
    };

    var $ = obj;
    if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
        P.trace(P.normalize(expr).replace(/^\$;/, ""), obj, "$");
        return P.result.length ? P.result : false;
    }
}

function serializeObject(input) {
	var data = {};
	if (input) {
		$(input).find("input, textarea").each(function () {
			var name = $(this).attr("name");
			var value = $(this).val();
			data[name] = value;
		});
	}
	return data;
}
function getPreviewImage (image, id, cacheBuster) {
    var previewPath;
    $("#" + id).removeAttr("onload");
    var fileExtension = getFileExtension(image);
    if (fileExtension == ".pdf" || fileExtension == ".eps") {
        $.ajax({
            url: "/Upload/Preview?filePath=" + image,
            dataType: "json",
            method: "POST",
            success: function (result) {
                if (fileExtension == ".pdf") {
                    previewPath = result[0].href;
                } else {
                    previewPath = result;
                }
                setPreviewPath(previewPath, id, cacheBuster);
            },
            error: function (e) {
            },
            complete: function (e) {
            }
        });
    } else {
        setTimeout(function (e) {
            setPreviewPath(image, id, cacheBuster);
        }, 100);

    }
}

function setPreviewPath(path, id, cacheBuster) {
    if (cacheBuster == null || cacheBuster == undefined) {
        cacheBuster = Math.random();
    }
    $("#" + id).attr("src", path + "?h=150&w=150&t=" + cacheBuster);
    $("#" + id).attr("path", path);
}

function getFileExtension(path) {
    var ext = "";
    if (path != null) {
        ext = "." + path.split('.').pop();
    }
    return ext;
}
function getUrlVars(input) {
    var vars = [], hash;
    if (input != undefined) {
        var hashes = input.slice(input.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    }
    return vars;
}

function showKitBuilderContainer(id) {
    $(".kit-container:visible:not(#" + id + ")").hide();
    $("#" + id).toggle();
    $(".fa-minus-circle").each(function (i) {
        $(this).addClass("fa-plus-circle");
        $(this).removeClass("fa-minus-circle");
    });
    if (!$("#" + id).is(":hidden")) {
        KitBuilder.prototype.ActiveTab = id;
        $("#" + id + "Expander").removeClass("fa-plus-circle").addClass("fa-minus-circle");
    } else {
        $("#" + id + "Expander").addClass("fa-plus-circle").removeClass("fa-minus-circle");
    }
}