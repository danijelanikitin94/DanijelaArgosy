function ContainerBuilder(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ContainerBuilder", function (template) {
        $(document.body).append(template);
        $(document).trigger(argosyEvents.START_LOADING, {
            name: that.constructor.name
        });
        $.ajax({
            url: "/store/part/PartPackDimensions?partGroupId=" + that.options.partCategoryId,
            dataType: "json",
            success: function (result) {
                var parts = [];
                $(result.Parts.Records).each(function (i, part) {
                    if (part.PackDimension != null &&
                        part.PackDimension.DefaultPerBox != null &&
                        part.PackDimension.DefaultBox != null) {
                        var cartQuantity = result.Cart[part.PartId];
                        if (cartQuantity == null) {
                            cartQuantity = 0;
                        }
                        part.CartQuantity = cartQuantity;
                        parts.push(part);
                    }
                });
                that.initialize(parts, result.Cart);
                $(document).trigger(argosyEvents.END_LOADING, {
                    name: that.constructor.name
                });
            }
        });
    });
}

ContainerBuilder.prototype.options = {
};
ContainerBuilder.prototype.baseOptions = {
    templates: {
        contentTemplate: "#_ContainerBuilderTemplate"
    }
};

ContainerBuilder.prototype.initialize = function (parts, cart) {
    var that = this;
    var viewModel = new kendo.data.ObservableObject({
        totalCases: 0,
        totalPallets: 0,
        totalWeight: 0,
        totalSquareFeet: 0,
        parentContainers: [],
        parts: parts,
        cart: cart,
        updateQuantity: function () {
            var totalCases = 0,
                totalPallets = 0,
                totalSquareFeet = 0,
                totalWeight = 0,
                parentContainers = [],
                model = this;
            $(model.parts).each(function (i, part) {
                var cartQuantity = 0;
                cartQuantity = model.cart[part.PartId];
                if (cartQuantity == null) {
                    cartQuantity = 0;
                }
                part.set("NumberOfPallets", model.getNumberOfPallets(part));
                part.set("PalletWeight", model.getPalletWeight(part));
                part.set("FeetCubed", model.getFeetCubed(part));
                totalCases += cartQuantity;
                totalPallets += (cartQuantity / part.PackDimension.DefaultPerBox);
                totalSquareFeet += (cartQuantity * (part.PackDimension.Length * part.PackDimension.Width * part.PackDimension.Height));
                totalWeight += (part.PackDimension.Weight * cartQuantity);
                var containers = part.PackDimension.DefaultBox.Containers;
                $(containers).each(function (z, newContainer) {
                    var existingContainers = $.grep(parentContainers, function (container) {
                        return container.BoxId === newContainer.BoxId;
                    });
                    if (existingContainers.length > 0) {
                        // don't do anything it alread exists
                    } else {
                        parentContainers.push(newContainer);
                    }
                });
            });
            model.set("totalCases", kendo.toString(totalCases, "n0"));
            model.set("totalPallets", kendo.toString(totalPallets, "n2"));
            model.set("totalSquareFeet", kendo.toString(totalSquareFeet / (12 * 12 * 12), "n2"));
            model.set("totalWeight", kendo.toString(totalWeight, "n0") + " lbs");
            model.set("parentContainers", parentContainers);
            this.updateSelectedContainer();
        },
        updateSelectedContainer: function() {
            var that = this,
                containers = $("*[data-max-size]"),
                containerSelected = false,
                totalWeight = parseFloat(that.totalWeight.replace(/,/g, '')),
                totalSize = parseFloat(that.totalSquareFeet.replace(/,/g, ''));
            $(containers).each(function (i, element) {
                if (!containerSelected) {
                    var obj = $(element),
                        maxSize = parseFloat(obj.attr("data-max-size")),
                        maxWeight = parseFloat(obj.attr("data-max-weight"));
                    if (totalSize <= maxSize && totalWeight <= maxWeight) {
                        obj.addClass("bg-success");
                        containerSelected = true;
                    }
                }
            });
        },
        updateCart: function (e) {
            var model = this;
            var data = {
                cartData: JSON.stringify(model.cart.toJSON())
            };
            $.ajax({
                url: "/store/cart/UpdateCartQuantity",
                data: data,
                dataType: "json",
                method: "POST",
                success: function () {
                    window.location = "/Store/Cart";
                }
            });
        },
        changeQuantity: function (e) {
            var model = this;
            model.cart[e.data.PartId] = e.data.CartQuantity;
            model.updateQuantity();
        },
        getNumberOfPallets: function (e) {
            return kendo.toString(e.CartQuantity / e.PackDimension.DefaultPerBox, "n2");
        },
        getPalletWeight: function (e) {
            return kendo.toString(e.PackDimension.Weight * e.CartQuantity, "n0");
        },
        getFeetCubed: function (e) {
            return kendo.toString(((e.PackDimension.Length * e.PackDimension.Width * e.PackDimension.Height) * e.CartQuantity)/ (12 * 12 * 12), "n2");
        },
        getWeight: function (e) {
            return kendo.toString(e.PackDimension.Weight, "n1");
        },
        getDimensions: function(e) {
            return kendo.toString((e.PackDimension.Length * e.PackDimension.Width * e.PackDimension.Height) / (12 * 12 * 12), "n1");
        },
        getDefaultPerBox: function(e) {
            return kendo.toString(e.PackDimension.DefaultPerBox, "n0");
        },
        getCubicFeet: function (e, format) {
            if (format == null) {
                format = true;
            }
            var value = (e.Length * e.Width * e.Height) / (12 * 12 * 12);
            if (format) {
                return kendo.toString(value, "n2");
            } else {
                return value;
            }
        }
    });
    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())({});
    that.getElement().append(content);
    viewModel.updateQuantity();
    kendo.bind(that.getElement(), viewModel);
    setTimeout(function() {
        $("input[data-role=numerictextbox]").bind("focus", function () {
            var input = $(this);
            clearTimeout(input.data("selectTimeId")); //stop started time out if any

            var selectTimeId = setTimeout(function()  {
                input.select();
            });

            input.data("selectTimeId", selectTimeId);
        }).blur(function(e) {
            clearTimeout($(this).data("selectTimeId")); //stop started timeout
        });
        viewModel.updateSelectedContainer();
        $("*[data-part-id]").each(function (e) {
            var element = $(this);
            element.addClass("finger");
            element.click(function (e) {
                var partId = element.attr("data-part-id");
                $(document).trigger(argosyEvents.SHOW_PART_DETAILS_MODAL, { partId: partId, showAddToCart: false });
            });
        });
    }, 1000);
};

ContainerBuilder.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};