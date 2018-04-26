function MailingListAddresses(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListAddresses", function (template) {
        $(document.body).append(template);
        that.initialize(that.getDataSource());
    });
}

MailingListAddresses.prototype.options = {};

MailingListAddresses.prototype.baseOptions = {
    dataSource: null,
    templates: {
        contentTemplate: "#_MailingListAddressesTemplate",
        editAddresseTemplate: "#_MailingListEditAddressForm"
    }
};

MailingListAddresses.prototype.setupContinueButton = function () {
    var that = this;
    that.getElement().find("[data-role=button]").click(function (e) {
    });
};

MailingListAddresses.prototype.createPreviewGrid = function () {
    var that = this;
    that.getElement().find("[data-role=grid]").kendoGrid({
        dataSource: new kendo.data.DataSource({
            data: that.data.PreviewData
        }),
        groupable: false,
        sortable: true,
        selectable: true,
        scrollable: false,
        pageable: true,
        columns: that.getColumns(that.data.SourceColumns)
    });
};

MailingListAddresses.prototype.getColumns = function (sourceColumns) {
    var that = this;
    var cols = new Array();
    $(sourceColumns).each(function (i, col) {
        cols.push({
            title: col.Name.replace(/_/g, " "),
            field: col.Name
        });
    });
    return cols;
};

MailingListAddresses.prototype.update = function (task) {
    var that = this;
    that.getElement().find(".text-danger").text(kendo.toString(task.ErrorCount, "n0"));
    that.getElement().find(".text-success").text(kendo.toString(task.Executions, "n0"));
};

MailingListAddresses.prototype.complete = function (task) {
    var that = this;
    that.getElement().find(".text-danger").text(kendo.toString(task.ErrorCount, "n0"));
    that.getElement().find(".text-success").text(kendo.toString(task.Count, "n0"));
    that.task = task;
    if (task.ErrorGuid != null) {
        // leave the error modal visible
    } else if (task.Type == "ListAddressVerification" && task.ErrorCount > 0) {
        $.fancybox.close();
        that.createPreviewGrid();
        $(".continue").click(function (e) {
            var grid = that.getElement().find("[data-role=grid]").getKendoGrid();
            var rowsToRemove = that.getElement().find("[data-role=grid] tbody tr td input[type=checkbox]:checked").closest("tr");
            var addressesToRemove = new Array();
            $(rowsToRemove).each(function (i, row) {
                addressesToRemove.push(grid.dataItem(row).Id);
            });
            that.taskHub.removeBadAddresses(that.task.Data.addressVerifiedPath, addressesToRemove);
        });
    } else {
        $.submitAsForm("/Tools/Mailing/Deduplication?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), task, "taskData");
    }
};

MailingListAddresses.prototype.error = function (task) {
    var that = this;
    that.getElement().find(".text-danger").text(task.ErrorCount);
    that.getElement().find(".text-success").text(task.Count);
};


MailingListAddresses.prototype.initialize = function (data) {
    var that = this;
    that.data = data;
    that.getElement().append(kendo.template($(that.options.templates.contentTemplate).html())({
        Sku: getQuerystring("sku"),
        Name: that.options.displayName
    }));
    //that.createPreviewGrid();
    that.taskHub = new TaskHub(function(e) {
        that.update(e);
    }, function(e) {
        that.complete(e);
    },function(e) {
        that.error(e);
    });


    that.taskHub.verifyAddressList(that.data.TransformedFile,
    [
        { Column: "Full Name", Piece: "FullName" },
        { Column: "Address 1", Piece: "Address1" },
        { Column: "Address 2", Piece: "Address2" },
        { Column: "Address 3", Piece: "Address3" },
        { Column: "City", Piece: "City" },
        { Column: "State", Piece: "State" },
        { Column: "ZIP Code", Piece: "Zip" }
    ]);
};

MailingListAddresses.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

MailingListAddresses.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    return window[that.options.dataSource];
};

MailingListAddresses.prototype.createPreviewGrid = function () {
    var that = this;
    var data = eval(that.task.Data.badAddresses);
    that.getElement().find("[data-role=grid]").kendoGrid({
        dataSource: new kendo.data.DataSource({
            data: data
        }),
        groupable: false,
        sortable: true,
        selectable: false,
        scrollable: false,
        pageable: false,
        columns: [
            {
                title: "~{Address}~",
                template: "#if (OriginalAddress.AttentionTo != null && OriginalAddress.AttentionTo.trim() != '') {#${OriginalAddress.AttentionTo}<br />#}#" +
                          "#if (OriginalAddress.AddressLine1 != null && OriginalAddress.AddressLine1.trim() != '') {#${OriginalAddress.AddressLine1}<br />#}#" +
                          "#if (OriginalAddress.AddressLine2 != null && OriginalAddress.AddressLine2.trim() != '') {#${OriginalAddress.AddressLine2}<br />#}#" +
                          "#if (OriginalAddress.AddressLine3 != null && OriginalAddress.AddressLine3.trim() != '') {#${OriginalAddress.AddressLine3}<br />#}#" +
                          "#if (OriginalAddress.City != null && OriginalAddress.City.trim() != '') {#${OriginalAddress.City} #}#" +
                          "#if (OriginalAddress.State != null && OriginalAddress.State.trim() != '') {#${OriginalAddress.State} #}#" +
                          "#if (OriginalAddress.Zip != null && OriginalAddress.Zip.trim() != '') {#, ${OriginalAddress.Zip} #}#"
            },
            {
                title: " ",
                //template: "<a class='btn btn-secondary'><i class='fa fa-pencil'></i> Update</a>"
                template: '<input type="checkbox" id="remove_address_${Id}" checked /><label for="remove_address_${Id}">~{Remove}~</label>'
            }
        ],
        dataBound: function (e) {
            /*var grid = e.sender;
            var edit = $(grid.element).find(".fa-pencil").parent();
            edit.click(function (e) {
                var row = $(e.target).closest("tr");
                var data = grid.dataItem(row);
                var content = kendo.Template.compile($(that.options.templates.editAddresseTemplate).html())(data);
                $.fancybox({
                    content: content,
                    afterShow: function(e) {
                        
                    }
                });
            });*/
        }
    });
};

MailingListAddresses.prototype.getColumns = function (sourceColumns) {
    var that = this;
    var cols = new Array();
    $(sourceColumns).each(function (i, col) {
        cols.push({
            title: col,
            field: col
        });
    });
    return cols;
};