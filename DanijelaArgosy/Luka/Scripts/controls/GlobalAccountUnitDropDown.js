function GlobalAccountUnitDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.refineSearch({});
}

GlobalAccountUnitDropDown.prototype.options = {};

GlobalAccountUnitDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=GlobalAccountUnitDropDown]",
    hiddenFieldName: null
};

GlobalAccountUnitDropDown.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupDropDown();
};

GlobalAccountUnitDropDown.prototype.setupDropDown = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
        var opts = {
            dataTextField: "AccountUnitDesc",
            dataValueField: "AccountingUnitId",
            optionLabel: "-- Select an Account Unit --",
            dataSource: that.getDataSource({}),
            cascade: function (e) {
                if (that.options.hiddenFieldName != null) {
                    $("#" + that.options.hiddenFieldName).val($(that.options.ddlViewSelector).val());
                }
            }
        };
        $(that.options.ddlViewSelector).kendoDropDownList(opts);
        //Set default value from passed parameter
        var dropdownlist = $(that.options.ddlViewSelector).getKendoDropDownList();
        dropdownlist.value(AccountingUnitId.value);
    } else {
        var ddl = $(that.options.ddlViewSelector).getKendoDropDownList();
        ddl.dataSource.read();
        ddl.refresh();
    }
};

GlobalAccountUnitDropDown.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetAccountUnits",
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

GlobalAccountUnitDropDown.prototype.dataSourceOpts = {};