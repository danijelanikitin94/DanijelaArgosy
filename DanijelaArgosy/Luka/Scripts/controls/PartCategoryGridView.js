function PartCategoryGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {  
        that.refineSearch(data);
    });
    that.refineSearch({});
}

PartCategoryGridView.prototype.options = {};

PartCategoryGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartCategoryGridView]",
};
PartCategoryGridView.prototype.searchCriteria = {
    Sku: null
};

PartCategoryGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

PartCategoryGridView.prototype.setupGrid = function() {
        var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: that.options.adminGridView ? true : false,
                pageSizes: that.options.adminGridView ? [50, 100, 500] : false,
                buttonCount: that.options.adminGridView ? 5 : 1
            },
            columns: [
                {
                    title: "~{CategoryName}~",
                    field: "GroupName",
                    template: "<div><a href='/Admin/PartCategories/Update/${GroupId}'> ${GroupName}  </a></div>",
                },
                {
                    title: "~{Description}~",
                    field: "GroupDescrip"
                },
                {
                    title: "~{Active}~",
                    headerAttributes: { "class": "text-center", style: "text-align:center;" },
                    template: "#if (IsActive==true) {#<span>YES</span>#} else {#<span>NO</span>#}#",
                    attributes: { "class": "text-center bold" }
                }
            ],
            checkboxes: true,
            dataBinding: function(e) {
            },
            dataBound: function(e) {
                var gridElement = $(e.sender.element);
                var activateButton = gridElement.find(".k-button.k-button-icontext.k-grid-activate");
                var deactivateButton = gridElement.find(".k-button.k-button-icontext.k-grid-deactivate");
                
                activateButton.unbind("click");
                deactivateButton.unbind("click");
                
                activateButton.click(function(clickEvent) {
                    that.showUpdatePartStateModal(that.getSelectedRecords(), true);
                });
                deactivateButton.click(function(clickEvent) {
                    that.showUpdatePartStateModal(that.getSelectedRecords(), false);
                });
            },
            toolbar: [
                { name: "deactivate", text: "<i class='fa fa-close'></i><span class='resp-hidden'> ~{Deactivate}~</span>" },
                { name: "activate", text: "<i class='fa fa-check'></i><span class='resp-hidden'> ~{Activate}~</span>" }
            ], 
            search: [
                { name: "GroupName", type: "text", placeholder: "~{PartCategory}~", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchCategoryNameDescription}~", toolbar: true },
                { name: "GroupDescrip", type: "text", placeholder: "~{Description}~", toolbar: false },
                { name: "IsActive", type: "select", toolbar: true, data: ActiveStates }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

PartCategoryGridView.prototype.showUpdatePartStateModal = function (partCategories, activate) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
		yes: function (e) {
			if (typeof (e.preventDefault) === "function") {
				that.updatePartState(partCategories, activate);
			}
        }
    };

    if (activate) {
        message.question = "~{WantToActivateSelection}~";
        message.description = "~{ActivePartCategoriesIgnored}~";
        message.button = "~{Activate}~";
    } else {
        message.question = "~{WantToDeactivateSelection}~";
        message.description = "~{InactivePartCategoriesIgnored}~";
        message.button = "~{Deactivate}~";
    }
    prompt.alert(message);
};
PartCategoryGridView.prototype.updatePartState = function (partCategories, activate) {
    var that = this;
    var params = { partCategories: partCategories, active: activate };
    $.ajax({
		url: '/Admin/PartCategories/UpdatePartCategoryActive',
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
                        question: this.Key + " was " + " successfully " + (this.Value ? "activated." : "deactivated"),
                        type: "success"
                    });
                    //var data = grid.find(this.Key, "Sku");
                    /*if (!this.Value) {
                        grid.update(this.Key, "Sku", activate, "Active");
                    }*/
                });
            } else {
                prompt.clientResponseError(result);
            }
            grid.dataSource.read();
        }
    });
    $.fancybox.close();
};
PartCategoryGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        var item = kendoGrid.dataItem(this).GroupId;
        selectedRecords.push(item);
    });

    return selectedRecords;
};

PartCategoryGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    if (!that.options.adminGridView)
    {
        that.dataSourceOpts.pageSize = 5;
    }

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {}
			$.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
			if (that.searchCriteria.IsActive !== null) {
				search.IsActive = that.searchCriteria.IsActive == "Y";
			}
            $.ajax({
                url: "/DataView/GetPartCategories",
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

PartCategoryGridView.prototype.dataSourceOpts = {};
