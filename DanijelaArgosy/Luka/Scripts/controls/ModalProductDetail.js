function ModalProductDetail(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ModalProductDetail", function (template) {
        if ($("#_ModalProductInventory").length == 0) {
            $(document.body).append(template);
        }
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ModalProductDetail.prototype.options = {
    product: {}
};

ModalProductDetail.prototype.baseOptions = {
    templateSelector: "#_ModalProductDetail",
    templateEnlargeImageViewTemplate: "#_ModalProductEnlargeImageViewTemplate",
    modalDiv: "#_ModalProductEnlargeImage",
    gridViewHref: "#_ModalProductKitView",
    fancyboxHref: "#_ModalProductContainer",
    configurationRowTemplate: "#_ModalProductDetailConfigurationGridTemplate",
    kitRowTemplate: "#_ModalProductDetailKitGridTemplate",
    productInventoryTemplate: "#_ModalProductInventory",
    productDetailTemplate: "#_ModalProductDetail",
    partCrossSellTemplate: "#_PartCrossSaleWrapperTemplate",
};

ModalProductDetail.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_PRODUCT_DETAIL_LOADED";

ModalProductDetail.prototype.setupComponentGridView = function (parts, isInventoryView,isKit) {
    var that = this,
        rowTemplate = isKit ? that.options.kitRowTemplate : that.options.configurationRowTemplate;
    if (isKit || isInventoryView) {
        $(that.options.gridViewHref).kendoGrid({
            dataSource: {
                data: parts
            },
            rowTemplate: kendo.template($(rowTemplate).html()),
            columns: [
                {
                    title: ""
                },
                {
                    title: "~{Product}~"
                },
                {
                    title: "~{QuantityAvailable}~",
                    headerAttributes: {
                        "class": "globals-qtyavailable textr"
                    }
                },
                {
                    title: "~{QuantityOnHand}~",
                    headerAttributes: {
                        "class": "textr"
                    }
                },
                {
                    title: "~{Qty}~",
                    headerAttributes: {
                        "class": "textr"
                    }
                }
            ],
            sortable: true,
            scrollable: false,
            dataBound: function (e) {
                var grid = e.sender;
                addArgosyActions(that.options.gridViewHref);
                if (isInventoryView) {
                    grid.hideColumn(4);
                } else {
                    grid.hideColumn(2);
                    grid.hideColumn(3);
                }
            },
            autoBind: true
        });
    }
}
ModalProductDetail.prototype.show = function (part, hideCartInputs, isInventoryView, showAddToCart) {
    var that = this;
    if (hideCartInputs == null) {
        hideCartInputs = false;
    }
    if (isInventoryView == null) {
        isInventoryView = false;
    }
    if (showAddToCart == null) {
        showAddToCart = true;
    }

    $(document).bind(argosyEvents.PART_ADDED_TO_CART, function (e, data) {
        if (data == part.PartName) {
            $.fancybox.close();
        }
    });

    part.hideCartInputs = hideCartInputs;
    part.showAddToCart = showAddToCart;
    var htmlToLoad;
    if (isInventoryView) {
        htmlToLoad = $(that.options.productInventoryTemplate).html();
    } else {
        htmlToLoad = $(that.options.productDetailTemplate).html();
    }
    var template = kendo.template(htmlToLoad),
        html = kendo.Template.compile($(that.options.templateEnlargeImageViewTemplate).html())(part),
        partViewModel = kendo.observable({
            part: part,
            quantity: part.DefaultQuantity,
            priceBreakDataBound: function(e) {
                var $dropDown = $(e.sender.element),
                    $kendoObj = $dropDown.data("kendoDropDownList");
                $dropDown.data("kendoDropDownList").list.width("auto");
            },
            isShowAddToCart: function(e) {
                return this.part.showAddToCart;
            },
            showProductDetails: function (e) {
                that.show(e.data);
            },
            showAddToCartModal: function (e) {
                $(document).trigger(argosyEvents.SHOW_PART_QUANTITY_MODAL, e.data.PartId);
            },
            showCrossSellItems: function (e) {
                return this.part.CrossSellParts != null && this.part.CrossSellParts.length > 0;
            },
            crossSaleItems: new kendo.data.DataSource({
                transport: {
                    read: {
                        url: "/Store/Part/GetPartsById",
                        dataType: "json",
                        contentType: "application/json",
                        complete: function () {
                            $.fancybox.update();
                        }
                    },
                    parameterMap: function(data) {
                        data.ids = part.CrossSellParts;
                        return data;
                    }
                }
            })
        });


    var updateQuantityHack = function() {
        var inputs = $.fancybox.wrap.find("select.price-break-dropdown,input.qty_input:not([data-role])");
        $(inputs).each(function(i) {
            if ($.isKendo(this)) {
                $.getKendoControl($(this)).value(part.DefaultQuantity);
            } else {
                $(this).val(part.DefaultQuantity);
            }
        });
    };
    $(that.options.modalDiv).html(html);
    if (part.IsConfigurable) {
        $.ajax({
            url: "/Store/Part/GetPartsInConfiguration?parentPartId=" + part.PartId,
            dataType: "json",
            method: "GET",
            success: function (result) {
                $(that.options.fancyboxHref).html(template(part));
                that.setupComponentGridView(result, isInventoryView, false);
                $.fancybox({
                    href: that.options.fancyboxHref,
                    afterShow: function () {
                        var fancybox = this.wrap;
                        kendo.bind(fancybox, partViewModel);
                        addArgosyActions(fancybox);
                        updateQuantityHack();
                        $(document).trigger(argosyEvents.END_LOADING, { name: "MvcProductView" });
                        $(document).trigger(argosyEvents.END_LOADING, { name: "ShoppingCartView" });
                        $(".fancybox").fancybox();
                    }
                });
            }
        });
    }
    else if (part.IsKit) {
        $.ajax({
            url: "/Store/Kit/GetKitParts?sku=" + part.Sku,
            dataType: "json",
            method: "GET",
            success: function (result) {
                $(that.options.fancyboxHref).html(template(part));
                that.setupComponentGridView(result, isInventoryView,true);
                $.fancybox({
                    href: that.options.fancyboxHref,
                    afterShow: function () {
                        var fancybox = this.wrap;
                        kendo.bind(fancybox, partViewModel);
                        addArgosyActions(fancybox);
                        updateQuantityHack();
                        $(document).trigger(argosyEvents.END_LOADING, { name: "MvcProductView" });
                        $(document).trigger(argosyEvents.END_LOADING, { name: "ShoppingCartView" });
                        $(".fancybox").fancybox();
                    }
                });
            }
        });
    } else {
        $.fancybox({
            content: template(part),
            afterShow: function () {
                var fancybox = this.wrap;
                kendo.bind(fancybox, partViewModel);
                addArgosyActions(fancybox);
                updateQuantityHack();
                $(document).trigger(argosyEvents.END_LOADING, { name: "MvcProductView" });
                $(".fancybox").fancybox();
            }
        });
    }
};