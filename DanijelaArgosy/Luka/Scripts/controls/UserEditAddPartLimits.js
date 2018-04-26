function UserEditAddPartLimits(opts) {
    var that = this;
    that.options.userGroupId = null;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

UserEditAddPartLimits.prototype.options = {};
UserEditAddPartLimits.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserEditAddPartLimits]",
};
UserEditAddPartLimits.prototype.searchCriteria = {
};
UserEditAddPartLimits.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

UserEditAddPartLimits.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel: false,
            scrollable: false,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "~{SKU}~",
                    template: "${Sku}"
                },
                {
                    title: "<span class='floatr textr'>~{ProductLimitQuantity}~<b class='co-warning'>*</b></span>",
                    template: "<div class='textr'><input  min='0' max='9999999'class=\"numericText textr\" onblur=\"javascript:editPartLimit(this)\" id=\"txtLimitQty\"  name=\"txtLimitQty\" value=\"#if (LimitQuantity == null) {#0#} else {#${LimitQuantity}#}#\"/>   </div>",
                    width: "15%"
                },
                {
                    title: "~{TimeFrame}~",
                    template: '<select id=\"timeFrameDDL\"  onChange=\"javascript:viewPartLimits(this)\" style="width:90%">' +
                        '<option selected="selected" value="null">~{SelectOne}~</option>' +
                        '<option #if (Days == 1) {# selected="selected" #}# value="1">~{Daily}~</option>' +
                        '<option #if (Days == 7) {# selected="selected" #}#  value="7">7 ~{Days}~</option>' +
                        '<option #if (Days == 30) {# selected="selected" #}#  value="30">30 ~{Days}~</option>' +
                        '<option #if (Days == 60) {# selected="selected" #}#  value="60">60 ~{Days}~</option>' +
                        '<option #if (Days == 90) {# selected="selected" #}#  value="90">90 ~{Days}~</option>' +
                        '<option #if (Days == 120) {# selected="selected" #}#  value="120">120 ~{Days}~</option>' +
                        '<option #if (Days == 160) {# selected="selected" #}#  value="160">160 ~{Days}~</option>' +
                        '<option #if (Days == 180) {# selected="selected" #}#  value="180">180 ~{Days}~</option></select>'
                }
            ],
            checkboxes: false,
            search: [
                        { name: "Keyword", type: "text", placeholder: "~{SearchSKUProduct}~", toolbar: true }
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


UserEditAddPartLimits.prototype.showDeletePartLimitModal = function (data) {
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
    message.description = "~{CanNotRecoverProductLimit}~ ";
    message.button = "~{Remove}~";

    prompt.alert(message);
};

UserEditAddPartLimits.prototype.DeletePartLimitFromUser = function (partLimit) {
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
            var grid = $(that.options.gridViewSelector).getKendoGrid();
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
            grid.refresh(true);
        }
    });
    $.fancybox.close();
};

UserEditAddPartLimits.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // alert();
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Admin/Users/GetUserPartLimits",
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
UserEditAddPartLimits.prototype.dataSourceOpts = {};
