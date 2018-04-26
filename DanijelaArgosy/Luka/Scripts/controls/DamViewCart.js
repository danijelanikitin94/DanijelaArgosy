function DamViewCart(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("DamViewCart", function (template) {
        $(document.body).append(template);
        that.setupEventListeners();
        that.init();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

DamViewCart.prototype.options = {};

DamViewCart.prototype.baseOptions = {
};

DamViewCart.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_DAM_VIEW_CART_LOADED";
DamViewCart.prototype.EVENT_LISTENERS_LOADED = "DAM_DIRECTORY_VIEW_CART_LOADED";
DamViewCart.prototype.EVENT_DATABOUND = "DAM_VIEW_CART_DATABOUND";

DamViewCart.prototype.dataSourceOpts = {};

DamViewCart.prototype.setupEventListeners = function() {
};

DamViewCart.prototype.init = function () {
    var that = this;
    var parentElement = that.getElement();
    that.grid = parentElement.kendoGrid({
        scrollable: false,
        editable: false,
        autoBind: true,
        dataSource: that.getDataSource({}),
        groupable: false,
        sortable: false,
        selectable: false,
        pageable: false,
        noRecords: true,
        messages: {
            noRecords: "There are no assets in your cart."
        },
        toolbar: [
            { name: "place-order", template:"<button class='btn btn-primary k-grid-place-order pull-right maru10'>~{PlaceOrder}~</button>"}
        ],
        columns: [
            {
                title: " ",
                template: '<img class="img-border img-responsive" style="max-height: 100px;" alt="Asset" src="${Thumbnail}">',
                width: "150px"
            },
            {
                title: "~{Name}~",
                field: "Name"
            }, 
            {
                title: "~{Width}~",
                field: "Width",
                template: "${kendo.toString(Width, 'n0')} px",
                width: "10%"
            }, 
            {
                title: "~{Height}~",
                field: "Height",
                template: "${kendo.toString(Height, 'n0')} px",
                width: "10%"
            }, 
            {
                title: "~{DPI}~",
                field: "Dpi",
                width: "10%"
            },
            /*{
                title: "Size",
                template: kendo.template($("#_cartDimensionTemplate").html())
            },*/
            {
                title: " ",
                template: '<a data-argosy-action="removeFromAssetCart" data-argosy-id="${Id}" class="co-warning"><i class="fa fa-times-circle"></i><span class="resp-hidden"> ~{Remove}~</span></a>',
                width: "10%"
            }
        ],
        dataBound: function (e) {
            var removeButtons = e.sender.element.find("*[data-argosy-action=removeFromAssetCart]");
            removeButtons.click(function (e) {
                var lineId = $(this).attr("data-argosy-id");
                that.removeFromCart(lineId);
            });
            var placeOrder = e.sender.element.find(".k-grid-place-order");
            placeOrder.unbind("click");
            placeOrder.click(function(e) {
                $(document).trigger(argosyEvents.START_LOADING);
                $.ajax({
                    url: "/Tools/DigitalAssets/PlaceOrder",
                    dataType: "json",
                    success: function (result) {
                        if (result.ReturnCode == ReturnCode.Failed) {
                            handleDataSourceException(result);
                        } else {
                            prompt.alert({
                                question: "~{OrderSuccessfullyPlaced}~",
                                description: "",
                                type: "success",
                                yes: function (e) {
                                    window.location = "/Tools/DigitalAssets/Orders";
                                }
                            });
                        }
                    },
                    complete: function(result) {
                        $(document).trigger(argosyEvents.END_LOADING);
                    }
                });
            });
            if (e.sender.element.getKendoGrid().dataItems().length > 0) {
                placeOrder.removeAttr("disabled");
            } else {
                placeOrder.attr("disabled", "disabled");
            }
        }
    });
};

DamViewCart.prototype.removeFromCart = function (lineId) {
    var that = this;
    $.ajax({
        url: "/tools/digitalassets/RemoveAssetFromCart",
        dataType: "json",
        method: "POST",
        data: {
            assetCartLineId: lineId
        },
        success: function (result) {
            prompt.alert({
                question: "~{AssetRemovedFromCart}~",
                description: "",
                type: "success",
                yes: function (e) {
                    $.fancybox.close();
                }
            });
            that.getElement().getKendoGrid().dataSource.read();
        },
        error: function (result) {
            prompt.alert({
                question: "~{ErrorRemovingAssetsFromCart}~",
                description: "Ref: " + result,
                type: "error",
                yes: function (e) {
                    $.fancybox.close();
                }
            });
        }
    });
}

DamViewCart.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

DamViewCart.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Tools/DigitalAssets/GetCart",
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
    return new kendo.data.DataSource(that.dataSourceOpts);
};