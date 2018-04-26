function CompanyGlobalFormsDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.refineSearch({});
}

CompanyGlobalFormsDropDown.prototype.options = {};

CompanyGlobalFormsDropDown.prototype.searchCriteria = {};

CompanyGlobalFormsDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=CompanyGlobalFormsDropDown]"
};

CompanyGlobalFormsDropDown.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupDropDown();
};

CompanyGlobalFormsDropDown.prototype.setupDropDown = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
        var opts = {
            serverPaging: false,
            serverSorting: false,
            dataTextField: "FormName",
            dataValueField: "GlobalFormsId",
            optionLabel: "-- Select Global Form --",
            dataSource: that.getDataSource({}),
            suggest: true,
            autoBind: true
        };
        $(that.options.ddlViewSelector).kendoDropDownList(opts);
    } else {
        var ddl = $(that.options.ddlViewSelector).getKendoDropDownList();
        ddl.dataSource.read();
        ddl.refresh();
    }
    
};

CompanyGlobalFormsDropDown.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetGlobalFormsForCompany/",
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
        schema: {
            data: "d.Data",
            total: "d.TotalRecords"
        },
        pageSize: 99999
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

CompanyGlobalFormsDropDown.prototype.dataSourceOpts = {};