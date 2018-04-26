(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var usersAutoComplete = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            that._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "usersAutoComplete",
            bindingGroup: "",
            dataSource: {},
            initialized: false,
            disabled: false,
            userId: 0,
            inputId: "",
            companyId: 0,
            siteId: 0,
            userGroupId: 0
        },
        value: function (data) {
            var that = this;
            if (data == null) {
                if (that._hiddenInput) {
                    return that._hiddenInput.val();
                }
            } else {
                that._hiddenInput.val(data.UserId);
                that._autoComplete.value(data.FullName);
            }
        },
        _initialize: function () {
            var that = this;
            that.element.append(that._createHiddenInput());
            that._hiddenInput = that.element.find("input[type=hidden]");
            that.element.append($("<input id='userCompleteInput' data-role='autocomplete' />"));
            that.element.find("input[data-role=autocomplete]").kendoAutoComplete({
                dataTextField: "FullName",
                dataSource: that._getDataSource({}),
                enable: that.options.disabled !== "disabled",
                change: function () {
                    var user = this.dataItem();
                    that.value(user);
                    $(document).trigger(argosyEvents.EVENT_AUTOCOMPLETE_USER_SELECTED, { user: user });
                }
            });
            that._autoComplete = that.element.find("input[data-role=autocomplete]").getKendoAutoComplete();

        },
        _createHiddenInput: function () {
            var that = this;
            var inputId = that.options.inputId;
            if (that.options.bindingGroup != null && that.options.bindingGroup !== "") {
                inputId = that.options.bindingGroup + "_" + inputId;
            }
            var input = $("<input />", {
                type: "hidden",
                id: inputId,
                name: inputId.replace(/_/g, "."),
                value: that.options.userId
            });
            return input;
        },
        _getDataSource: function () {
            var that = this;
            $.extend(true, that.options.dataSource, _defaultDataSourceConfig);
            that.options.dataSource.transport = {
                read: function (options) {
                    var search = {
                        UserGroup: that.options.userGroupId,
                        CompanyId: that.options.companyId,
                        SiteId: that.options.siteId,
                        RecordSizeCategory: that.options.recordSizeCategory
                    };
                    $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
                    $.ajax({
                        url: "/DataView/GetUsers",
                        dataType: "json",
                        data: search,
                        success: function (result) {
                            if (result.ReturnCode === ReturnCode.Failed) {
                                handleDataSourceException(result.Records);
                            } else {
                                options.success(result.Records);
                            }
                        }
                    });
                }
            };
            that.options.dataSource.schema = {
                total: function (response) {
                    return response.length;
                }
            }
            that.options.dataSource.pageSize = 20;
            that.options.dataSource.serverFiltering = true;
            return new kendo.data.DataSource(that.options.dataSource);
        }
    });
    ui.plugin(usersAutoComplete);
})(jQuery);