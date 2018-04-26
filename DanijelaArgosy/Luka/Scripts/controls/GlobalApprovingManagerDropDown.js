function GlobalApprovingManagerDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.refineSearch({});
}

GlobalApprovingManagerDropDown.prototype.options = {};

GlobalApprovingManagerDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=GlobalApprovingManagerDropDown]",
    hiddenFieldName: null,
};

GlobalApprovingManagerDropDown.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupDropDown();
};

GlobalApprovingManagerDropDown.prototype.setupDropDown = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
       
        var opts = {
            filter: "contains",
            serverPaging: true,
            serverFiltering:true,
            serverSorting: false,
            dataTextField: "FullName",
            dataValueField: "UserId",
            optionLabel: "-- Select a Manager --",
            autoBind: true,
            suggest: true,
            dataSource: that.getDataSource({}),
            cascade: function (e) {
                if (that.options.hiddenFieldName != null) {
                    $("#" + that.options.hiddenFieldName).val(this.value());
                }
            }
        };
        $(that.options.ddlViewSelector).kendoDropDownList(opts);
        //Set default value from passed parameter
        var dropdownlist = $(that.options.ddlViewSelector).getKendoDropDownList();
        dropdownlist.value(that.options.approvingManagerId);
    } else {
        var ddl = $(that.options.ddlViewSelector).getKendoDropDownList();
        ddl.dataSource.read();
        ddl.refresh();
    }
};

GlobalApprovingManagerDropDown.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                SelectedAccountManagerId: that.options.approvingManagerId
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetApprovingUser",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                       
                        options.success(result);
                    }
                }
            });
        },
        
    };
    that.dataSourceOpts.pageSize = 20;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalApprovingManagerDropDown.prototype.dataSourceOpts = {};