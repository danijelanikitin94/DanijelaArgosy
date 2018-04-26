(function ($) {
    //todo: add qr code support and image editor support neither work right now
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var ProofingVariables = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            // initialize or create dataSource
            // load the proofing control templates.
            $.get(that.options.templatePath, function (template) {
                $(document.body).append(template);
                that._dataSource();
                that._setupBindingModel();
                that._initialize();
                that._setupEvents();
            });
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "ProofingVariables",
            templatePath: "/scripts/controls/templates/proofingVariables.html",
            proofText: "~{Proof}~",
            actionText: "~{Build}~",
            title: "~{PersonalizeInformation}~",
            personalizeMessage: "~{EnterInformationToPersonalizeItems}~",
            fancybox: {
                showAfterEdit: false,
                fancyBoxHref: null
            },
            profileCount: 0,
            templates: {
                controls: {
                    qrCode: "#_ProofingVariableQrCodeControl",
                    imageBankListView: "#_ProofingVariableImageBankListControl",
                    imageBankOrUpload: "#_ProofingVariableImageBankOrUpload",
                    map: "#_ProofingVariableMapControl",
                    textArea: "#_ProofingVariableTextAreaControl",
                    prePopulate: "#_ProofingVariablePrePopulateControl",
                    dateTime: "#_ProofingVariableDateTimeControl",
                    textBox: "#_ProofingVariableTextBoxControl",
                    sku: "#_ProofingVariableSkuControl",
                    imageBank: "#_ProofingVariableImageBankControl",
                    dropDownText: "#_ProofingVariableDropDownTextControl",
                    imageUpload: "#_ProofingVariableImageUploadControl",
                    dropDownList: "#_ProofingVariableDropDownListControl",
                },
                variableWrapperTemplate: "#_ProofingPersonalizeTemplate",
                variableControlTemplate: "#_ProofingVariableControlTemplate",
                variableNonGroupedTemplate: "#_ProofingNonGroupedVariables"
            }
        },
        // for supporting changing the datasource via MVVM
        setDataSource: function (dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },
        _dataSource: function () {
            var that = this;
            that.dataSource = that.options.dataSource == null ? {} : that.options.dataSource;
            that.dataSource.proofText = that.options.proofText;
            that.dataSource.actionText = that.options.actionText;
            that.dataSource.title = that.options.title;
            that.dataSource.personalizeMessage = that.options.personalizeMessage;
        },
        _controlTypes: {
            qrCode: "qrcode",
            imageBankListView: "imagebanklistview",
            imageBankOrUpload: "imagebankorupload",
            map: "map",
            textArea: "textarea",
            prePopulate: "prepopulate",
            dateTime: "datetime",
            textBox: "textbox",
            sku: "sku",
            imageBank: "imagebank",
            dropDownText: "dropdowntext",
            imageUpload: "imageupload",
            dropDownList: "dropdownlist",
            multiselect: "multiselect"
        },
        isValid: function() {
            var that = this,
                valid = true,
                variables = that.getVariables(true);
            $(variables).each(function (i) {
                if (this.Required && this.Value.trim().length == 0) {
                    valid = false;
                    if ($.isKendo(this.Element)) {
                        $.getKendoControl(this.Element).wrapper.addClass("input-validation-error");
                    } else {
                        this.Element.addClass("input-validation-error");
                    }
                } else {
                    if ($.isKendo(this.Element)) {
                        $.getKendoControl(this.Element).wrapper.removeClass("input-validation-error");
                    } else {
                        this.Element.removeClass("input-validation-error");
                    }
                }
            });
            return valid;
        },
        getVariables: function (includeRequired) {
            var that = this,
                prefix = "var_",
                argosyType = "data-argosy-proofing",
                element = that.element;
            var variables = $(element).find("*[" + argosyType + "]");
            var variableObject = [];
            $(variables).each(function (i) {
                var propertyName = $(this).attr(argosyType).replace(prefix, ""),
                    isProofName = $(this).data("isProofName"),
                    item = { Name: propertyName, Value: "", IsProofName: isProofName, InstanceName: $(this).attr("data-instance-name") };
                if ($.isKendo($(this))) {
                    var kendoControl = $.getKendoControl($(this));
                    var dataValueField = kendoControl.element.attr("data-text-value");
                    if (dataValueField == null || dataValueField == "") {
                        item.Value = kendoControl.value();
                        if (this.attributes["data-format"] != null && item.Value != null && item.Value != "") {
                            item.Value = kendo.toString(item.Value, this.attributes["data-format"].value);
                        }
                    } else {
                        var selectedIndex = kendoControl.selectedIndex;
                        var naturalValue = kendoControl.value();
                        if (selectedIndex != null && selectedIndex > -1) {
                            var dataItem = kendoControl.dataItem(selectedIndex);
                            if (dataItem != null) {
                                item.Value = kendoControl.dataItem(selectedIndex)[dataValueField];
                            }
                        } else if ($.type(naturalValue) == "string" || $.type(naturalValue) == "number") {
                            item.Value = naturalValue;
                        } else if ($.type(naturalValue) == "array") {
                            var data = [];
                            $.each(naturalValue,function(i, item) {
                                data.push(item.Value)
                            });
                            item.Value = data.join();
                        }
                    }
                    if (item.Value == null) {
                        item.Value = "";
                    }
                    if ($.type(item.Value) == "date") {
                        item.Value = kendo.toString(item.Value, "d");
                    }
                    if ($.type(item.Value) == "array") {
                        item.Value = item.Value.join();
                    }
                } else {
                    item.Value = $(this).val();
                }
                if (includeRequired) {
                    item.Required = ($(this).attr("required") != null);
                    item.Element = $(this);
                }
                if ($(this).attr("data-is-upload") != null) {
                    item.IsUpload = $(this).attr("data-is-upload");
                } else {
                    item.IsUpload = false;
                }
                if ($(this).attr("data-variable-id") != null) {
                    item.Id = $(this).attr("data-variable-id");
                }
                if ($(this).attr("data-control-type") != null) {
                    item.ControlType = $(this).attr("data-control-type");
                }
                if ($(this).attr("data-display-name") != null) {
                    item.DisplayName = $(this).attr("data-display-name");
                }
                if ($(this).attr("data-name") != null) {
                    item.Name = $(this).attr("data-name");
                }
                if (item.Name != null && item.Name.trim().length > 0) {
                    variableObject.push(item);
                }
            });
            return variableObject;
        },
        setVariables: function(variables) {
            
        },
        _setupEvents: function () {
            var that = this;
            var buildProofButton = that.element.find(".btn-buildproof");
            buildProofButton.unbind("click");
            buildProofButton.click(function (e) {
                $(document).trigger(argosyEvents.EVENT_BUILD_PROOF,
                {
                    variables: that.getVariables(),
                    isValid: that.isValid(),
                    part: that.dataSource.Part
                });
            });

            $(document).bind(argosyEvents.EVENT_REGENERATE_VARIABLES, function(e, data) {
                buildProofButton.click();
            });
            // force the datepicker text box to be uneditable
            $("[data-role=datepicker]").keypress(function (e) { return false; });
            $("[data-role=datepicker]").focus(function (e) {
                $(e.target).getKendoDatePicker().open();
            });
        },
        _initialize: function () {
            var that = this;
            // template blows up without this.
            if (that.dataSource.GlobalProfilesForBundle == undefined) {
                that.dataSource.GlobalProfilesForBundle = [];
            }
            that.element.append(kendo.Template.compile($(that.options.templates.variableWrapperTemplate).html())(that.dataSource));
            kendo.bind($(that.element), that._bindingModel);
            var globalProfiles = new kendo.data.ObservableObject({
                globalProfiles: that.dataSource.GlobalProfiles,
                globalProfile: null,
                globalProfileChange: function (e) {
                    block(null, "~{MsgLoadingProfile}~");
                    var inputs = $("*[data-argosy-proofing^='var_'][data-instance-name='" + $(e.sender)[0].element.attr("data-instance-name") + "']");
                    _.forEach(inputs,
                        function (input) {
                            input = $(input);
                            var imageEditor = input.data("kendoImageEditor");
                            if (imageEditor != null) {
                                imageEditor.value("");
                            } 
                        }
                    );

                    var vm = this;
                    if ($(e.sender)[0].element.val() != -1) {
                        $.ajax({
                            url: "/Store/Proofing/GetGlobalProfileVariablesForBundle",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            data: {
                                globalFormsProfileId: $(e.sender)[0].element.val(),
                                instanceName: $(e.sender)[0].element.attr("data-instance-name"),
                                partId: that.dataSource.Part.PartId
                            },
                            success: function (response) {
                                if (response.Records != null) {
                                    vm.updateVariables(response.Records, $(e.sender)[0].element.attr("data-instance-name"));
                                };
                            },
                            complete: function (response) {
                                that.options.profileCount--;
                                if (that.options.profileCount <= 0) {
                                    unblock();
                                }
                            }
                        });
                    }
                    else {
                        unblock();
                        var inputs = $("*[data-argosy-proofing^='var_'][data-instance-name='" + $(e.sender)[0].element.attr("data-instance-name") + "']");
                        _.forEach(inputs,
                            function (input) {
                                input = $(input);
                                var maskedTextBox = input.data("kendoMaskedTextBox"),
                                    imageEditor = input.data("kendoImageEditor")
                                    dropDownList = input.data("kendoDropDownList");
                                if (maskedTextBox != null) {
                                    maskedTextBox.value("");
                                } else if (imageEditor != null) {
                                    imageEditor.value("");
                                } else if (dropDownList != null) {
                                    dropDownList.select(input.attr("data-option-label"));
                                } else {
                                    if (input.attr("data-control-type") == "TEXTAREA") {
                                        input.val("");
                                    } else {
                                        input.attr("value", "");
                                    }
                                };
                        });
                    }
                },
                updateVariables: function (variables, instanceName) {
                    var inputs = $("*[data-argosy-proofing^='var_'][data-instance-name='" + instanceName + "']");
                    _.forEach(inputs,
                        function (input) {
                            input = $(input);
                            var variableId = input.data("variableId"),
                                record = variables[variableId];
                            if (record != null) {
                                var maskedTextBox = input.data("kendoMaskedTextBox"),
                                    imageEditor = input.data("kendoImageEditor")
                                    dropDownList = input.data("kendoDropDownList");
                                if (maskedTextBox != null) {
                                    maskedTextBox.value(record);
                                } else if (imageEditor != null) {
                                    var value = input.data("defaultValue"),
                                        index = value.lastIndexOf("/");
                                    record = value.substring(0, index + 1) + record;
                                    imageEditor.value(record);
                                } else if (dropDownList != null) {
                                    dropDownList.search(record);
                                } else {
                                    if (input.attr("data-control-type") == "TEXTAREA") {
                                        input.val(record);
                                    } else if (input.attr("data-control-type") == "CALENDAR") {
                                        if ($.isKendo(input)) {
                                            $(input).data("kendoDatePicker").value(new Date(record).toLocaleDateString("en-us"));
                                        } else {
                                            input.val(new Date(record).toLocaleDateString("en-us"));
                                        }
                                    } else {
                                        input.val(record);
                                    }
                                };
                                input.data("defaultValue", record);
                            };
                        });;
                }
            });
            kendo.bind($("div[data-id='profiles']"), globalProfiles);
            setTimeout(function (e) {
                $.each($("select[data-control-type=MultiSelectText]"), function (i, element) {
                    element = $(element);
                    element.kendoMultiSelect({
                        noDataTemplate: $("#_proofingVariableAddText").html(),
                        optionPlaceholder: "Enter values...",
                        dataTextField: "text",
                        dataValueField: "value",
                        filtering: function(e) {
                            var data = e.filter.value;
                            var dataSource = e.sender.dataSource;
                            dataSource._data = [];
                            dataSource.add({
                                value: data,
                                text: data
                            });
                        }
                    });
                });
            }, 500);
            var counter = 1;
            $("select[data-argosy-action=select-proofing-profile]").each(function (count, element) {
                that.options.profileCount++;
                var ddl = $(element).getKendoDropDownList();
                var index = 0;
                ddl.select(function (data) {
                    if (data.value !== "-1"  && counter === index) {
                        counter++;
                        return true;
                    }
                    else {
                        index++;
                    }
                });
                ddl.trigger("change");
            });
        },
        _bindingModel: null,
        _setupBindingModel: function () {
            var that = this;
            if (that.options.dataSource == null) {
                that.options.dataSource = {
                    DesignTemplates: [],
                    GlobalProfiles: [],
                    Part: null,
                    Profiles: [],
                    VariableGroupos: [],
                    Variables: []
                }
            }
            that.options.dataSource.Templates = that.options.templates;
            that.options.dataSource.FancyBox = that.options.fancybox;
            that._bindingModel = {
                data: that.options.dataSource,
                onVariableUpdate: function (e) {
                    var model = this,
                        kendo = e.currentTarget == null;
                        element = !kendo ? $(e.currentTarget) : $(e.sender.element),
                        value = !kendo ? element.val() : e.sender.value(),
                        hiddenBys = that.element.find("*[data-hidden-by*='" + element.attr("data-variable-name") + "']");

                    $.each(hiddenBys, function (e, hiddenBy) {
                        hiddenBy = $(hiddenBy);
                        model.set("disable" + hiddenBy.attr("data-variable-id"), value != null && value.length > 0)
                    });
                },
                showGenerateQrCode: function (e) {
                    $.fancybox({
                        href: that.options.proofingQrCodeGenerationModal,
                        autoSize: true,
                        scrolling: "no",
                        modal: true,
                        afterLoad: function (afterLoadEvent) {
                            kendo.bind($(that.options.proofingQrCodeGenerationModal), kendo.observable({
                                onDropDownListDataBound: function (e) {
                                    var defaultValue = e.sender.element.attr("data-value");
                                    e.sender.select(function (item) {
                                        return item.name === defaultValue;
                                    });
                                },
                                onCancelQRCode: function (onCancelQRCodeEvent) {
                                    var originalInput = $(e.sender.element[0]);
                                    $("#qr_code_save").getKendoButton().enable(false);
                                    if (originalInput.attr("data-show-fancybox-after-edit") == "true") {
                                        $.fancybox({
                                            href: "#" + originalInput.attr("data-fancybox-after-edit-href")
                                        });
                                    }
                                },
                                onRemoveQRCode: function (onRemoveQRCodeEvent) {
                                    var originalInput = $(e.sender.element[0]);
                                    $("#" + originalInput.attr("data-hidden-field-id")).val("");
                                    originalInput.text("Add QR Code");
                                    $("#qr_code_remove").getKendoButton().enable(false);
                                    $("#qr_code_save").getKendoButton().enable(false);
                                    $(that.options.proofingQrCodeGenerationModal).find("img").attr("src", "/noimagefound.png?w=300&h=300");
                                    if (originalInput.attr("data-show-fancybox-after-edit") == "true") {
                                        $.fancybox({
                                            href: "#" + originalInput.attr("data-fancybox-after-edit-href")
                                        });
                                    }
                                },
                                onSaveQRCode: function (onSaveQRCodeEvent) {
                                    var originalInput = $(e.sender.element[0]);
                                    $("#" + originalInput.attr("data-hidden-field-id")).val($(that.options.proofingQrCodeGenerationModal).find("#qr_final_url").val());
                                    originalInput.text("Edit QR Code");
                                    $("#qr_code_save").getKendoButton().enable(false);
                                    if (originalInput.attr("data-show-fancybox-after-edit") == "true") {
                                        $.fancybox({
                                            href: "#" + originalInput.attr("data-fancybox-after-edit-href")
                                        });
                                    }
                                },
                                onGenerateQRCode: function (onGenerateQRCodeEvent) {
                                    if (that.isValidVariables(that.options.proofingQrCodeGenerationModal, "qr_", "data-argosy-qrcode")) {
                                        var variableObject = that.getVariables(false, that.options.proofingQrCodeGenerationModal, "qr_", "data-argosy-qrcode");
                                        $(document).trigger(argosyEvents.START_LOADING, { name: "QrCode" });
                                        $.ajax({
                                            url: "/Store/Proofing/GenerateQrCode/",
                                            dataType: "json",
                                            method: "POST",
                                            data: {
                                                variables: JSON.stringify(variableObject)
                                            },
                                            success: function (result) {
                                                $(document).trigger(argosyEvents.END_LOADING, { name: "QrCode" });
                                                if (result.ReturnCode == ReturnCode.Success) {
                                                    $(that.options.proofingQrCodeGenerationModal).find("img").attr("src", result.Records.Url + "?w=300&h=300");
                                                    $(that.options.proofingQrCodeGenerationModal).find("#qr_final_url").val(result.Records.Url);
                                                    $("#qr_code_remove").getKendoButton().enable(true);
                                                    $("#qr_code_save").getKendoButton().enable(true);
                                                } else {
                                                    prompt.alert({
                                                        question: result.Message,
                                                        description: "Ref: " + result.Guid,
                                                        type: "warning",
                                                        yes: function (e) {
                                                            $.fancybox({
                                                                href: that.options.proofingQrCodeGenerationModal,
                                                                autoSize: true,
                                                                scrolling: "no"
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        prompt.alert({
                                            question: "You are missing required fields to generate this QR Code.",
                                            description: "Please update the form and continue.",
                                            type: "warning",
                                            yes: function (e) {
                                                $.fancybox({
                                                    href: that.options.proofingQrCodeGenerationModal,
                                                    autoSize: true,
                                                    scrolling: "no"
                                                });
                                            }
                                        });
                                    }
                                },
                                qrTypes: [{ name: 'Contact' }, { name: 'Email' }, { name: 'Phone' }, { name: 'Website' }],
                                qrColors: [{ name: 'Black', value: 'Black' }, { name: 'Deep Sky Blue', value: 'DeepSkyBlue' }, { name: 'Red' }, { name: 'Green', value: 'Green' }, { name: 'Red', value: 'Red' }],
                                qrStates: [{ name: 'AA' }, { name: 'AE' }, { name: 'AK' }, { name: 'AL' }, { name: 'AP' }, { name: 'AR' }, { name: 'AS' }, { name: 'AZ' }, { name: 'CA' }, { name: 'CO' }, { name: 'CT' }, { name: 'DC' }, { name: 'DE' }, { name: 'FL' }, { name: 'FM' }, { name: 'GA' }, { name: 'GU' }, { name: 'HI' }, { name: 'IA' }, { name: 'ID' }, { name: 'IL' }, { name: 'IN' }, { name: 'KS' }, { name: 'KY' }, { name: 'LA' }, { name: 'MA' }, { name: 'MD' }, { name: 'ME' }, { name: 'MH' }, { name: 'MI' }, { name: 'MN' }, { name: 'MO' }, { name: 'MP' }, { name: 'MS' }, { name: 'MT' }, { name: 'NA' }, { name: 'NC' }, { name: 'ND' }, { name: 'NE' }, { name: 'NH' }, { name: 'NJ' }, { name: 'NM' }, { name: 'NV' }, { name: 'NY' }, { name: 'OH' }, { name: 'OK' }, { name: 'OR' }, { name: 'PA' }, { name: 'PR' }, { name: 'PW' }, { name: 'RI' }, { name: 'SC' }, { name: 'SD' }, { name: 'TN' }, { name: 'TX' }, { name: 'UT' }, { name: 'VA' }, { name: 'VI' }, { name: 'VT' }, { name: 'WA' }, { name: 'WI' }, { name: 'WV' }, { name: 'WY' }],
                            }));
                        }
                    });
                },
                onProofingPrePopChange: function (e) {
                    var selectedItem = e.sender.dataItem(e.sender.select());
                    var variables = selectedItem.Variables;
                    var clearValue = false;
                    if (variables == null) {
                        variables = e.sender.dataItem(1).Variables;
                        clearValue = true;
                    }
                    if (variables != null && variables.length > 0) {
                        $(variables).each(function (i) {
                            var input = $("#var_" + this.Key);
                            input.val(clearValue ? "" : this.Value);
                        });
                    }
                },
                onDropDownListDataBound: function (e) {
                    var defaultValue = e.sender.element.attr("data-value");
                    e.sender.select(function (item) {
                        return item.Value === defaultValue;
                    });
                },
                onComboBoxDataBound: function (e) {
                    //debugger;
                    //var defaultValue = e.sender.element.attr("data-value");
                    //e.sender.value(defaultValue);
                },
                onProofingImageBankListOpen: function (e) {
                    if ($(that.options.proofingImageBankListView)) {
                        $(that.options.proofingImageBankListView).remove();
                    }
                    var currentData = JSON.stringify(e.sender.dataSource.data());
                    var controlType = $(e.sender.element[0]).attr("data-control-type");
                    var html = $(that.options.proofingImageBankListViewModalTemplate).html();
                    var kendoTemplate = kendo.template(html);
                    var result = kendoTemplate(currentData);
                    $(that.options.proofingModalWrapper).append(result);
                    kendo.bind($(that.options.proofingImageBankListView));
                    var ddl = $(e.sender.element).getKendoDropDownList();
                    var listView = $(that.options.proofingImageBankListView).find("div[data-role=listview]").getKendoListView();
                    listView.bind("change", function (ev) {
                        var val = listView.dataItem(listView.select());
                        if (val != null) {
                            ddl.value(val.Rule);
                        }
                    });
                    $.fancybox({
                        href: that.options.proofingImageBankListView,
                        afterClose: function (e) {
                            //ddl.value()
                            setTimeout(function (e) {
                                $.fancybox({
                                    href: that.options.proofingCustomizationView
                                });
                            });
                        },
                        afterLoad: function (e) {
                            kendo.bind($(that.options.proofingImageBankListView));
                        }
                    });
                    e.preventDefault();
                }
            };

            $(that.dataSource.Variables).each(function (e) {
                that._bindingModel["var_" + this.Id + "_DataSourceJson"] = eval(this.DataSourceJson);
                that._bindingModel["var_" + this.Id + "_VariableOptionsJson"] = eval(this.VariableOptionsJson);
                that._bindingModel["disable" + this.Id] = false;
                if (this.TooltipText != null) {
                    var tooltip = $("#tooltip_" + this.Id);
                    tooltip.kendoTooltip({
                        content: this.TooltipText,
                        position: "top"
                    });
                };
            });
        }
    });
    ui.plugin(ProofingVariables);
})(jQuery);