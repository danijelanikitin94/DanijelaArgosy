(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var GlobalProfileDropDown = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            // this is a hack because the array wasn't replacing all the items in the defaults.
            if (options.variableNameMap !== null) {
                that.options.variableNameMap = options.variableNameMap;
            }
            if (options.categoryName !== null) {
                that.options.categoryName = options.categoryName;
            }
            var controlLoader = new ControlLoader();
            controlLoader.loadTemplate("GlobalProfileDropDown",
                function (template) {
                    $(document.body).append(template);
                    that._initialize();
                });
        },
        options: {
            name: "GlobalProfileDropDown",
            errorSpanId:"#_GlobalProfileDropDownErrorSpan",
            required: false,
            companyId: 0,
            globalFormsId: 0,
            validationMsg: "",
            category: "",
            label: "",
            variableNameMap: [
            ],
            templates: {
                contentHref: "#_GlobalProfileDropDownTemplate",
                bindSection: "#_GlobalProfileDropDownBindSection"
            }
        },
        validate: function () {
            var that = this,
                model = that.viewModel,
                errorSpan = $(that.options.errorSpanId),
                msg = that.options.validationMsg;
            if (msg.length <= 0) {
                msg = that.options.label + " is required.";
            }
            if (model.profileHasbeenSelected === true) {
                errorSpan.removeClass("field-validation-error").addClass("field-validation-valid");
                errorSpan.empty();
            } else {
                errorSpan.removeClass("field-validation-valid").addClass("field-validation-error").append("<span>"+msg+"</span>");
            }
            
            return model.profileHasbeenSelected;
        },
        viewModel: null,
        _initialize: function () {
            var that = this;
                
            that.viewModel = new kendo.observable({
                selectedProfile: null,
                selectedProfileId: 0,
                variableNameMap: that.options.variableNameMap,
                profileHasbeenSelected: false,
                onGlobalProfileChange: function (e) {
                    var kendoObj = this;
                    $(document).trigger(argosyEvents.START_LOADING, { element: $("._showLoadingOnMe"), message: "Loading..." });
                    if (e.sender !== null) {
                        var dataItem = e.sender.dataItem();
                        if (dataItem) {
                            var globalProfileId = dataItem.Id;
                            this.set("selectedProfileId", globalProfileId);
                            var search = {
                                globalFormsId: that.options.globalFormsId,
                                globalFormsProfileId: globalProfileId,
                                category: that.options.category
                            };
                            $.ajax({
                                url: "/DataView/GetGlobalFormsStructAndData",
                                dataType: "json",
                                data: search,
                                success: function (result) {
                                    if (result.ReturnCode === ReturnCode.Failed) {
                                        $(document)
                                            .trigger(argosyEvents.END_LOADING,
                                                { element: $("._showLoadingOnMe") });
                                        handleDataSourceException(result);
                                    } else {
                                        kendoObj.updateUI(result);
                                        kendoObj.set("profileHasbeenSelected", true);
                                        var errorSpan = $(that.options.errorSpanId);
                                        errorSpan.removeClass("field-validation-error").addClass("field-validation-valid");
                                        errorSpan.empty();
                                        $(document)
                                            .trigger(argosyEvents.END_LOADING,
                                                { element: $("._showLoadingOnMe") });
                                    }
                                }
                            });
                        } else {
                            $(document).trigger(argosyEvents.END_LOADING,
                                     { element: $("._showLoadingOnMe") });
                        }
                    }
                },
                updateUI: function (data) {
                    if (data.TotalRecords > 0) {
                        var mapping = that.options.variableNameMap;
                        $(data.Records).each(function (i, item) {
                            var name = item.StructName.toLowerCase(),
                                result = $.grep(mapping, function (e) { return e.Name.toLowerCase() === name });

                            if (result.length > 0) {
                                var map = result[0];
                                if (map.hasOwnProperty("getValueFrom")) {
                                    setInputValue(map.Selector, item[map.getValueFrom]);
                                } else {
                                    setInputValue(map.Selector, item.Value);
                                }

                            }
                        });
                    }
                },
                globalProfiles: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: {
                            url: "/DataView/GetGlobalFormProfiles",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST",
                        },
                        parameterMap: function (options, operation) {
                            var data = {};
                            data.Keyword = $("input[data-role='autocomplete']").val();
                            data.GlobalFormsId = that.options.globalFormsId;
                            data.CompanyId = that.options.companyId;
                            data.IsGlobalFormsProfileActive = true;
                            data.Take = 15;
                            return JSON.stringify(data);
                        },

                    },
                    schema: {
                        data: "Records",
                        total: "TotalRecords",
                    }
                })
            });
            that.element.append(that._buildContent());
            kendo.bind($(that.options.templates.bindSection), that.viewModel);

        },
        _buildContent: function () {
            var that = this;
            var html = $(that.options.templates.contentHref).html();
            var data = {
                label: that.options.label,
                required: that.options.required
            }
            return kendo.Template.compile(html)(data);
        }
    });
    ui.plugin(GlobalProfileDropDown);
})(jQuery);