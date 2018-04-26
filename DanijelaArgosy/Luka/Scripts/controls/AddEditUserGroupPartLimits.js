function AddEditUserGroupPartLimits(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

AddEditUserGroupPartLimits.prototype.options = {};
AddEditUserGroupPartLimits.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AddEditUserGroupPartLimits]",
};
AddEditUserGroupPartLimits.prototype.searchCriteria = {
};
AddEditUserGroupPartLimits.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddEditUserGroupPartLimits.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel: false,
            scrollable: false,
            pageable: {
                refresh: true,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "~{Name}~",
                    field: "GroupName"
                },
                {
                    title: "<span class='floatr textr'>~{ProductLimitQuantity}~<b class='co-warning'>*</b></span>",
                    template: "<div class='textr'><input  min='0' max='9999999'class=\"numericText textr\" onblur=\"javascript:editPartLimitsQuantityForUserGroup(this)\" id=\"txtLimitUserGroupQty\"  name=\"txtLimitQty\" value=\"#if (LimitQuantity == null) {#0#} else {#${LimitQuantity}#}#\"/>   </div>",
                },
                {
                    title: "~{TimeFrame}~",
                    template: '<select class="time-frame" onChange=\"javascript:editPartLimitsTimeFrameForUserGroup(this)\">' +
                        '<option selected="selected" value="null">~{SelectOne}~</option>' +
                        '<option #if (Days == 1) {# selected="selected" #}# value="1">Daily</option>' +
                        '<option #if (Days == 7) {# selected="selected" #}#  value="7">7 Days</option>' +
                        '<option #if (Days == 30) {# selected="selected" #}#  value="30">30 Days</option>' +
                        '<option #if (Days == 60) {# selected="selected" #}#  value="60">60 Days</option>' +
                        '<option #if (Days == 90) {# selected="selected" #}#  value="90">90 Days</option>' +
                        '<option #if (Days == 120) {# selected="selected" #}#  value="120">120 Days</option>' +
                        '<option #if (Days == 160) {# selected="selected" #}#  value="160">160 Days</option>' +
                        '<option #if (Days == 180) {# selected="selected" #}#  value="180">180 Days</option></select>'
                },
                {
                    title: "~{AllowApprovals}~",
                    template: '<select class="allow-approvals" onChange=\"javascript:editPartLimitsTimeFrameForUserGroup(this)\">' +
                        '<option #if (GotoApprovalIfOverLimit) {# selected="selected" #}# value="true">Yes</option>' +
                        '<option #if (!GotoApprovalIfOverLimit) {# selected="selected" #}#  value="false">No</option></select>'
                }
            ],
            checkboxes: false,
            search: [
                        { name: "UserGroupKeywords", type: "text", placeholder: "~{SearchByGroupNameDescription}~", toolbar: true }
            ],
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid1 = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid1.dataItem(this);
                    var numericTextBox = $(this).find(".numericText");
                    $(numericTextBox).kendoNumericTextBox({
                        min: $(this).attr("min"),
                        max: $(this).attr("max"),
                        format: "#",
                        decimal: 0,
                        spinners: false
                    });

                });
            }
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

AddEditUserGroupPartLimits.prototype.showDeletePartLimitModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            // this is what will happen when they click the confirm button
            that.DeletePartLimitFromUser(data);
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.description = "~{CanNotRecoverProductLimit~}";
    message.button = "~{Remove}~";

    prompt.alert(message);
};

AddEditUserGroupPartLimits.prototype.DeletePartLimitFromUser = function (partLimit) {
    var that = this;
    var params = { partLimit: partLimit };
    $.ajax({
        url: '/Admin/Users/DeleteUserPartLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var grid = $(this.options.gridViewSelector).getKendoGrid();
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            grid.dataSource.read();
        }
    });
    $.fancybox.close();
};

AddEditUserGroupPartLimits.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Admin/Parts/GetCompanyUserGroupPartLimits",
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
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};
AddEditUserGroupPartLimits.prototype.dataSourceOpts = {};
