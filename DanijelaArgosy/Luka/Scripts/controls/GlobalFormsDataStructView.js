function GlobalFormsDataStructView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    that.setupEventListeners();
    controlLoader.loadTemplate("GlobalFormsDataStructView", function (template) {
        $(document.body).append(template);
        that.initialize();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

GlobalFormsDataStructView.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_GLOBAL_FORMS_DATA_STRUCT_LOADED";

GlobalFormsDataStructView.prototype.setupEventListeners = function () {
    var that = this;
    $(document).one(that.EVENT_TEMPLATE_LOADED, function () {
        that.refineSearch({});
    });
};

GlobalFormsDataStructView.prototype.options = {};
GlobalFormsDataStructView.prototype.dataLoaded = false;

GlobalFormsDataStructView.prototype.initialize = function () {
    var that = this;
    $(that.options.menuTemplateHref).html($(that.options.menuTemplate).html());
    var data = that.getDataSource();
    var menuViewModel = kendo.observable({
        categories: new kendo.data.ObservableArray(data),
        menuClicked: function (e) {
            if (!that.dataLoaded) return false;
            var data = e.data;
            $('.gfsContainer').hide();
            $('#container_' + data.GlobalFormStructId).show();
        }
    });
    kendo.bind($(that.options.menuBindSection), menuViewModel);
}


GlobalFormsDataStructView.prototype.baseOptions = {
    globalFormsDataStructView: "div[data-argosy-control=GlobalFormsDataStructView]",
    listViewTemplate: "#_gfsTemplate",
    gridRowTemplate: "#_rowTemplate",
    menuTemplateHref: "#_GlobalFormsNavigationMenu",
    menuTemplate: "#_gfsMenuTemplate",
    menuBindSection: "#_gfsMenuBindContainer",
    categoryDataSource: null,
    categories: []
};

GlobalFormsDataStructView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupList();
};

GlobalFormsDataStructView.prototype.setupList = function () {
    var that = this;
    if ($(that.options.globalFormsDataStructView).getKendoListView() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource(),
            groupable: false,
            sortable: false,
            exportToExcel: false,
            template: kendo.template($(that.options.listViewTemplate).html()),
            dataBound: function (e) {
                var count = 1,
                    firstGlobalFormStruct = 0,
                    firedEvent = false;
                if (e.sender.dataSource._data.length <=1) {
                    $(that.options.menuTemplateHref).hide();
                } else {
                    $(that.options.menuTemplateHref).show();
                }
                $(".k-grid", this.element).each(function () {
                    var dom = $(this),
                        category = dom.data("id"),
                        globalFormStructId = dom.data("form");

                    if (count === 1) {
                        count++;
                        firstGlobalFormStruct = globalFormStructId;
                    }
                    dom.kendoGrid({
                        dataSource: that.getGridDataSource({}, category),
                        scrollable: false,
                        sortable: false,
                        pageable: false,
                        rowTemplate: kendo.template($(that.options.gridRowTemplate).html()),
                        dataBound: function (e) {
                            var grid = this;
                            grid.tbody.find('>tr').each(function () {
                                var dataItem = grid.dataItem(this);
                                kendo.bind(this, dataItem);
                                $(this).find("input,select,textarea").change(function (e) {
                                    $(document).trigger(argosyEvents.GLOBAL_PROFILE_FORM_CHANGE, { element: e.target });
                                });
                            });

                            if (firstGlobalFormStruct > 0 && firedEvent === false) {
                                firedEvent = true;
                                $('#container_' + firstGlobalFormStruct).show();
                                that.dataLoaded = true;
                            }
                            $('.loading-' + globalFormStructId).hide();
                        }
                    });
                });
            }
        };
        $(that.options.globalFormsDataStructView).kendoListView(opts);
    } else {
        var listView = $(that.options.globalFormsDataStructView).getKendoListView();
        listView.refresh();
    }
}

GlobalFormsDataStructView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    return window[that.options.categoryDataSource];
};

GlobalFormsDataStructView.prototype.getGridDataSource = function (dataSourceOpts, category) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.requestStart = function (e) {
        var that = this;
    };
    that.dataSourceOpts.requestEnd = function (e) {
        var that = this;
    };
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                globalFormsId: that.options.globalFormsId,
                globalFormsProfileId: that.options.id,
                category: category
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                cache: false,
                url: "/DataView/GetGlobalFormsStructAndData",
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
    that.dataSourceOpts.pageSize = 1000;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalFormsDataStructView.prototype.dataSourceOpts = {};

