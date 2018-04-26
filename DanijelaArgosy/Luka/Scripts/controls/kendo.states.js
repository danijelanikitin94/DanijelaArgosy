(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var States = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this._setupEvents();
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
            name: "States",
            countryId: 0,
            stateId: 0,
            bindingGroup: "",
            dataSource: {},
            inputId: "",
            initialized: false,
            disabled: false
        },
        value: function (data) {
            var that = this;
            if (data == null) {
                if (that._hiddenInput) {
                    return that._hiddenInput.val();
                }
            } else {
                if (!$.isNumeric(data)) {
                    var options = $.grep(that._dropDownList._data(), function (state) {
                        return state.Code == data || state.Name == data;
                    });
                    if (options.length > 0) {
                        data = options[0].Id;
                    }
                }
                that._hiddenInput.val(data);
                that._dropDownList.value(data);
            }
        },
        _setupEvents: function () {
            var that = this;
			$(document).bind(argosyEvents.COUNTRY_CHANGE, function (e, data) {
				if (that._dropDownList != undefined) {
					if (that.options.bindingGroup === data.bindingGroup) {
						if (that.options.countryId !== data.value) {
							that.options.countryId = data.value;
							if (data.stateId != null) {
                                that.options.stateId = data.stateId;
                            } else {
							    data.stateId = 0;
                            }
							that._dropDownList.dataSource.read();
							that._dropDownList.refresh();
						}
						that.value(data.stateId);
					}
				}
            });
        },
        _initialize: function () {
            var that = this;
            that.element.append(that._createHiddenInput());
            that._hiddenInput = that.element.find("input[type=hidden]");
            that.element.append(that._createDropDownList());
            that.element.find("select").kendoDropDownList({
                autoBind: true,
                dataTextField: "Name",
                dataValueField: "Id",
                optionLabel: "-- ~{SelectState}~ --",
                dataSource: that._getDataSource({}),
                change: function (e) {
                    $(document).trigger(argosyEvents.EVENT_STATE_CHANGED);
                },
                value:that.options.stateId,
                cascade: function (e) {
                    var result = e.sender.value();
                    that._hiddenInput.val(result);
                },
                enable: that.options.disabled != "disabled"
            });
            that._dropDownList = that.element.find("select").getKendoDropDownList();
        },
        _createHiddenInput: function () {
            var that = this;
            var inputId = that.options.inputId;
            if (that.options.bindingGroup != null && that.options.bindingGroup != "") {
                inputId = that.options.bindingGroup + "_" + inputId;
            }
     
            var input = $("<input />", {
                type: "hidden",
                id: inputId,
                name: inputId.replace(/_/g, "."),
                value: that.options.stateId
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
                    var states = $.grep(countryStateMap, function(country) {
                        return country.Id == that.options.countryId;
                    });
                    if (states.length > 0) {
                        options.success(states[0].Regions);
                    } else {

                        options.success([]);
                    }
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
    ui.plugin(States);
})(jQuery);