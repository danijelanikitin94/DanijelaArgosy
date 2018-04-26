function MailingListDeduplication(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListDeduplication", function (template) {
        $(document.body).append(template);
        that.initialize(that.getDataSource());
    });
}

MailingListDeduplication.prototype.options = {};

MailingListDeduplication.prototype.baseOptions = {
    dataSource: null,
    templates: {
        contentTemplate: "#_MailingListDeduplicationTemplate"
    }
};

MailingListDeduplication.prototype.setupContinueButton = function (enable) {
    var that = this;
    var button = that.getElement().find("[data-role=button]");
    button.prop("disabled", !enable);
    if (enable) {
        button.click(function (e) {
            that.removeDuplicatesFromList();
        });
    } else {
        button.unbind("click");
    }
};

MailingListDeduplication.prototype.removeDuplicatesFromList = function () {
    var that = this;
    var grid = that.getElement().find("[data-role=grid]").getKendoGrid();
    block(null, "~{MsgGettingDups}~");
    var rowsToRemove = that.getElement().find("[data-role=grid] tbody tr td .checkbox_click.remove_dup .fa-check-square").closest("tr");
    var duplicatesToRemove = new Array();
    $(rowsToRemove).each(function (i, row) {
        duplicatesToRemove.push(grid.dataItem(row)["_____UID_____"]);
    });
    unblock();
    that.taskHub.removeDuplicatesFromList(that.data.DeduplicatedFile, duplicatesToRemove);
}

MailingListDeduplication.prototype.getColumns = function (sourceColumns) {
    var that = this;
    var cols = new Array();
    $(sourceColumns).each(function (i, col) {
        cols.push({
            title: col.replace(/_/g, " "),
            field: col
        });
    });
    return cols;
};

MailingListDeduplication.prototype.update = function (task) {
    var that = this;
    that.getElement().find(".text-danger").text(kendo.toString(task.ErrorCount, "n0"));
    that.getElement().find(".text-success").text(kendo.toString(task.Count, "n0"));
};

MailingListDeduplication.prototype.complete = function (task) {
    var that = this;
    if (task.Type == "ListDeduplication") {
        that.getElement().find(".text-danger").text(kendo.toString(task.ErrorCount, "n0"));
        that.getElement().find(".text-success").text(kendo.toString(task.Count, "n0"));
        that.task = task;
        that.data.Task = that.task;
        that.data.DeduplicatedFile = that.task.Data.deduplicatedPath;
        if (that.task.ErrorGuid == null) {
            $.fancybox.close();
            that.createPreviewGrid();
            that.setupContinueButton(true);
            if (task.ErrorCount === 0) {
                that.removeDuplicatesFromList();
            }
        }
    } else {
        that.task = task;
        that.data.Task = that.task;
        that.data.NumberOfRows = that.task.Count;
        that.data.FinalFile = that.task.Data.finalPath;
        that.data.Part = null;
        $.submitAsForm("/Tools/Mailing/DeliveryOptions/?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), that.data, "data");
    }
};

MailingListDeduplication.prototype.error = function (task) {
    var that = this;
    that.getElement().find(".text-danger").text(task.ErrorCount);
    that.getElement().find(".text-success").text(task.Count);
    that.setupContinueButton(false);
};

MailingListDeduplication.prototype.initialize = function (data) {
    var that = this;
    that.data = data;
    that.getElement().append(kendo.template($(that.options.templates.contentTemplate).html())({
        Sku: getQuerystring("sku"),
        Name: that.options.displayName
    }));
    //that.createPreviewGrid();
    that.taskHub = new TaskHub(function(e) {
        that.update(e);
    }, function (e) {
        that.complete(e);
    }, function (e) {
        that.error(e);
    });
    that.taskHub.deduplicateList(that.data.AddressVerifiedPath,
    [
        { Column: "Full Name", Piece: "FullName" },
        { Column: "Address 1", Piece: "Address1" },
        { Column: "Address 2", Piece: "Address2" },
        { Column: "Address 3", Piece: "Address3" },
        { Column: "City", Piece: "City" },
        { Column: "State", Piece: "State" },
        { Column: "ZIP Code", Piece: "Zip" }
    ]);
    that.setupContinueButton(false);
};

MailingListDeduplication.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

MailingListDeduplication.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    return window[that.options.dataSource];
};

