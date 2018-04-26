(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var Countries = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            getCountryStateMap();
            if (countryStateMap == null) {
                $(document).one(argosyEvents.EVENT_COUNTRY_STATE_MAP_LOADED, function (e) {
                    that._initialize();
                });
            } else {
                that._initialize();
            }
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "Countries",
            countryId: null,
            bindingGroup: "",
            dataSource: {},
            searchCriteria: {},
            stateId: null,
            inputId: "",
            needToClearState: false,
            disabled: false
        },
        findCountryFromStateCode: function (stateCode) {
            var that = this;
            if (countryStateMap !== null) {
                var found = null;
                $(countryStateMap)
                    .each(function (index, item) {
                        if (item.Regions !== null && item.Regions.length > 0) {
                            var result = $.grep(item.Regions, function (e) { return e.Code.toLowerCase() === stateCode });
                            if (result.length > 0) {
                                found = result[0];
                                return false;
                            }
                        }
                    });
                if (found) {
                    that.value(found.CountryId, found.Id);
                    that._dropDownList.dataSource.read();
                    that._dropDownList.refresh();
                }
            }
        },
        value: function (data, stateId) {
            var that = this;
            that.options.stateId = stateId;
            if (data == null) {
                return that._hiddenInput.val();
            } else {
                that._hiddenInput.val(data);
                that._dropDownList.value(data);
                var sendData = {
                    bindingGroup: that.options.bindingGroup,
                    value: data,
                    stateId: that.options.stateId
                };
                $(document).trigger(argosyEvents.COUNTRY_CHANGE, sendData);
            }
        },
        _initialize: function () {
            var that = this;
            that.element.append(that._createHiddenInput());
            that._hiddenInput = that.element.find("input[type=hidden]");
            that.element.append(that._createDropDownList());
            that.element.find("select").kendoDropDownList({
                //serverPaging: false,
                autoBind: true,
                //filter: "contains",
                //serverSorting: false,
                dataTextField: "Name",
                dataValueField: "Id",
                optionLabel: "-- ~{SelectCountry}~ --",
                dataSource: that._getDataSource({}),
                cascade: function (e) {
					var result = e.sender.value();
                    var data = {
                        bindingGroup: that.options.bindingGroup,
                        value: result,
                        stateId: that.options.stateId
                    };
					that._hiddenInput.val(result);
                    that.options.stateId = null;
                    $(document).trigger(argosyEvents.COUNTRY_CHANGE, data);
                },
                value: that.options.countryId,
                enable: that.options.disabled != "disabled"
            });
            that._dropDownList = that.element.find("select").getKendoDropDownList();
        },
        _createHiddenInput: function () {
            var that = this;
            var input = $("<input />", {
                type: "hidden",
                id: that.options.inputId,
                name: that.options.inputId.replace('_', '.')
            });
            return input;
        },
        _createDropDownList: function () {
            var that = this;
            var input = $("<select data-role='dropdownlist' />");
            return input;
        },
        _getDataSource: function () {
            var that = this;
            $.extend(true, that.options.dataSource, _defaultDataSourceConfig);
            that.options.dataSource.transport = {
                read: function (options) {
                    options.success(countryStateMap);
                }
            };
            that.options.dataSource.schema = {
                total: function (response) {
                    return response.length;
                }
            }
            that.options.dataSource.pageSize = 99999;
            that.options.dataSource.serverFiltering = true;
            return new kendo.data.DataSource(that.options.dataSource);
        }
    });
    ui.plugin(Countries);
})(jQuery);