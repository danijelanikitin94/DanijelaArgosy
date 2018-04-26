(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var CollapseGrid = Widget.extend({
        init: function (element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this.setupRequiredElements(element, options);
            this.setupToolbar(options);
            this.setupDataBoundEvent(options);
            this.setupView(element, options);
            this.setupAnimations(element);
            addArgosyActions(element);
            //$(document).trigger(argosyEvents.PAGE_DOM_CHANGE, this.element);
        },
        setupView: function(element, options) {
            switch (options.type) {
                case "list":
                    this.setupListView(element, options);
                    break;
                default:
                    this.setupGridView(element, options);
                    break;
            }
        },
        setupListView: function (element, options) {
            var grid = $(element).find(".k-collapse-grid");
            if (options.template == null) {
                options.template = '<label class="marr10 keyword-box"> <i class="fa fa-times co-warning" title="Delete Filter"></i> ${' + options.labelProperty + '}</label>';
            }
            var originalDataBoundEvent = options.dataBound;
            options.dataBound = function (e) {
                grid.find(".keyword-box").each(function (i) {
                    var uid = $(this).attr("data-uid");
                    var data = null;
                    $(e.sender.dataSource._data).each(function () {
                        if (uid == this.uid) {
                            data = this;
                        }
                    });
                    var icon = $(this).find(".co-warning");
                    icon.unbind("click");
                    icon.click(function (ev) {
                        if (options.remove != null) {
                            options.remove({
                                data: data
                            });
                        }
                    });
                });
                if (originalDataBoundEvent != null) {
                    originalDataBoundEvent(e);
                }
            };

            if (options.altTemplate == null) { }

            grid.kendoListView(options);
        },
        setupExportColumns: function (options) {
            var that = this;
            that.exportFlag = false;
            that.hiddenColumns = [];
            $(options.columns).each(function (i) {
                if (this.hidden) {
                    that.hiddenColumns.push(i);
                }
            });
        },
        setupGridView: function (element, options) {
            var that = this;
            var grid = $(element).find(".k-collapse-grid");
            that.setupExportColumns(options);
            if (options.pageable == null) {
                options.pageable = {};
            }
            if (options.pageable.messages == null) {
                options.pageable.messages = {};
            }
            if (options.type == "list") {
                options.selectable = false;
            }
            options.pageable.numeric = false;
            options.pageable.pageSize = that.options.rows;
            options.dataSource.pageSize(that.options.rows);
            options.pageable.refresh = false;
            options.pageable.messages.itemsPerPage = "";
            options.autoBind = false;
            that.exportFlag = false;
            /*if (options.dataSource != null) {
                options.dataSource.bind("requestStart", function (e) {
                    var previousRequestStart = options.dataSource.requestStart;
                    $(document).trigger(argosyEvents.START_LOADING, { element: grid.parent() });
                    if (previousRequestStart != null) {
                        previousRequestStart(e);
                    }
                });
                options.dataSource.bind("requestEnd", function (e) {
                    var previousRequestEnd = options.dataSource.requestEnd;
                    $(document).trigger(argosyEvents.END_LOADING, { element: grid.parent() });
                    if (previousRequestEnd != null) {
                        previousRequestEnd(e);
                    }
                });
            }*/
            grid.kendoCustomGrid(options);
            var kendoGrid = grid.getKendoGrid();
            kendoGrid.bind("preExcelExport", function (e) {
                that.showExportColumns(kendoGrid);
            });
            kendoGrid.bind("postExcelExport", function (e) {
                that.hideExportColumns(kendoGrid);
            });
        },
        getKendoGrid: function () {
            switch (this.options.type) {
                case "list":
                    return null;
                default:
                    return $(this.element).find(".k-collapse-grid").getKendoGrid();
            }
        },
        getKendoListView: function () {
            switch (this.options.type) {
                case "list":
                    return $(this.element).find(".k-collapse-grid").getKendoListView();
                default:
                    return null;
            }
        },
        toggle: function() {
            var that = this;
            
            var toggle = that.element.find(".k-command-expand-grid");
            toggle.click();
        },
        setupDataBoundEvent: function (options) {
            var that = this;
            var originalDataBoundEvent = null;
            if (options.dataBound != null) {
                originalDataBoundEvent = options.dataBound;
            }

            options.dataBound = function (e) {
                that.setupExportToExcelButton(e);
                if (originalDataBoundEvent != null) {
                    originalDataBoundEvent(e);
                }
            };
        },
        setupExportToExcelButton: function (e) {
            var that = this;
            var exportToExcelButton = that.options.toolbarElement.find(".fa-file-excel-o").parent();
            exportToExcelButton.unbind("click");
            exportToExcelButton.click(function (z) {
                that.exportToExcelQuestion(z);
            });
        },
        exportToExcelQuestion: function (e) {
            var that = this;
            var kendoGrid = that.options.gridElement.getKendoGrid();
            var totalRecords = kendoGrid.dataSource._total;
            if (totalRecords > 500) {
                prompt.alert({
                    question: "Are you sure you want to export all " + kendo.toString(totalRecords, "n0") + " records to excel?",
                    description: "This process may take a long time to complete.",
                    button: "Export to Excel",
                    type: "warning",
                    yes: function (e) {
                        that.exportToExcel(kendoGrid);
                    }
                });
            } else {
                that.exportToExcel(kendoGrid);
            }
        },
        showExportColumns: function (kendoGrid) {
            var that = this;
            $(that.hiddenColumns).each(function () {
                kendoGrid.showColumn(parseInt(this.toString()));
            });
        },
        hideExportColumns: function (kendoGrid) {
            var that = this;
            $(that.hiddenColumns).each(function () {
                kendoGrid.hideColumn(parseInt(this.toString()));
            });
        },
        exportToExcel: function (kendoGrid) {
            var that = this;
            $.blockUI({ message: '<h1>Generating Excel...</h1>' });
            kendoGrid.saveAsExcel();
            // Todo: We need to figure out a download complete event that can be fired.  Since we block over 200 results this works for now. acormier
            setTimeout(function (e) {
                $.unblockUI();
            }, 2000);
            $.fancybox.close();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "CollapseGrid",
            // supported options are 'grid' and 'list'
            type: "grid",
            // defaults to true, false will hide the export excel
            exportToExcel: true,
            rows: 5
        },
        setupAnimations: function (element) {
            element = $(element);
            var grid = $(element).find(".k-collapse-grid");
            var toolbar = $(element).find(".k-collapse-toolbar");
            var listToolbar = $(element).find(".k-collapse-list-toolbar");
            var collapseIcon = toolbar.find(".k-command-expand-grid").find("i.fa");
            var animateButton = $(element).find(".k-collapse-toolbar").find(".k-command-expand-grid");

            animateButton.unbind("click");
            animateButton.click(function (e) {
                if (!grid.is(":visible")) {
                    collapseIcon.removeClass("fa-plus-circle").addClass("fa-minus-circle");
                    var kendoGrid = $(element).find(".k-collapse-grid").getKendoGrid();
                    if (kendoGrid) {
                        kendoGrid.dataSource.read();
                        kendoGrid.refresh();
                    }
                    grid.show();
                    listToolbar.show();
                } else {
                    collapseIcon.removeClass("fa-minus-circle").addClass("fa-plus-circle");
                    grid.hide();
                    listToolbar.hide();
                }
            });

            grid.hide();
            listToolbar.hide();
        },
        setupRequiredElements: function (element, options) {
            element = $(element);
            element.addClass("maru10");
            var gridElement = $("<div />", { 'class': "k-collapse-grid maru10" });
            var toolbarElement = $("<div />", { 'class': "k-collapse-toolbar grid-information" });
            var listViewToolbar = $("<div />", { 'class': "k-collapse-list-toolbar" });
            switch (options.type) {
                case "list":
                    element.append(toolbarElement);
                    element.append(listViewToolbar);
                    element.append(gridElement);
                    this.options.gridElement = element.find(".k-collapse-grid");
                    this.options.toolbarElement = element.find(".k-collapse-toolbar");
                    this.options.listViewToolbarElement = element.find(".k-collapse-list-toolbar");
                    break;
                default:
                    element.append(toolbarElement);
                    element.append(gridElement);
                    this.options.gridElement = element.find(".k-collapse-grid");
                    this.options.toolbarElement = element.find(".k-collapse-toolbar");
            }
            if (options.notes != null) {
                this.element.find(".grid-information").after("<em>" + options.notes + "</em>");
            }
        },
        setupToolbar: function (options) {
            var that = this;
            this.title = options.title == null ? "No Title" : options.title;
            this.options.toolbarElement.append(this.getTitleElement());
            switch (options.type) {
                case "list":
                    that.setupListToolbar(options);
                    break;
                default:
                    that.setupGridToolbar(options);
            }
        },
        setupExcelToolbar: function (options) {
            var that = this;
            if (that.options.exportToExcel) {
                var excelIndex = -1;
                if (options.toolbar != null) {
                    $(options.toolbar).each(function (i) {
                        if ($(this).is("string")) {//for toolbar text this.name is undefined as it is coming as non string
                            if (($(this).is("string") && this.toLowerCase() == "excel") || this.name.toLowerCase() == "excel" || this.name.toLowerCase() == "exportexcel") {
                                excelIndex = i;
                            }
                        }
                    });
                } else {
                    options.toolbar = [];
                }

                //return $('<a class="k-grid-' + command.name + '">' + command.text + ' <i class="' + command.class + '"></i></a>');
                var exportToExcelTemplate = {
                    name: "export-excel",
                    text: "",
                    'class': "fa fa-file-excel-o"
                };
                if (excelIndex > -1) {
                    options.toolbar.splice(excelIndex, 1, exportToExcelTemplate);
                } else {
                    options.toolbar.splice(0, 0, exportToExcelTemplate);
                }
                options.excel = {
                    fileName: location.pathname.substring(1).replace(/\//, '-') + "." + kendo.toString(new Date(), "MM-dd-yyyy") + ".xlsx",
                    proxyURL: "/DataView/ExportExcelSave",
                    filterable: true,
                    allPages: true
                };
            }
        },
        setupListToolbar: function (options) {
            var that = this;
            this.setupExcelToolbar(options);
            if (options.toolbar != null) {
                this.toolbar = options.toolbar;

                var commandElement = $("<div />", {
                    'class': "w100 padu8"
                });

                $(options.toolbar).each(function () {
                    commandElement.append(that.getListCommandElement(this));
                });
                this.options.listViewToolbarElement.append(commandElement);

                that.setupCommandEvents(options);
                options.toolbar = null;
            }
        },
        setupGridToolbar: function (options) {
            var that = this;
            this.setupExcelToolbar(options);
            if (options.toolbar != null) {
                this.toolbar = options.toolbar;

                var commandElement = $("<div />", {
                    'class': "floatr padu8"
                });

                $(options.toolbar).each(function () {
                    commandElement.append(that.getCommandElement(this));
                });

                this.options.toolbarElement.append(commandElement);

                that.setupCommandEvents(options);

                options.toolbar = null;
            }
        },
        setupCommandEvents: function(options) {
            // bind the kendo option events defined and passed;
            $(options.toolbar).each(function () {
                var eventProperty = this.name;
                var commandClass = ".k-grid-" + eventProperty;
                if (options[eventProperty] != null && $.isFunction(options[eventProperty])) {
                    $(commandClass).unbind("click");
                    $(commandClass).click(function (e) {
                        e.input = $(commandClass).closest("div").find(".k-command-input-element");
                        options[eventProperty](e);
                    });
                }
            });
        },
        getListCommandElement: function (command) {
            var inputElement = $('<span />', {
                'class': "w85"
            }).append(getInputControl(command.input, { placeholder: command.placeholder, 'class': 'k-command-input-element'}));
            var buttonElement = $('<span class="padl10 padu5"><a class="k-grid-' + command.name + '">' + command.text + ' <i class="' + command["class"] + '"></i></a></div>');
            var commandElement = $("<div />");
            commandElement.append(inputElement);
            commandElement.append(buttonElement);
            return commandElement;
        },
        getCommandElement: function (command) {
            var dataId = "";
            if (command.hasOwnProperty("data-id")) {
                dataId = 'data-id="' + command["data-id"]+'"';
            }
            return $('<a class="k-grid-' + command.name + '" '+dataId+'>' + command.text + ' <i class="' + command["class"] + '"></i></a>');
        },
        getTitleElement: function() {
            var titleElement = $("<div />", {
                'class': "floatl finger k-command-expand-grid"
            });

            var h3TitleElement = $("<h3 />", {
                'class': "nopad"
            });

            h3TitleElement.append('<i class="fa fa-plus-circle"></i> ' + this.title);
            titleElement.append(h3TitleElement);
            return titleElement;
        }
    });
    ui.plugin(CollapseGrid);
})(jQuery);