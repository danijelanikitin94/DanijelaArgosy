function GlobalConsumerTypeDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.refineSearch({});
    $(document).bind(argosyEvents.EVENT_CONSUMER_UPDATED, function (e, consumer) {
        that.refineSearch({});
    });
}

GlobalConsumerTypeDropDown.prototype.options = {};

GlobalConsumerTypeDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=GlobalConsumerTypeDropDown]",
    hiddenFieldName: null
};

GlobalConsumerTypeDropDown.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupDropDown();
};

GlobalConsumerTypeDropDown.prototype.setupDropDown = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
        var opts = {
            dataTextField: "ConsumerTypeDesc",
            dataValueField: "ConsumerTypeId",
            value: that.options.consumerTypeId,
            optionLabel: "-- Select a Type --",
            dataSource: that.getDataSource({}),
            cascade: function (e) {
                if (that.options.hiddenFieldName != null) {
                    var value = $(that.options.ddlViewSelector).getKendoDropDownList().value();
                    if (value && value.length > 0) {
                        $("#" + that.options.hiddenFieldName).val(value);
                    } else {
                        $("#" + that.options.hiddenFieldName).val(that.options.consumerTypeId);
                    }
                }
            }
        };
        $(that.options.ddlViewSelector).kendoDropDownList(opts);
    } else {
        var ddl = $(that.options.ddlViewSelector).getKendoDropDownList();
        ddl.dataSource.read();
        ddl.refresh();
    }
};

GlobalConsumerTypeDropDown.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetConsumerTypes",
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
        },
        pageSize: 99999
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalConsumerTypeDropDown.prototype.dataSourceOpts = {};