MailingListDeduplication.prototype.createPreviewGrid = function () {
    var that = this;
    that.getElement().find("[data-role=grid]").kendoGrid({
        dataSource: {
            transport: {
                read: function (options) {
                    var url = "/Tools/Mailing/GetListPreview?orderBy=MD5&listPath=" + that.task.Data.deduplicatedPath;
                    $.ajax({
                        url: url,
                        dataType: "json",
                        method: "GET",
                        success: function (result) {
                            var md5Sorter = function (a, b) {
                                var aName = a.MD5.toLowerCase();
                                var bName = b.MD5.toLowerCase();
                                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                            }
                            result.sort(md5Sorter);
                            var currentMd5 = null;
                            $(result).each(function(i, row) {
                                row.Keep = false;
                                row.Last = false;
                                if (currentMd5 == null || currentMd5 != row.MD5) {
                                    currentMd5 = row.MD5;
                                    row.Keep = true;
                                    if (i > 0) {
                                        result[i - 1].Last = true;
                                    }
                                }
                            });
                            options.success(result);
                        }
                    });
                }
            },
            group: { field: "MD5"}
        },
        dataBound: function(e) {
            var checkboxes = that.getElement().find("[data-role=grid]").find(".checkbox_click");
            checkboxes.click(function (e) {
                var box = $(this).find(".checkbox_status");
                var row = $(this).closest("tr");
                var otherBox = null;
                var toggle = function (element, checked) {
                    if (element.hasClass("fa-square-o") && checked) {
                        element.removeClass("fa-square-o").addClass("fa-check-square");
                    } else {
                        element.removeClass("fa-check-square").addClass("fa-square-o");
                    }
                }
                if ($(this).hasClass("remove_dup")) {
                    otherBox = row.find(".checkbox_click.keep_dup").find(".checkbox_status");
                } else {
                    otherBox = row.find(".checkbox_click.remove_dup").find(".checkbox_status");
                }
                toggle(box, true);
                toggle(otherBox, false);
            });
        },
        groupable: true,
        sortable: true,
        selectable: false,
        scrollable: false,
        pageable: false,
        columns: [
            {
                title: "~{FullName}~",
                field: "Fullname"
            },
            {
                title: "~{UploadedAddress}~",
                template: "#if (Address_1 != '') {#${Address_1}<br />#}#" +
                    "#if (Address_2 != '') {#${Address_2}<br />#}#" +
                    "#if (Address_3 != '') {#${Address_3}<br />#}#" +
                    "#if (City != '') {#${City}, #}#" +
                    "#if (State != '') {#${State} #}#" +
                    "#if (ZIP_Code != '') {#${ZIP_Code}#}#"
            },
            {
                title: "~{NumberOfDuplicates}~",
                field: "Count",
                template: "${Count} records"
            },
            {
                template: "<a class='checkbox_click keep_dup'><i class='checkbox_status fa #if (Keep) {#fa-check-square#}else{#fa-square-o#}#'></i><a>",
                width: "150px",
                title: "~{Keep}~"
            },
            {
                template: "<a class='checkbox_click remove_dup'><i class='checkbox_status fa #if (!Keep) {#fa-check-square#}else{#fa-square-o#}#'></i><a>",
                width: "150px",
                title: "~{Remove}~"
            }
        ]
    });
};

MailingListDeduplication.prototype.getColumns = function (sourceColumns) {
    var that = this;
    var cols = new Array();
    $(sourceColumns).each(function (i, col) {
        cols.push({
            title: col.replace(/_/g," "),
            field: col
        });
    });
    return cols;
};