function MailingListMapper(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListMapper", function (template) {
        $(document.body).append(template);
        that.initialize(that.getDataSource());
    });
}

MailingListMapper.prototype.options = {
    
};

MailingListMapper.prototype.baseOptions = {
    dataSource: null,
    ignoreColumns: ["_____UID_____", "Updated_Address", "IsValid", "MD5", "Count", "Duplicate"],
    templates: {
        contentTemplate: "#_MailingListMapperTemplate",
        previewGrid: "#previewgrid"
    }
};

MailingListMapper.prototype.initialize = function (data) {
    var that = this;
    that.data = data;
    that.getElement().append(kendo.template($(that.options.templates.contentTemplate).html())({
        Sku: getQuerystring("sku"),
        Name: that.options.displayName
    }));
    that.createMapperElement();
    that.createPreviewGrid();
    that.taskHub = new TaskHub(that.update, that.complete, that.error);
    that.setupContinueButton();
};

MailingListMapper.prototype.update = function (task) {
    var that = this;
};

MailingListMapper.prototype.complete = function (task) {
    var that = this;
    if (task.ErrorGuid != null && task.ErrorGuid != "") {

    } else {
        $.submitAsForm("/Tools/Mailing/Addresses?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), task, "taskData");
        //$.submitAsForm("/Tools/Mailing/Deduplication?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), task, "taskData");
    }
};

MailingListMapper.prototype.error = function (task) {
    var that = this;
};

MailingListMapper.prototype.setupContinueButton = function () {
    var that = this;
    that.getElement().find("[data-role=button]").click(function(e) {
        var listMapper = that.getElement().find("[data-role=listmapper]").getKendoListMapper();
        var isValid = listMapper.isValid();
        if (isValid) {
            var mappings = listMapper.value();
            var unmapped = listMapper.getUnmappedColumns(false);
            var data = new Array();
            $(mappings).each(function (i, mapping) {
                data.push({
                    SourceColumns: mapping.SourceColumns,
                    DestinationColumn: mapping.ColumnName
                });
            });
            $(unmapped).each(function (i, mapping) {
                data.push({
                    SourceColumns: [mapping],
                    DestinationColumn: mapping
                });
            });
            that.taskHub.transformList(that.data.FileData.UploadFileUrl, {
                Columns: data
            });
        }
    });
};

MailingListMapper.prototype.createPreviewGrid = function () {
    var that = this;
    that.getElement().find("[data-role=grid]").kendoGrid({
        dataSource: new kendo.data.DataSource({
            data: that.data.PreviewData
        }),
        groupable: false,
        sortable: true,
        selectable: true,
        scrollable: false,
        pageable: false,
        columns: that.getColumns(that.data.SourceColumns)
    });
};

MailingListMapper.prototype.getColumns = function (sourceColumns) {
    var that = this;
    var cols = new Array();
    $(sourceColumns).each(function (i, col) {
        var hiddenColumnMatch = $.grep(that.options.ignoreColumns, function(columnName) {
            return col.toLowerCase() === columnName.toLowerCase();
        });
        if (hiddenColumnMatch.length === 0) {
            cols.push({
                title: col,
                field: col
            });
        }
    });
    return cols;
};

MailingListMapper.prototype.createMapperElement = function () {
    var that = this;
    /*kendo.bind(that.getElement(),  new kendo.data.ObservableObject({
        data: that.data
    }));*/
    that.getElement().find("[data-role=listmapper]").kendoListMapper({
        sourceColumns: that.data.SourceColumns
    });
};

MailingListMapper.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};
MailingListMapper.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    return window[that.options.dataSource];
};