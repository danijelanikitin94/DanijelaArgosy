function PartGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID,
        function(e, data) {
            that.refineSearch(data);
        });
    that.refineSearch({});
}

PartGridView.prototype.options = {};

PartGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartGridView]"
};

PartGridView.prototype.searchCriteria = {
    Active: null,
    Keyword: null,
    Description: null,
    PartName: null,
    Code: null,
    FormNo: null,
    Type: null,
    IsRetail: null
};

PartGridView.prototype.refineSearch = function(data) {
    var that = this;
    $.extend(true, that.searchCriteria, data);
    that.search();
};

PartGridView.prototype.search = function() {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            scrollable: false,
            editable: false,
            autoBind: true,
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{SKU}~",
                    field: "Sku",
                    template: "<div><a href='/Admin/Parts/Edit/${PartId}'>#= Sku #</a></div>",
                    width: "20%"
                },
                {
                    title: "~{Product}~",
                    field: "PartName",
                    template:
                        "<div> #if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}#     </div>",
                    width: "20%"
                },
                {
                    title: "~{Description}~",
                    template: "#=Description#"
                },
                {
                    title: "~{ItemType}~",
                    field: "Type",
                    width: "10%"
                },
                {
                    title: "~{Active}~",
                    field: "Active",
                    headerAttributes: { "class": "text-center" },
                    template: "#if (Active==true) {#<span>YES</span>#} else {#<span>NO</span>#}#",
                    attributes: { "class": "text-center bold" }
                }
            ],
            checkboxes: true,
            dataBound: function(e) {
                var gridElement = $(e.sender.element);
                gridElement
                    .find(".k-button.k-button-icontext.k-grid-activate")
                    .unbind("click")
                    .click(function() {
                        that.showUpdatePartStateModal(that.getSelectedRecords(), true);
                    });;
                gridElement
                    .find(".k-button.k-button-icontext.k-grid-deactivate")
                    .unbind("click")
                    .click(function() {
                        that.showUpdatePartStateModal(that.getSelectedRecords(), false);
                    });
                $("div[data-argosy-view=PartGridView] th:eq(3) ,div[data-argosy-view=PartGridView]  tr td:nth-child(4)")
                    .addClass("hidden-xs");
                $("div[data-argosy-view=PartGridView] th:eq(4),div[data-argosy-view=PartGridView]  tr td:nth-child(5)")
                    .addClass("hidden-sm hidden-xs");
            },
            toolbar: [
                {
                    name: "deactivate",
                    text: "<i class='fa fa-close'></i><span class='resp-hidden'> ~{Deactivate}~</span>"
                },
                { name: "activate", text: "<i class='fa fa-check'></i><span class='resp-hidden'> ~{Activate}~</span>" }
            ],
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchProductSkuDescription}~", toolbar: true },
                { name: "Description", type: "text", placeholder: "~{Description}~", toolbar: false },
                { name: "PartName", type: "text", placeholder: "~{Product}~", toolbar: false },
                { name: "Active", type: "select", toolbar: true, autoSubmit: true, data: ActiveStates },
                { name: "Code", type: "text", placeholder: "~{CommCode}~", toolbar: false },
                { name: "FormNo", type: "text", placeholder: "~{FormNumber}~", toolbar: false },
                { name: "Type", type: "text", placeholder: "~{ItemType}~", toolbar: false },
                { name: "IsRetail", type: "checkbox", placeholder: "~{IncludeRetailParts}~", toolbar: false }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
        setupPartTypeAheadSearch($(".part-type-ahead"));
    } else {
        grid.dataSource.read();
    }
};

PartGridView.prototype.showUpdatePartStateModal = function(parts, activate) {
    var that = this,
        message = {
            question: "",
            description: "",
            button: "",
            type: "warning",
            yes: function(e) {
                if (typeof (e.preventDefault) === "function") {
                    that.updatePartState(parts, activate);
                };
            }
        };
    if (activate) {
        message.question = "~{WantToActivateSelection}~";
        message.description = "~{ActivePartsIgnored}~";
        message.button = "~{Activate}~";
    } else {
        message.question = "~{WantToDeactivateSelection}~";
        message.description = "~{InactivePartsIgnored}~";
        message.button = "~{Deactivate}~";
    }
    prompt.alert(message);
};

PartGridView.prototype.updatePartState = function(parts, activate) {
    var that = this,
        params = { parts: parts, activate: activate };
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Admin/Parts/UpdatePartStatus",
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            $(document).trigger(argosyEvents.END_LOADING);
            if (result.ReturnCode === ReturnCode.Success) {
                prompt.notify({
                    question: "Part(s) successfully updated.",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            $(that.options.gridViewSelector).getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
};

PartGridView.prototype.getSelectedRecords = function() {
    var that = this,
        selectedRecords = [],
        kendoGrid = $(that.options.gridViewSelector).getKendoGrid();
    $(kendoGrid.select()).each(function() {
        selectedRecords.push(kendoGrid.dataItem(this));
    });
    return selectedRecords;
};

PartGridView.prototype.getDataSource = function(dataSourceOpts) {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function(options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);

            $.ajax({
                url: "/DataView/GetParts",
                dataType: "json",
                data: search,
                success: function(result) {
                    $(document).trigger(argosyEvents.END_LOADING);
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        },
        serverSorting: true
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

PartGridView.prototype.dataSourceOpts = {};