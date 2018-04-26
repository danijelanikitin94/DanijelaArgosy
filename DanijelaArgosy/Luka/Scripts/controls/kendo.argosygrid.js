(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var ArgosyGrid = Widget.extend({
        init: function (element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this.setupSearch(options);
            this.setupExcelToolbar(options);
            this.setupDataBoundEvent(options);
            this.setupKendoGrid(options, element);
            addArgosyActions(this.element.parent().parent());
            kendo.bind(this.element.parent().parent().find(".search-grid"));
            //$(document).trigger(argosyEvents.PAGE_DOM_CHANGE, this.element.parent().parent());
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "ArgosyGrid",
            // search options this is going to be used to generate the search controls for our
            // version of kendo grids
            search: [],
            // defaults to true, false will hide the checkboxes
            checkboxes: true,
            // defaults to true, false will hide the export excel
            exportToExcel: true,
            excel: {
                allPages: true
            },
            useEventToGetExcelData: false
        },
        setupKendoGrid: function (options, element) {
            var that = this;
            var grid = $(element);
            var autoBindSetting = options.autoBind;
            options.autoBind = false;
            that.setupExportColumns(options);
            that.exportFlag = false;
            grid.kendoCustomGrid(options);
            var kendoGrid = grid.getKendoGrid();
            kendoGrid.bind("preExcelExport", function (e) {
                that.showExportColumns(kendoGrid);
            });
            kendoGrid.bind("postExcelExport", function (e) {
                that.hideExportColumns(kendoGrid);
            });
            if (options.dataSource != null) {
                options.dataSource.bind("requestStart", function (e) {
                    var previousRequestStart = options.dataSource.requestStart;
                    $(document).trigger(argosyEvents.START_LOADING, { element: grid.parent().parent() });
                    if (previousRequestStart != null) {
                        previousRequestStart(e);
                    }
                });
                options.dataSource.bind("requestEnd", function (e) {
                    var previousRequestEnd = options.dataSource.requestEnd;
                    $(document).trigger(argosyEvents.END_LOADING, { element: grid.parent().parent() });
                    if (previousRequestEnd != null) {
                        previousRequestEnd(e);
                    }
                });
            }
            if (autoBindSetting) {
                that.searchGrid(false);
            }
        },
        setupExportColumns: function (options) {
            var that = this;
            that.hiddenColumns = [];
            $(options.columns).each(function(i) {
                if (this.hidden) {
                    that.hiddenColumns.push(i);
                }
            });
        },
        setupExcelToolbar: function (options) {
            var that = this;
            if (that.options.exportToExcel) {
                var excelIndex = -1;
                if (options.toolbar != null) {
                    $(options.toolbar).each(function(i) {
                        if (($(this).is("string") && this.toLowerCase() == "excel") || this.name.toLowerCase() == "excel") {
                            excelIndex = i;
                        }
                    });
                } else {
                    options.toolbar = [];
                }
                var exportToExcelTemplate = "<a class='k-button k-button-icontext k-grid-export-excel hidden-sm hidden-xs '><span class=''></span><i class='fa fa-file-excel-o'></i></a> ";
                if (excelIndex > -1) {
                    options.toolbar.splice(excelIndex, 1, { template: exportToExcelTemplate });
                } else {
                    options.toolbar.splice(0, 0, { template: exportToExcelTemplate });
                }
                options.excel = {
                    fileName: location.pathname.substring(1).replace(/\//, '-') + "." + kendo.toString(new Date(), "MM-dd-yyyy") + ".xlsx",
                    proxyURL: "/DataView/ExportExcelSave",
                    filterable: true,
                    allPages: true
                };
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
        setupDataBoundEvent: function (options) {
            var that = this;
            var originalDataBoundEvent = null;
            if (options.dataBound != null) {
                originalDataBoundEvent = options.dataBound;
            }

            options.dataBound = function (e) {
                that.setupAdvancedSearchButtons(e);
                that.setupExportToExcelButton(e);
                if (originalDataBoundEvent != null) {
                    originalDataBoundEvent(e);
                }
            };
        },
        setupExportToExcelButton: function (e) {
            var that = this;
            var grid = e.sender.element;
            var exportToExcelButton = grid.find(".fa-file-excel-o").parent();
            exportToExcelButton.unbind("click");
            exportToExcelButton.click(function (z) {
                that.exportToExcelQuestion(z);
            });
        },
        exportToExcelQuestion: function (e) {
            var that = this;
            var grid = $(e.currentTarget).closest(".k-grid");
            var kendoGrid = grid.getKendoGrid();
            var totalRecords = kendoGrid.dataSource._total;
            if (totalRecords > 500 && totalRecords <= 10000) {
                prompt.alert({
                    question: "Are you sure you want to export all " + kendo.toString(totalRecords, "n0") + " records to excel?",
                    description: "This process may take a long time to complete.",
                    button: "Export to Excel",
                    type: "warning",
                    yes: function(e) {
                        if (typeof (e.preventDefault) === "function") {
                            $.fancybox.close();
                            that.exportToExcel(kendoGrid);
                        }
                    }
                });
            } else if (totalRecords > 10000) {
                prompt.alert({
                    question: "You are limited to exporting 10,000 records at a time.  There are " + kendo.toString(totalRecords, "n0") + " records total.",
                    description: "Please use advanced search to refine your results or create a custom report.",
                    button: "Close",
                    type: "warning",
                    yes: function (e) {
                        if (typeof (e.preventDefault) === "function") {
                            $.fancybox.close();
                            that.exportToExcel(kendoGrid);
                        }
                    }
                });
            } else {
                that.exportToExcel(kendoGrid);
            }
        },
        exportToExcel: function (kendoGrid) {
            var that = this;
            if (that.options.useEventToGetExcelData) {
                $(document).one(argosyEvents.EVENT_SEND_EXCEL_DATASOURCE, function (e, data) {
                    var records = data.records;
                    var cells = new Array();
                    var properties = new Array();
                    var colWidths = new Array();
                    for (var property in records[0]) {
                        if (records[0].hasOwnProperty(property)) {
                            properties.push(property);
                            colWidths.push({ autoWidth: true });
                            cells.push({
                                value: property
                            });
                        }
                    }
                    var rows = [{
                        cells: cells
                    }];
                    for (var i = 0; i < records.length; i++) {
                        var dataCell = new Array();
                        for (var x = 0; x < properties.length; x++) {
                            dataCell.push({
                                value: records[i][properties[x]]
                            });
                        }
                        rows.push({
                            cells: dataCell
                        });
                    }
                    var workbook = new kendo.ooxml.Workbook({
                        sheets: [
                          {
                              columns: colWidths,
                              // Title of the sheet
                              title: "DataExport",
                              // Rows of the sheet
                              rows: rows
                          }
                        ]
                    });
                    //save the file as Excel file with extension xlsx
                    kendo.saveAs({ dataURI: workbook.toDataURL(), fileName: location.pathname.substring(1).replace(/\//, '-') + "." + kendo.toString(new Date(), "MM-dd-yyyy") + ".xlsx" });
                });
                $(document).trigger(argosyEvents.EVENT_REQUEST_EXCEL_DATASOURCE);
            } else {
                $.blockUI({ message: '<h1>Generating Excel...</h1>' });
                kendoGrid.saveAsExcel();
                // Todo: We need to figure out a download complete event that can be fired.  Since we block over 200 results this works for now. acormier
                setTimeout(function(e) {
                    $.unblockUI();
                },2000);
                $.fancybox.close();
            }
        },
        setupAdvancedSearchButtons: function (e) {
            var that = this;
            var grid = e.sender.element;
            var searchContainer = grid.parent().parent().find(".search-grid");
            var showAdvancedButton = grid.find(".showAdvancedSearch");
            var hideAdvancedButton = searchContainer.parent().find(".hideSearchCriteria");
            var searchToolbarSubmit = grid.find(".k-keyword-search-button");

            searchToolbarSubmit.unbind("click");
            searchToolbarSubmit.click(function (e) {
                that.searchGrid(false);
            });

            grid.find("*[data-argosy-search]").each(function () {
                var input = $(this);
                if (input.is("div") && $(input).find("input[type='checkbox']").length > 0) {
                    var chkbox = $(input).find("input[type='checkbox']");
                    chkbox.unbind("change");
                    chkbox.change(function (e) {
                        that.searchGrid(true);
                    });
                }
                else if (input.is("select")) {
                    input.unbind("change");
                    input.change(function (e) {
                        that.searchGrid(false);
                    });
                } else {
                    input.unbind("keypress");
                    input.keypress(function (e) {
                        that.setFormSubmit(e, false);
                    });
                }
            });

            showAdvancedButton.unbind("click");
            showAdvancedButton.click(function (event) {
                var wrapperWidth = that.getWrapperColumnWidth();
                that.setupToolbarInputLinkage(true);
                grid.parent().removeClass("col-sm-" + wrapperWidth).addClass("col-sm-" + (wrapperWidth - 2));
                searchContainer.parent().css("padding-top", that.getToolbarHeight(grid));
                searchContainer.parent().show("slow");
                showAdvancedButton.closest(".k-keyword-search").hide("slow");
            });

            hideAdvancedButton.unbind("click");
            hideAdvancedButton.click(function (event) {
                var wrapperWidth = that.getWrapperColumnWidth();
                that.setupToolbarInputLinkage(false);
                grid.parent().removeClass("col-sm-" + wrapperWidth).addClass("col-sm-" + (wrapperWidth + 2));
                grid.parent().parent().find(".search-grid").parent().hide("slow");
                showAdvancedButton.closest(".k-keyword-search").show("slow");
            });
        },
        getToolbarHeight: function (grid) {
            if (screen.width > 480) {
                return grid.find(".k-grid-toolbar").height() + parseInt(grid.find("table[role=grid]").css("margin-top")) + parseInt(grid.find(".k-grid-toolbar").css("margin-bottom"));
            }
        },
        setupSearch: function (options) {
            if (options.search != null && options.search.length > 0) {
                var advancedSearchFields = [];
                var toolbarSearchFields = [];
                $(options.search).each(function (i) {
                    if (this.toolbar != null && this.toolbar) {
                        toolbarSearchFields.push(this);
                    } else {
                        advancedSearchFields.push(this);
                    }
                });
                this.setupSearchToolbar(options, toolbarSearchFields, advancedSearchFields.length > 0);
                this.setupAdvancedSearch(options, options.search);
            }
        },
        setupToolbarInputLinkage: function (showingAdvanced) {
            var that = this;
            var toolbar = that.element.find(".k-grid-toolbar");
            var searchContainer = that.element.parent().parent().find(".search-grid");
            if (showingAdvanced) {
                toolbar.find("*[data-argosy-search]").each(function () {
                    var element = $(this);
                    var searchContainerInput = searchContainer.find("*[data-argosy-search=" + element.attr("data-argosy-search") + "]");
                    if (searchContainerInput.length > 0) {
                        that.updateInputValue(searchContainerInput[0], element);
                    }
                });
            } else {
                searchContainer.find("*[data-argosy-search]").each(function () {
                    var element = $(this);
                    var toolbarInput = toolbar.find("*[data-argosy-search=" + element.attr("data-argosy-search") + "]");
                    if (toolbarInput.length > 0) {
                        that.updateInputValue(toolbarInput[0], element);
                    }
                });
            }
        },
        setupAdvancedSearch: function (options, searchInputs) {
            var that = this;
            if (searchInputs.length > 0) {
                var searchWrapper = $("<div />", {
                    'class': "search-grid"
                });
                searchWrapper.append($("<h4 />", {
                    text: "~{Search}~",
                    'class': "text-center"
                }));
                $(searchInputs).each(function (i) {
                    //todo: this needs to get fixed so we uniformly define these search controls.
                    var wrapperDiv = $("<div />", {
                        'class': (i == 0 ? "padb5 padu10 w100" : "padb5 w100")
                    });
                    var input;
                    if (this["data-role"] != null) {
                        input = $("<" + this.type + " />", {
                            'data-role': this["data-role"],
                            'data-argosy-search': this.name
                        });
                    } else {
                        input = $(that.getInput(this, false));
                        
                        if (input.is("div") && $(input).find("input[type='checkbox']").length > 0) {
                            var chkbox = $(input).find("input[type='checkbox']");
                            chkbox.unbind("change");
                            chkbox.change(function(e) {
                                that.searchGrid(true);
                            });
                        } else if (input.is("select")) {
                            input.unbind("change");
                            input.change(function(e) {
                                that.searchGrid(true);
                            });
                        } else {
                            input.unbind("keypress");
                            input.keypress(function(e) {
                                that.setFormSubmit(e, true);
                            });
                        }
                    }
                    input.addClass("w90");
                    wrapperDiv.append(input);
                    searchWrapper.append(wrapperDiv);
                });

                // the search container requires a 2 col width.
                var colWrapper = $("<div />", {
                    'class': "hide col-sm-2 padr20"
                });

                colWrapper.append(searchWrapper);
                colWrapper.append(this.buildSearchButton());
                colWrapper.append(this.buildHideSearchLink());

                colWrapper.find(".search-grid-btn").click(function (e) {
                    that.searchGrid(true);
                });

                this.element.parent().before(colWrapper);
            }
        },
        setFormSubmit: function (event, isAdvancedSearch) {
            var that = this;
            if (event.keyCode == 13) {
                that.searchGrid(isAdvancedSearch);
                if (event.preventDefault()) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }
            event.returnValue = true;
        },
        getSearchObject: function (isAdvancedSearch) {
            var that = this;
            var searchContainer = (!isAdvancedSearch) ? that.element.find(".k-keyword-search") : that.element.parent().parent().find(".search-grid");
            var inputControls = searchContainer.find("*[data-argosy-search]");
            var searchObject = {};
            $(inputControls).each(function (i) {
                var item = $(this);
                var property = item.attr("data-argosy-search");
                searchObject[property] = getInputValue(item);
            });
            return searchObject;
        },
        getWrapperColumnWidth: function () {
            var classes = this.element.parent().attr("class").split(" ");
            var colCount = 0;
            $(classes).each(function () {
                if (this.indexOf("col-sm-") > -1) {
                    colCount = parseInt(this.replace("col-sm-", ""));
                } else if (this.indexOf("col-md-") > -1) {
                    colCount = parseInt(this.replace("col-md-", ""));
                }
            });
            return colCount;
        },
        buildSearchButton: function () {
            var that = this;
            var div = $("<div />", {
                'class': "search-grid-btn finger"
            });
            var link = $("<a />", {
                'class': "btn btn-primary btn-block",
                text: "~{Search}~"
            });
            div.append(link);
            return div;
        },
        buildHideSearchLink: function () {
            var that = this;
            var div = $("<div />", {
                'class': "padu10 hideSearchCriteria finger show"
            });
            var link = $("<a />", {
                html: "<i class='fa fa-chevron-circle-left'></i> ~{HideSearchCriteria}~"
            });
            div.append(link);
            return div;
        },
        setupSearchToolbar: function (options, searchInputs, hasAdvancedSearch) {
            if (searchInputs.length > 0) {
                if (options.toolbar == null) {
                    options.toolbar = [];
                }
                options.toolbar.splice(0, 0, this.buildSearchToolbar(searchInputs, hasAdvancedSearch));
            }
        },
        buildSearchToolbar: function (searchInputs, hasAdvancedSearch) {
            var that = this;
            var wrapperDiv = $("<div />", {
                'class': "k-keyword-search"
            });
            $(searchInputs).each(function (i) {
                var input = $(that.getInput(this, true));
                input.unbind("keypress");
                input.keypress(function (e) {
                    that.setFormSubmit(e);
                });
                wrapperDiv.append(input);
            });
            var searchButton = $("<a class='k-button-nbkg k-keyword-search-button'><i class='fa fa-search'></i></a>");
            wrapperDiv.append(searchButton);
            if (hasAdvancedSearch) {
                wrapperDiv.append($("<a class='nowrap k-link floatl showAdvancedSearch padl20'><span class='hidden-sm hidden-xs'>~{AdvancedSearch}~ <i class='fa fa-plus-circle'></i></span></a>"));
            }
            return {
                name: "grid-search",
                template: wrapperDiv.outerHtml()
            }
        }, 
        searchGrid: function (isAdvancedSearch) {
            var that = this;
            $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, that.getSearchObject(isAdvancedSearch));
        },
        updateInputValue: function (updateInput, originalInput) {
            var that = this;
            updateInput = $(updateInput);
            originalInput = $(originalInput);

            setInputValue(updateInput, getInputValue(originalInput));
        },
        getInput: function (search, isToolbar) {
            if (search.placeholder != null && (search.type == "text" || search.type=="number")) {
                search.placeholder = this.getPlaceholder(search, isToolbar);
            }
            search.dataArgosySearch = search.name;
            return getInputControl(search.type, search);
        },
        getPlaceholder: function (search, isToolbar) {
            if (search.placeholder != null) {
                return (search.placeholder.length > 20 && !isToolbar ? search.name : search.placeholder); //APM
            } else {
                return search.name;
            }
        }
    });
    ui.plugin(ArgosyGrid);
})(jQuery);