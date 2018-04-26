function GlobalUserGroupDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.element = $("*[data-argosy-uuid=" + that.options.uuid + "]");
    that.refineSearch({});
}

GlobalUserGroupDropDown.prototype.options = {};

GlobalUserGroupDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=GlobalUserGroupDropDown]",
    hiddenFieldName: null,
    userGroupId: null,
    companyId: 0,
    showOnlyPublicOptions: false,
    isRequired: false,
    labelRename:"User Group"
};

GlobalUserGroupDropDown.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupDropDown();
};

GlobalUserGroupDropDown.prototype.createDropDownList = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).length === 0) {
        that.element.append("<select required = 'required' data-argosy-view='GlobalUserGroupDropDown' />");
    }
};

GlobalUserGroupDropDown.prototype.setupDropDown = function () {
    var that = this;
    that.createDropDownList();
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
        var opts = {
            filter: "contains",
            serverPaging: false,
            serverSorting: false,
            dataTextField: "GroupName",
            dataValueField: "UserGroupId",
            optionLabel: "- ~{SelectA}~ "+that.options.labelRename+" -",
            autoBind: true,
            value: that.options.userGroupId,
            dataSource: that.getDataSource({}),
            cascade: function (e) {
                if (that.options.hiddenFieldName != null) {
                    $("#" + that.options.hiddenFieldName).val(this.value());
                }
                $(document).trigger(argosyEvents.USER_GROUP_CHANGE, this.value());
            }
        };
        $(that.options.ddlViewSelector).kendoDropDownList(opts);
        //Set default value from passed parameter
        var dropdownlist = $(that.options.ddlViewSelector).getKendoDropDownList();
        dropdownlist.value(that.options.userGroupId);
    } 
};

GlobalUserGroupDropDown.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                IsActive: true,
                CompanyId: that.options.companyId,
                ShowOnlyPublicGroups: that.options.showOnlyPublicOptions
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroups",
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
    };
    that.dataSourceOpts.serverFiltering = true;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalUserGroupDropDown.prototype.dataSourceOpts = {};