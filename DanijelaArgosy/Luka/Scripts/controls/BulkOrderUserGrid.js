function  BulkOrderUserGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

BulkOrderUserGrid.prototype.options = {};

BulkOrderUserGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=BulkOrderUserGrid]",
};

BulkOrderUserGrid.prototype.searchCriteria = {
    Username: null
};

BulkOrderUserGrid.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

BulkOrderUserGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            exportToExcel: false,
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 2
            },
            columns: [
            {
                title: "User",
                field: "Username",
                template: "${FirstName} ${LastName}<br/>${Username}"
            },
            {
                title: "Address",
                field: "Address1",
                template: "123 Any Street Way<br/>Suite 123<br/>Townsville, ST 54321"
            },
            {
                title: "",
                template: "<div class='floatr'><a class='btn btn-default'><i class='fa fa-plus'></i> Add</a></div>"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var activateButton = gridElement.find(".k-button.k-button-icontext.k-grid-activate");
                var deactivateButton = gridElement.find(".k-button.k-button-icontext.k-grid-deactivate");

                activateButton.unbind("click");
                deactivateButton.unbind("click");

                activateButton.click(function (clickEvent) {
                    that.showUpdateUserModal(that.getSelectedRecords(), true);
                });
                deactivateButton.click(function (clickEvent) {
                    that.showUpdateUserModal(that.getSelectedRecords(), false);
                });
            },
            search: [
                { name: "Username", type: "text", placeholder: "Username", toolbar: false },
                { name: "FirstName", type: "text", placeholder: "First Name", toolbar: false },
                { name: "LastName", type: "text", placeholder: "Last Name", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "Search by First/Last Name or Username", toolbar: true },
                {
                    name: "Active", type: "select", placeholder: "-- Status --", toolbar: true, data:
                      [
                          { value: "true", text: "Active", selected: true },
                          { value: "false", text: "Inactive" },
                          { value: "", text: "All" }
                      ]
                },
                { name: "Email", type: "text", placeholder: "Email", toolbar: false },
                { name: "PhoneNumber", type: "text", placeholder: "Phone", toolbar: false },
                { name: "DivisionName", type: "text", placeholder: "Division", toolbar: false }
            ],
            toolbar: [
                { name: "AddSelected", text: "Add Selected", 'class': "fa fa-plus" }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

BulkOrderUserGrid.prototype.showUpdateUserModal = function (users, activate) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            // this is what will happen when they click the confirm button
            that.updateUserState(users, activate);
        }
    };

    prompt.alert(message);
};


BulkOrderUserGrid.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

BulkOrderUserGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsers",
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

BulkOrderUserGrid.prototype.dataSourceOpts = {};
