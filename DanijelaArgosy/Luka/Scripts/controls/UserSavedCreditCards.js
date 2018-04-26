function UserSavedCreditCards(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
UserSavedCreditCards.prototype.options = {
};

UserSavedCreditCards.prototype.baseOptions = {
    userId: null
};

UserSavedCreditCards.prototype.searchCriteria = {
};

UserSavedCreditCards.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

UserSavedCreditCards.prototype.setupGrid = function () {
    var that = this,
        element = that.getElement();
    element.append($("<div />"));
    if (element.find("div").getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel:false,
            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "Name",
                    template: "<div><input type='text' value='${NameOnCard}' class='hide' style='max-width: 100px;' /> <span>${(NameOnCard != null ? NameOnCard : '')}</span></div>",
                },
                {
                    title: "Last 4",
                    template: "<div>${(Last4Digits != null ? Last4Digits : 'XXXX')}</div>",
                }, {
                    title: "Exp.",
                    template: "<div>${kendo.toString((ExpirationDate != null ? Date.parse(ExpirationDate) : new Date(1900, 1, 1)), 'MM/yyyy')}</div>",
                },{
                    title: "Default",
                    template: "<div class='text-center'><input type='radio' name='cc-default' #if(IsDefault){#checked='checked'#}# id='cc-default-${Id}'/><label for='cc-default-${Id}'>&nbsp;</label></div>",
                }, {
                    title: " ",
                    template: "<div><i class='fa fa-pencil' aria-hidden='true'></i> <i class='fa fa-times' aria-hidden='true'></i> <i class='fa fa-floppy-o hide' aria-hidden='true'></i>&nbsp;<i class='fa fa-ban hide' aria-hidden='true'></i></div>",
                    width: 60
                }
            ],
            title: "Payment Methods",
            notes: "Expired cards are automatically removed",
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this),
                        deleteBtn = $(this).find(".fa-times"),
                        editBtn = $(this).find(".fa-pencil"),
                        radio = $(this).find("input[type=radio]");
                    editBtn.unbind("click");
                    editBtn.click(function () {
                        that.editPaymentMethod($(this).closest("tr"), data);
                    });
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.deletePaymentMethod(data);
                    });
                    radio.unbind("click");
                    radio.click(function () {
                        that.setDefaultPaymentMethod(data);
                    })
                });

                $("div[data-role=customgrid] th:eq(3),div[data-role=customgrid]  tr td:nth-child(2)")
                    .addClass("hidden-sm");
                $("div[data-role=customgrid] th:eq(4),div[data-role=customgrid]  tr td:nth-child(3)")
                    .addClass("hidden-sm hidden-md");
            }
        };
        element.find("div").kendoCollapseGrid(opts);
    } else {
        var grid = element.find("div").getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};
UserSavedCreditCards.prototype.setDefaultPaymentMethod = function (data) {
    var that = this,
        element = that.getElement();
    data.IsDefault = true;
    $.post({
        url: "/Users/UpdatePaymentMethod",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({token: data.toJSON()}),
        success: function (result) {
            var grid = element.find("[data-role='customgrid']").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();
        }
    });
}

UserSavedCreditCards.prototype.editPaymentMethod = function (row, data) {
    var that = this, 
        element = that.getElement(),
        input = row.find("input"),
        span = row.find("span"),
        pencilBtn = row.find(".fa-pencil"),
        deleteBtn = row.find(".fa-times"),
        saveBtn = row.find(".fa-floppy-o"),
        cancelBtn = row.find(".fa-ban"),
        revert = function () {
            input.addClass("hide");
            saveBtn.addClass("hide");
            cancelBtn.addClass("hide");
            span.removeClass("hide");
            deleteBtn.removeClass("hide");
            pencilBtn.removeClass("hide");
        };
    span.addClass("hide");
    deleteBtn.addClass("hide");
    pencilBtn.addClass("hide");
    input.removeClass("hide");
    saveBtn.removeClass("hide");
    cancelBtn.removeClass("hide");
    cancelBtn.unbind("click");
    cancelBtn.bind("click", function () {
        revert();
    });
    saveBtn.unbind("click");
    saveBtn.bind("click", function () {
        data.NameOnCard = input.val();
        $.post({
            url: "/Users/UpdatePaymentMethod",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({token: data.toJSON()}),
            success: function (result) {
                var grid = element.find("[data-role='customgrid']").getKendoGrid();
                grid.dataSource.read();
                grid.refresh();
                revert();
            }
        });
    });
};

UserSavedCreditCards.prototype.deletePaymentMethod = function (data) {
    var that = this,
        element = that.getElement();
    $.post({
        url: "/Users/DeletePaymentMethod",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({token: data.toJSON()}),
        success: function (result) {
            var grid = element.find("[data-role='customgrid']").getKendoGrid();
            grid.dataSource.read();
            grid.refresh();
        }
    });
};

UserSavedCreditCards.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = { };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetSavedPaymentMethods",
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

UserSavedCreditCards.prototype.dataSourceOpts = {};