function ModalPartConfiguration(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();

    controlLoader.loadTemplate("ModalPartConfiguration", function (template) {
        $(document.body).append(template);
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ModalPartConfiguration.prototype.options = {};

ModalPartConfiguration.prototype.baseOptions = {
    modalHref: "div[data-argosy-modal=ModalPartConfiguration]",
    partConfigurationWrapper: "#_ModalPartConfigurationTemplate",
    partId: null
};

ModalPartConfiguration.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_PART_CONFIGURATION_BUILDER_LOADED";
ModalPartConfiguration.prototype.EVENT_LISTENERS_LOADED = "PART_CONFIGURATION_BUILDER_LISTENERS_LOADED";
ModalPartConfiguration.prototype.show = function (part) {
    var that = this;
    that.options.partId = part.PartId;
    that.initialize(part);
};
ModalPartConfiguration.prototype.initialize = function (part) {
    var that = this,
        partId = part.PartId;
    part.FormatedPrice = kendo.toString(part.Price, "C");
    var model = kendo.observable({
        PartConfiguration: null,
        CurrentConfiguration: null,
        PartAttributes: null,
        ParentPart: part,
        ActivePart: part,
        CurrentCartQuantity: 0,
        PartCache: new Array(),
        AddToCartDisabled: true,
        showCallToAction: false,
        getTemplateType: function () {
            if (this.PartConfiguration != null && this.PartConfiguration.Type != null) {
                if (this.ParentPart.IsConfigurableGridView && this.PartConfiguration.Type === "Single") {
                    return "single";
                } else if (this.ParentPart.IsConfigurableGridView && this.PartConfiguration.Type === "Matrix") {
                    return "matrix";
                } else{
                    return "multi";
                }
            } else if (this.ParentPart.IsAttributeConfigured) {
                return "attribute";
            }
        },
        isCustomizePart: function () {
            return this.ActivePart.Options.IsMailingListRequired ||
                this.ActivePart.CanCustomize ||
                this.ActivePart.CanUpload;
        },
        needToAddCss: function() {
            switch (this.getTemplateType()) {
            case "multi":
            case "single":
                return true;
            case "matrix":
                return false;
            default:
                return false;
            }  
        },
        getMinOrderQty: function () {
            if ((this.ParentPart.Options != null && this.ParentPart.Options.IsEnforceMasterConfig) && userSettings.EnforceMinMaxOrderQty) {
                return this.ParentPart.MinOrderQty;
            } else {
                return this.ActivePart.MinOrderQty;
            }
        },
        isMinQtyVisible: function () {
            return userSettings.EnforceMinMaxOrderQty && this.getMinOrderQty() > 0;
        },
        isAddToCartEnabled: function () {
            model.updateQuantity({},{value: 0, partId: 0}, true);
            var addToCartDisabled = false;
            if (userSettings.EnforceMinMaxOrderQty) {
                addToCartDisabled = this.CurrentCartQuantity < this.getMinOrderQty();
            }
            if (!addToCartDisabled) {
                addToCartDisabled = this.CurrentCartQuantity == 0;
            }
            if (model.isCustomizePart()) {
                addToCartDisabled = false;
            }
            if (!addToCartDisabled) {
                model.set("showCallToAction", false);
            }
            jsConsole.log(this.ActivePart.MinOrderQty);
            model.set("AddToCartDisabled", addToCartDisabled);
            //model.set("AddToCartDisabled", false);
        },
        isDefaultAddToCart: function () {
            return (this.PartConfiguration != null && !this.PartConfiguration.HasInputType) || this.ParentPart.IsAttributeConfigured;
        },
        onAddToCartMouseOver: function (e) {
            var that = this;
            if (that.AddToCartDisabled) {
                model.set("showCallToAction", true);
            } else {
                model.set("showCallToAction", false);
            }
        },
        onAddToCartMouseOut: function (e) {
            model.set("showCallToAction", false);
        },
        attributesSelectBound: function () {
          // nada  
        },
        addToCart: function (e) {
            var partsToAdd = new Array(),
                inputs = $(that.options.modalHref).find("*[data-cart-qty=true]"),
                attributes = $(that.options.modalHref).find("select.attributeOptions,input.attributeOptions");
            model.isAddToCartEnabled();
            if (!model.AddToCartDisabled) {
                $(inputs).each(function (i, input) {
                    input = $(input);
                    var qty = input.val();
                    if ($.isKendo(input)) {
                        var control = $.getKendoControl(input);
                        qty = control.value();
                    }
                    if ((qty === null || qty === "") && model.isCustomizePart()) {
                        qty = 1;
                    }
                    partsToAdd.push({
                        partId: input.attr("data-part-id"),
                        qty: qty,
                        rank: input.attr("data-part-rank"),
                        part: model.getPart(input.attr("data-part-id")),
                        parentPartId: model.ParentPart.IsAttributeConfigured ? 0 : model.ParentPart.PartId,
                        attributePartId: model.AttributePartId
                    });
                });
                if (partsToAdd.length === 0) {
                    partsToAdd.push({
                        partId: e.data.PartId,
                        qty: 1,
                        rank: 0,
                        part: e.data,
                        attributePartId: model.AttributePartId
                    });
                }
                partsToAdd = $.grep(partsToAdd, function (partToAdd) {
                    return partToAdd.qty != null && !isNaN(partToAdd.qty) && partToAdd.qty !== "" && parseInt(partToAdd.qty) > 0;
                });

                if (attributes.length > 0) {
                    var selectedAttributes = [];
                    var isValid = true;
                    $(attributes).each(function(i, attribute) {
                        attribute = $(attribute);
                        var isRequired = attribute.attr("required") === "required";
                        if (attribute.is("select")) {
                            attribute = attribute.getKendoDropDownList();
                            var option = (attribute.selectedIndex === 0 ? null : attribute.element[0].selectedOptions[0]),
                                attributeId = option != null ? parseAttributeIdFromValueKey(option.value) : null,
                                attributeCost = option != null ? parseAttributeCostFromValueKey(option.value) : null,
                                attributeText = option != null ? option.text : null;
                            if (option != null) {
                                selectedAttributes.push({
                                    AttributeId: attributeId,
                                    Value: attributeCost,
                                    Name: attributeText
                                });
                            } else if (isRequired) {
                                isValid = false;
                            }
                        } else if (attribute.val().trim() != "") {
                            selectedAttributes.push({
                                AttributeId: attribute.attr("data-type-id"),
                                Value: attribute.attr("data-cost"),
                                Name: attribute.val()
                            });
                        } else if (isRequired) {
                            isValid = false;
                        }
                    });
                    if (attributes.length > 0) {
                        $(partsToAdd).each(function(i, item) {
                            item.selectedAttributes = selectedAttributes;
                        });
                    }
                    if (!isValid) {
                        prompt.error("Missing required part configuration options.");
                        return false;
                    }
                }
                sendPartsToCartOrCustomization(partsToAdd, model.ParentPart.PartName, function (e) {
                    $(document).trigger(argosyEvents.PROMPT_NOTIFY, {
                        message: model.ParentPart.PartName + " added to your cart.",
                        type: "success"
                    });
                });
                $.fancybox.close();
            }
        },
        selectButtonClicked: function (e) {
            var selectedPartConfigTypeValue = e.data;
            this.parent().parent().parent().changeSelectedPartConfigTypeValue(selectedPartConfigTypeValue);
        },
        dropDownSelected: function (e) {
            var selectedPartConfigTypeValueId = parseInt($(e.target).find(":selected").attr("data-part-config-type-value-id")),
                selectedPartConfigTypeValue = this.getPartConfigTypeValue(e.data.ConfigTypeValues, selectedPartConfigTypeValueId);
            this.changeSelectedPartConfigTypeValue(selectedPartConfigTypeValue);
        },
        listItemSelected: function (e) {
            var selectedPartConfigTypeValue = e.data;
            this.parent().parent().parent().changeSelectedPartConfigTypeValue(selectedPartConfigTypeValue);
        },
        isOptionVisible: function(data) {
            return !this.isOptionDisabled(data);
        },
        isOptionDisabled: function (data) {
            var partConfigTypePart = data.parent().parent(),
                partConfigTypes = partConfigTypePart.parent(),
                partConfigTypeIndex = 0,
                partSelected = this.CurrentConfiguration;

            $(partConfigTypes).each(function (i, type) {
                if (type.PartConfigTypePartId === partConfigTypePart.PartConfigTypePartId) {
                    partConfigTypeIndex = i;
                }
            });

            var selectedParentConfigs = new Array();

            while (partConfigTypeIndex > 0) {
                partConfigTypeIndex--;
                var parentPartConfigType = partConfigTypes[partConfigTypeIndex];
                var parentPartConfigTypeValue = $.grep(partSelected.ConfigTypeValues, function (value) {
                    return value.PartConfigTypePartId === parentPartConfigType.PartConfigTypePartId;
                })[0];
                selectedParentConfigs.push(parentPartConfigTypeValue);
            }

            var configParts = new Array();
            $(data.ConfigParts).each(function (i, possibleParts) {
                var isMatch = true;
                $(selectedParentConfigs).each(function (e, filterBy) {
                    var matchingConfigTypeValues = $.grep(possibleParts.ConfigTypeValues, function (possibleConfigTypeValue) {
                        return possibleConfigTypeValue.PartConfigTypePartId === filterBy.PartConfigTypePartId &&
                            possibleConfigTypeValue.PartConfigTypeValueId === filterBy.PartConfigTypeValueId;
                    });
                    if (isMatch && matchingConfigTypeValues.length === 0) {
                        isMatch = false;
                    }
                });
                if (isMatch) {
                    configParts.push(this);
                }
            });


            return configParts.length === 0;
        },
        isOptionSelected: function (data) {
            var selectedItem = this.CurrentConfiguration;
            var isSelected = false;
            $(selectedItem.ConfigTypeValues).each(function (i, typeValue) {
                if (!isSelected) {
                    isSelected = typeValue.PartConfigTypeValueId === data.PartConfigTypeValueId;
                }
            });
            return isSelected;
        },
        isDropDownSelected: function (data) {
            return this.isOptionSelected(data) ? "selected" : "";
        },
        isSmallWindow: function (e) {
            return this.getTemplateType() !== "multi";
        },
        isLargeWindow: function (e) {
            return this.getTemplateType() === "multi";
        },
        getPartConfigTypeValue: function (partConfigTypeValues, partConfigTypeValueId) {
            var partConfigTypeValue = null;
            $(partConfigTypeValues).each(function (i, type) {
                if (type.PartConfigTypeValueId == partConfigTypeValueId) {
                    partConfigTypeValue = type;
                }
            });
            return partConfigTypeValue;
        },
        getMatchingConfigParts: function (selectedPartConfigTypeValues) {
            var configParts = new Array();
            $(this.PartConfiguration.ConfigParts).each(function (i, possiblePart) {
                var isMatch = true;
                $(selectedPartConfigTypeValues).each(function (e, filterBy) {
                    var matchingConfigTypeValues = $.grep(possiblePart.ConfigTypeValues, function (possibleConfigTypeValue) {
                        return possibleConfigTypeValue.PartConfigTypePartId === filterBy.PartConfigTypePartId &&
                            possibleConfigTypeValue.PartConfigTypeValueId === filterBy.PartConfigTypeValueId;
                    });
                    if (isMatch && matchingConfigTypeValues.length === 0) {
                        isMatch = false;
                    }
                });
                if (isMatch) {
                    configParts.push(possiblePart);
                }
            });
            return configParts;
        },
        changeSelectedPartConfigTypeValue: function (selectedPartConfigTypeValue) {
            var selectedPartConfigTypeValues = this.getSelectedPartConfigValues(selectedPartConfigTypeValue, true);
            var matchingParts = this.getMatchingConfigParts(selectedPartConfigTypeValues);
            if (matchingParts.length > 0) {
                model.set("CurrentConfiguration", matchingParts[0]);
                model.updateCurrentPart();
                kendo.bind($(that.options.modalHref), model);
            }
        },
        getActivePartForValue: function (partConfigTypeValue) {
            var selectedPartConfigTypeValues = this.getSelectedPartConfigValues(partConfigTypeValue, true),
                matchingParts = this.getMatchingConfigParts(selectedPartConfigTypeValues);
            if (matchingParts.length > 0) {
                return matchingParts[0];
            }
            return null;
        },
        getSelectedPartConfigValues: function (partConfigTypeValue, includeCurrent) {
            var partConfigTypePart = partConfigTypeValue.parent().parent(),
                partConfigTypes = partConfigTypePart.parent(),
                partConfigTypeIndex = 0,
                partSelected = this.CurrentConfiguration;

            $(partConfigTypes).each(function (i, type) {
                if (type.PartConfigTypePartId === partConfigTypePart.PartConfigTypePartId) {
                    partConfigTypeIndex = i;
                }
            });
            var selectedPartConfigTypeValues = new Array();

            while (partConfigTypeIndex > 0) {
                partConfigTypeIndex--;
                var parentPartConfigType = partConfigTypes[partConfigTypeIndex];
                var parentPartConfigTypeValue = $.grep(partSelected.ConfigTypeValues, function (value) {
                    return value.PartConfigTypePartId === parentPartConfigType.PartConfigTypePartId;
                })[0];
                selectedPartConfigTypeValues.push(parentPartConfigTypeValue);
            }
            if (includeCurrent) {
                selectedPartConfigTypeValues.push({
                    PartConfigTypePartId: partConfigTypePart.PartConfigTypePartId,
                    PartConfigTypeValueId: partConfigTypeValue.PartConfigTypeValueId
                });
            }
            return selectedPartConfigTypeValues;
        },
        getPart: function (partId) {
            var part = this.PartCache[partId],
                kendoObj = this;
            if (part == null) {
                $.ajax({
                    url: "/Store/Part/GetPartById/" + partId,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (p) {
                        kendoObj.PartCache[partId] = p;
                        part = p;
                    },
                    async: false
                });
            }
            return part;
        },
        setPart: function (partId, data) {
            var part = this.getPart(partId);
            data.part = new kendo.data.ObservableObject(part);
        },
        updateCurrentPart: function () {
            var part = this.getPart(model.CurrentConfiguration.PartId);
            part.FormatedPrice = kendo.toString(part.Price, "C");
            if (part.AdditionalPartFiles == null) {
                part.AdditionalPartFiles = model.ParentPart.AdditionalPartFiles;
            }
            model.set("ActivePart", new kendo.data.ObservableObject(part));
            var templateType = model.getTemplateType();
            if (templateType != "attribute" && templateType !== "matrix" && templateType !== "single" && !model.PartConfiguration.HasInputType) {
                model.updateQuantity({}, { partId: part.PartId, value: ((part.IsLimitPartOrderQuantity && part.Discounts && part.Discounts.length > 0 && !part.IsEdeliveryOnly) ? 0 : part.DefaultQuantity) });
            }
            if (templateType != "attribute") {
                this.updatePartMinimumQuantity();
            }
        },
        updatePartMinimumQuantity: function () {
            if (model.ParentPart.Options != null && !model.ParentPart.Options.IsEnforceMasterConfig) {
                $(model.PartConfiguration.ConfigTypeParts).each(function (i, item) {
                    item.MinimumQuantity = model.ActivePart.MinOrderQty;
                });
                model.set("PartConfiguration", model.PartConfiguration);
            }
        },
        updateQuantity: function (e, data, dontRunAddToCart) {
            var totalQty = data.value,
                inputs = $(that.options.modalHref).find("*[data-cart-qty=true]");
            dontRunAddToCart = dontRunAddToCart == undefined ? false : dontRunAddToCart;
            $(inputs).each(function (i, input) {
                input = $(input);
                var partId = parseInt(input.attr("data-part-id"));
                var value = input.val();
                if (data.partId !== partId && !isNaN(value) && value != null && value !== "") {
                    totalQty += parseInt(value);
                }
            });
            model.set("CurrentCartQuantity", totalQty);
            if (!dontRunAddToCart) {
                model.isAddToCartEnabled();
            }
        },
        getMinimumQuantityText: function () {
            if (this.isMinQtyVisible()) {
                var type = this.getTemplateType();
                switch (type) {
                case "multi":
                        return "Minimum Quantity of " + this.getMinOrderQty();
                default:
                        return "Total Minimum Quantity of " + this.getMinOrderQty();
                }
            } else {
                return "";
            }
        },
        getSingleViewPartNameHtml: function (partConfig) {
            var parentPartConfig = partConfig.parent().parent();
            if (parentPartConfig.DisplayType === "ImageList") {
                var img = "<img class='img-responsive mwh150' alt='" + partConfig.Value + "' src='" + partConfig.DisplayImage + "' />";
                return img;
            } else if (parentPartConfig.DisplayType === "ButtonList") {
                return "<b>" + partConfig.Value + "</b>";
            } else {
                return "<b>" + partConfig.Value + "</b>";
            }
        },
        onTextBoxChange: function (e) {
            var cost = parseFloat($(e.target).attr("data-cost")),
                value = $(e.target).val(),
                em = $(e.target).closest(".col-md-12").find(".attributeCost");
            if (value != null && value.trim().length > 0 && cost != null && cost != NaN && cost > 0) {
                em.text("+" + kendo.toString(cost, "c"));
            } else {
                em.text("");
            }
        },
        onAttributeChange: function (e) {
            var option = (e.sender.selectedIndex === 0 ? null : e.sender.element[0].selectedOptions[0]),
                attributeId = option != null ? parseAttributeIdFromValueKey(option.value) : null,
                attributeCost = option != null ? parseAttributeCostFromValueKey(option.value) : null,
                attributeText = option != null ? option.text : null,
                em = e.sender.wrapper.closest(".col-md-12").find(".attributeCost");
            if (attributeCost != null && attributeCost != 0) {
                em.text("+" + kendo.toString(attributeCost, "c"));
            } else {
                em.text("");
            }
            $.fancybox.update();
        }
    });
    $(document).bind(argosyEvents.EVENT_PART_INPUT_QTY_CHANGED, function (e, data) {
        model.updateQuantity(e, data);
    });
    if (part.IsAttributeConfigured) {
        that.getPartAttributeConfigurations(part, model);
    } else {
        that.getPartConfigurations(part, model);
    }
};
ModalPartConfiguration.prototype.setupPartAttributeConfigurations = function (part, model) {
    var that = this;
    model.set("PartConfiguration", null);
    model.set("CurrentConfiguration", part);
    model.set("CurrentCartQuantity", 1);
    model.updateCurrentPart();
    if (model.getTemplateType() == "matrix") {
        model.ParentPart.FormatedPrice = kendo.toString(model.ParentPart.MinPrice, "C") + " - " + kendo.toString(model.ParentPart.MaxPrice, "C");
    }
    $(that.options.modalHref).empty();
    $(that.options.modalHref).append(
        kendo.Template.compile($(that.options.partConfigurationWrapper).html())({
            template: model.getTemplateType(),
            selectedPartId: model.ActivePart.PartId,
            hasInputType: false,
            MinimumQuantity: part.MinOrderQty,
            PartAttributes: model.PartAttributes,
            ParentPart: model.ParentPart
        }));
    model.isAddToCartEnabled();
    kendo.bind($(that.options.modalHref), model);
    $.fancybox({
        href: that.options.modalHref,
        type: "inline"
    });
}

ModalPartConfiguration.prototype.getPartAttributeConfigurations = function(part, model) {
    var that = this;
    model.set("AttributePartId", part.PartId);
    $.ajax({
        url: "/Store/Part/GetPartAttributeConfiguration/" + part.PartId,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (attributeGroups) {
            if (attributeGroups == null || attributeGroups.length == 0) {
                that.getPartConfigurations(part, model);
            } else {
                model.set("PartAttributes", attributeGroups);
                $.each(attributeGroups, function (i, group) {
                    model.set("Attributes_" + group.Id, group.Attributes);
                });
                if (part.IsConfigurable) {
                    that.getPartConfigurations(part, model);
                } else {
                    that.setupPartAttributeConfigurations(part, model);
                }
            }
        }
    });
};

ModalPartConfiguration.prototype.getPartConfigurations = function (part, model) {
    var that = this;
    $.ajax({
        url: "/Store/Part/GetPartConfiguration/" + part.PartId,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (config) {
            if (config.ConfigTypeParts.length > 0) {
                $(config.ConfigTypeParts).each(function (i, item) {
                    item.MinimumQuantity = part.MinOrderQty;
                });
                model.set("PartConfiguration", config);
                model.set("CurrentConfiguration", config.CurrentPart);
                model.updateCurrentPart();
                if (model.getTemplateType() == "matrix"){
                    model.ParentPart.FormatedPrice = kendo.toString(model.ParentPart.MinPrice, "C") + " - " + kendo.toString(model.ParentPart.MaxPrice, "C");
                }
                $(that.options.modalHref).empty();
                $(that.options.modalHref).append(
                    kendo.Template.compile($(that.options.partConfigurationWrapper).html())({
                        template: model.getTemplateType(),
                        selectedPartId: model.ActivePart.PartId,
                        hasInputType: config.HasInputType,
                        MinimumQuantity: part.MinOrderQty,
                        PartAttributes: model.PartAttributes,
                        ParentPart: model.ParentPart
                    }));
                model.isAddToCartEnabled();
                kendo.bind($(that.options.modalHref), model);
                $.fancybox({
                    href: that.options.modalHref,
                    type: "inline"
                });
            } else {
                that.setupPartAttributeConfigurations(part, model);
            }
        }
    });
};

ModalPartConfiguration.prototype.parseMatrixConfigurations = function (configurationTypes) {
    var that = this;
    var obj = {
        configurations: configurationTypes
    };
    return obj;
};
