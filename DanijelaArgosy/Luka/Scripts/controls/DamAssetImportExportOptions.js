function DamAssetImportExportOptions(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    //$(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
    //    that.refineSearch(data);
    //});
    //that.refineSearch({});
    that.setupSearch();
    that.setupGrid();
}

DamAssetImportExportOptions.prototype.options = {};

DamAssetImportExportOptions.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=DamAssetImportExportOptionsView]",
};
DamAssetImportExportOptions.prototype.dataSourceOpts = {};

DamAssetImportExportOptions.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            search.inputExtensionId = $("#ddlInputExtensions").val();
            search.outputExtensionId = $("#ddlOutputExtensions").val();
            search.active = $("#ddlActive").val();
            $.ajax({
                url: "/Tools/DigitalAssets/GetAssetInputOutputFormats",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result.Records);
                    }
                },
                error: function (e) {
                }
            });
        },
        update: function (options) {
            $.ajax({
                url: "/Tools/DigitalAssets/UpdateInputOutputFormat",
                dataType: "json",
                data: options.data,
                method: "POST",
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Success) {
                        DamAssetImportExportOptions.prototype.setupGrid();
                    }
                    else {
                        options.error();
                    }
                }
            })
        }
    };
    that.dataSourceOpts.schema = {
        model: {
            id: "Id",
            fields: {
                Id: { editable: false },
                CompanyId: {type: "number"},
                Dpi: { type: "number", validation: { required: true, min: 1 } },
                Comments: { type: "string", validation: { required: false } },
                IsActive: { type: "boolean"}
            }
        }
        
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

DamAssetImportExportOptions.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: "inline",
            autoBind: true,
            dataSource: that.getDataSource({}),
            sortable: true,
            
            columns: [
                {
                    field: "Id",
                    hidden: true
                },
                {
                    title: "Input Extension",
                    field: "InputTypeExtension",
                    editable: function (dataItem) {
                        return false;
                    },
                    width: "75px"
                },
                {
                    title: "Output Extension",
                    field: "OutputTypeExtension",
                    editable: function (dataItem) {
                        return false;
                    },
                    width: "75px"
                },
                {
                    title: "DPI",
                    field: "Dpi",
                    width: "50px",
                    attributes: {
                        style: "text-align: right;"
                    },
                    headerAttributes: {
                        style: "text-align:right;"
                    },
                    editor: DamAssetImportExportOptions.prototype.NumericEditor
                },
                {
                    title: "Comments",
                    field: "Comments",
                },
                {
                    title: "Active",
                    field: "IsActive",
                    width: "100px",
                    editor: DamAssetImportExportOptions.prototype.activeDropDownEditor
                },
                { command: ["edit"], width:"200px"}
            ],
            dataBound: function (e) {
                $(that.options.gridViewSelector).find("input[type=number]").kendoNumericTextBox({
                    min: 0,
                    spinners: false,
                    step: 1,
                    format: "n0"
                });
                var grid = e.sender;
                var gridData = grid.dataSource.view();
                for (var i = 0; i < gridData.length; i++) {
                    var currentUid = gridData[i].uid;
                    var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                    var edit = $(currentRow).find(".k-grid-edit");
                    if (gridData[i].Dpi == null) {
                        edit.hide();
                    }
                }
            }
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } 
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};
DamAssetImportExportOptions.prototype.setupSearch = function () {
    $("#ddlInputExtensions").kendoDropDownList({
        dataSource: InputExtensions,
        dataTextField: "text",
        dataValueField: "value"
    }).data("kendoDropDownList");

    $("#ddlOutputExtensions").kendoDropDownList({
        dataSource: OutputExtensions,
        dataTextField: "text",
        dataValueField: "value"
    }).data("kendoDropDownList");

    $("#ddlActive").kendoDropDownList({
        dataSource: ActiveStates,
        dataTextField: "text",
        dataValueField: "value"
    }).data("kendoDropDownList").value("");
}

DamAssetImportExportOptions.prototype.search = function () {
    var that = this;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
}

DamAssetImportExportOptions.prototype.activeDropDownEditor = function (container, options) {
    $('<input required name="' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            autoBind: false,
            dataTextField: "text",
            dataValueField: "value",
            dataSource: [{ value: true, text: "True" }, { value: false, text: "False" }],
        }).data("kendoDropDownList").value(options.model.IsActive);
}

DamAssetImportExportOptions.prototype.NumericEditor = function (container, options) {
    $("<input required name='" + options.field + "'/>")
        .appendTo(container)
        .kendoNumericTextBox({
            min: 0,
            spinners: false,
            step: 1,
            format: "n0"
        });
}