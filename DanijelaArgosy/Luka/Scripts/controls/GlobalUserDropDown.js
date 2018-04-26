function GlobalUserDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.element = $("*[data-argosy-uuid=" + that.options.uuid + "]");
    that.searchCriteria.Active = "Y";
    that.setupEventListeners();
    that.refineSearch({});

    $(document).bind(argosyEvents.USER_GROUP_CHANGE, function (e, data) {
        that.searchCriteria.UserGroup = data;
        if (that.searchCriteria.UserGroup != null || that.searchCriteria.UserGroup != "") {
            that.searchCriteria.Active = "Y";
            that.refineSearch(that.searchCriteria);
        }
    });
}

GlobalUserDropDown.prototype.options = {};

GlobalUserDropDown.prototype.searchCriteria = {};

GlobalUserDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=GlobalUserDropDown]",
    selectedCompanyId: 0,
    selectedSiteId: 0,
    hiddenFieldName: null,
    recordSizeCategory:0
    
};
GlobalUserDropDown.prototype.setupEventListeners = function () {
    var that = this;
    $(document).bind(argosyEvents.CLEAR_SELECTED_USER, function (e) {
        var dropDown = $(that.options.ddlViewSelector).getKendoDropDownList();
        if (dropDown != null) {
            dropDown.select(0);
            
        }
        if (that.options.hiddenFieldName != null) {
            $("#" + that.options.hiddenFieldName).val(0);
        }
    });
};
GlobalUserDropDown.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupDropDown();
};

GlobalUserDropDown.prototype.createDropDownList = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).length == 0) {
        that.element.append("<select data-argosy-view='GlobalUserDropDown' />");
    }
};
GlobalUserDropDown.prototype.setCompanyId = function(companyId) {
    var that = this;
    that.options.selectedCompanyId = companyId;
};
GlobalUserDropDown.prototype.setSiteId = function (siteId) {
    var that = this;
    that.options.selectedSiteId = siteId;
};
GlobalUserDropDown.prototype.setupDropDown = function () {
    var that = this;
    that.createDropDownList();
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
        var opts = {
            filter: "contains",
            serverPaging: false,
            serverSorting: false,
            dataTextField: "FullName",
            dataValueField: "UserId",
            optionLabel: "-- ~{SelectUser}~ --",
            autoBind: false,
            minLength: 3,
            dataSource: that.getDataSource({}),
            change: function (e) {
                var index = this.select();
                if (index && index > 0) {
                    $(document).trigger(argosyEvents.SELECTED_USER, this.dataItem());
                }
            },
            cascade: function (e) {
                if (that.options.hiddenFieldName != null) {
                    $("#" + that.options.hiddenFieldName).val($(that.options.ddlViewSelector).val());
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

GlobalUserDropDown.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                IsActive: true,
                CompanyId:that.options.selectedCompanyId,
                SiteId: that.options.selectedSiteId,
                RecordSizeCategory: that.options.recordSizeCategory
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsersForDropDownList",
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

GlobalUserDropDown.prototype.dataSourceOpts = {};