GlobalFormsDataStructView.prototype.saveGlobalProfileDetails = function () {
    var that = this;
    var data = that.getGlobalFormaDataValuesFromUi();
    var params = { globalFormsData: data.globalFormsDataList };
    if (data.isValidData) {
        block(null, "~{MsgSavingProfile}~");
        $.ajax({
            url: "/DataView/UpdateGlobalFormsStructData",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            method: "POST",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    var listView = $(that.options.globalFormsDataStructView).getKendoListView();
                    listView.refresh();
                } else {
                    prompt.alert({
                        question: result.Message,
                        description: "Ref: " + result.Guid,
                        type: "warning",
                        yes: function (e) {
                            $.fancybox.close();
                        }
                    });
                }
                unblock();
            }
        });
    } else {
        $.fancybox.close();
        setTimeout(function () {
            prompt.alert({
                question: "Please enter all required fields.",
                description: "",
                type: "warning",
                yes: function (e) {
                    $.fancybox.close();
                },
                no: function(e) {
                    $.fancybox.close();
                }
            });
        }, 500);
    }
    return false;
}

GlobalFormsDataStructView.prototype.getGlobalFormaDataValuesFromUi = function () {
    var that = this;
    var globalFormsDataList = [];
    var isValidData = true;

    $(".k-grid._globalFormGrid").each(function () {
        var dom = $(this);

        var grid = dom.getKendoGrid();
        if (grid != null) {
            grid.tbody.find('>tr').each(function () {
                var dataItem = grid.dataItem(this);
                var globalFormsStructData = new Object();
                globalFormsStructData.GlobalFormDataId = dataItem.GlobalFormsDataId;
                globalFormsStructData.GlobalFormStructId = dataItem.GlobalFormStructId;
                globalFormsStructData.GlobalFormsProfileId = dataItem.GlobalFormsProfileId;
                globalFormsStructData.DataSource = null;
                var controlType = (dataItem.ControlType  && dataItem.ControlType !== "") ? dataItem.ControlType.toUpperCase() : "";
                switch (controlType) {
                    case "TEXTAREA":
                        var textArea = $("#struct_" + dataItem.GlobalFormStructId);
                        globalFormsStructData.Value = textArea.val();
                        break;
                    case "CALENDAR":
                        var calendar = $("#struct_" + dataItem.GlobalFormStructId).getKendoDatePicker();
                        globalFormsStructData.Value = calendar.value();
                        break;
                    case "TEXTBOX":
                        var textBox;
                        if (dataItem.Mask != null && dataItem.Mask.ControlType != 'NumericTextBox') {
                            textBox = $("#struct_" + dataItem.GlobalFormStructId).getKendoMaskedTextBox();
                            globalFormsStructData.Value = textBox.value();
                        } else if (dataItem.Mask != null && dataItem.Mask.ControlType == 'NumericTextBox') {
                            textBox = $("#struct_" + dataItem.GlobalFormStructId).getKendoNumericTextBox();
                            globalFormsStructData.Value = textBox.value();
                        } else {
                            textBox = $("#struct_" + dataItem.GlobalFormStructId);
                            globalFormsStructData.Value = textBox.val();
                        }
                        break;
                    case "IMAGEUPLOAD":
                        var imageUpload = $("#struct_" + dataItem.GlobalFormStructId).getKendoImageEditor();
                        if (imageUpload != null) {
                            globalFormsStructData.Value = imageUpload.value();
                        } else {
                            globalFormsStructData.Value = "";
                        }
                        break;
                    case "IMAGEBANK":
                        globalFormsStructData.Value = qualifyURL($("#struct_" + dataItem.GlobalFormStructId).val());
                        globalFormsStructData.DataSource = $("#struct_" + dataItem.GlobalFormStructId + "_dataSource").val();
                        break;
                    case "DROPDOWNLIST":
                        var dropDownList = $("#struct_" + dataItem.GlobalFormStructId).getKendoDropDownList();
                        if (dropDownList) {
                            globalFormsStructData.Value = dropDownList.value();
                        }
                        break;
                    default:
                        var defaultTextBox;
                        if (dataItem.Mask != null && dataItem.Mask.ControlType != 'NumericTextBox') {
                            defaultTextBox = $("#struct_" + dataItem.GlobalFormStructId).getKendoMaskedTextBox();
                            globalFormsStructData.Value = defaultTextBox.value();
                        } else if (dataItem.Mask != null && dataItem.Mask.ControlType == 'NumericTextBox') {
                            defaultTextBox = $("#struct_" + dataItem.GlobalFormStructId).getKendoNumericTextBox();
                            globalFormsStructData.Value = defaultTextBox.value();
                        } else {
                            defaultTextBox = $("#struct_" + dataItem.GlobalFormStructId);
                            globalFormsStructData.Value = defaultTextBox.val();
                        }
                        break;
                }
                if (dataItem.IsRequired && (globalFormsStructData.Value == null || globalFormsStructData.Value.trim().length === 0)) {
                    isValidData = false;
                }
                if (globalFormsStructData.GlobalFormsProfileId != null) {
                    globalFormsDataList.push(globalFormsStructData);
                }
            });

        }

    });

    return {
        globalFormsDataList: globalFormsDataList,
        isValidData: isValidData
    };
}




