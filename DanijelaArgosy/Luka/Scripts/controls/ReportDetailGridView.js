function ReportDetailGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("Reporting", function (template) {
        that.TEMPLATE = $(template);
        $(document.body).append(template);
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);

    });

    $(document).bind(argosyEvents.EVENT_REQUEST_EXCEL_DATASOURCE, function (e, data) {
        that.search(10000, false, "~{GeneratingExcelReport}~");
    });

    that.search();
}
ReportDetailGridView.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_REPORTING_LOADED";
ReportDetailGridView.prototype.TEMPLATE = null;

ReportDetailGridView.prototype.options = {};

ReportDetailGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=ReportDetailGridView]",
    templateSelectColumns: "#_ModalSelectReportColumns",
    templateReportFilters: "#_ModalSelectReportFilters",
    templateReportDateFilters: "#_ModalReportSelectDateFilters",
    templateReportUsers: "#_ModalSelectReportUsers",
    templateReportSummary: "#_ModalSummarizeReport",
    templateReportSave: "#_ModalSaveReport",
    fancyboxReportColumnsHref: "div[id=_ModalReportColumns]",
    fancyboxReportFiltersHref: "div[id=_ModalReportFilters]",
    fancyboxReportDateFiltersHref: "div[id=_ModalReportDateFilters]",
    fancyboxReportUsersHref: "div[id=_ModalReportUsers]",
    fancyboxReportSummary: "div[id=_ModalReportGroupByColumns]",
    fancyboxReportSaveHref: "div[id=_ModalReportSave]"
};

ReportDetailGridView.prototype.properties = {
    Report: null,
    TotalCount: 0,
    SelectedColumns: [],
    OrigSelectedColumns: [],
    AvailableColumns: [],
    ReportColumnList: [],
    RptDataSrc: [],
    ReportGroupColumnList: [],
    SelectedUserIds: [],
    SelectedFilters: [],
    SelectedDates: [],
    SelDateFilterValue: "",
    XmlLoad: true,
    FiltersColumnList: [],
    CurrPageSize: 100,
    PrevPageSize: 100,
    HasGrouping: false,
    GroupByColumns: [],
    SelRepColumnIds: [],
    SelFilterIds: [],
    SelectedUserIdList: [],
    GridGroupByColsDataSrc: [],
    DateFormatValue: "",
    DateFormatNode: "",
    ReportConfigId: "",
    ReportName: "",
    ReportOperation: "",
    ReportDateRangeText: "",
    CurrentPage: 1,
    CurrPage: 1,
    Sort: {},
    NeedtoClearGridContent: false
};

ReportDetailGridView.prototype.gridEvent = {
    IsPagerEvent: false,
    PageSizeEvent: false,
    NeedsToRefresh: false,
    ReportInit: false
}

ReportDetailGridView.prototype.searchCriteria = {};

ReportDetailGridView.prototype.search = function (pageSize, updateUi, loadingMessage) {
    var that = this;
    var search = new Object();
    if (pageSize == null) {
        pageSize = that.properties.CurrPageSize;
    }
    if (updateUi == null) {
        updateUi = true;
    }
    if (loadingMessage == null) {
        loadingMessage = "~{LoadingReport﻿}~";
    }
    search.CompanyId = that.options.companyId;
    search.SiteId = that.options.siteId;
    search.SelColIds = that.properties.SelRepColumnIds;
    search.SelFilterIds = that.properties.SelFilterIds.length > 0 ? that.properties.SelFilterIds : that.properties.FiltersColumnList;
    search.SelUserIds = that.properties.SelectedUserIds;
    search.DateFilterValue = that.properties.SelDateFilterValue == "" && !that.properties.XmlLoad ? "11" : that.properties.SelDateFilterValue;
    search.DateStart = (that.properties.SelectedDates && that.properties.SelectedDates.length > 0) != null ? that.properties.SelectedDates[0] : null;
    search.EndDate = (that.properties.SelectedDates && that.properties.SelectedDates.length > 1) != null ? that.properties.SelectedDates[1] : null;
    search.DateFormatValue = that.properties.DateFormatNode;
    search.GroupByColumns = that.properties.GroupByColumns;
    search.ReportConfigId = that.options.reportConfigId;
    search.ReportId = that.options.reportId;
    search.XmlLoad = that.properties.XmlLoad;//Load from db
    search.Take = pageSize;
    search.Skip = 0;
    search.PageSize = pageSize;

    var grid = $(that.options.gridViewSelector).getKendoGrid();

    if (grid != null) {
        if (grid.dataSource.sort() != undefined) {
            search.Sort = grid.dataSource.sort();
            ReportDetailGridView.prototype.properties.Sort = grid.dataSource.sort();
        }
    }

    if (that.properties.CurrentPage == 0) that.properties.CurrentPage = 1;

    search.Page = that.properties.CurrentPage;

    var params = { search: search };

    block(null, loadingMessage, false);
    $.ajax({
        url: "/Admin/Reports/GetDetailReport",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        cache: false,
        processData: false,
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Failed) {
                handleDataSourceException(result);
            } else {
                if (updateUi) {
                    ReportDetailGridView.prototype.setUpGrid(result);
                } else {
                    var report = $.parseJSON(result.Records.Report);
                    var data = $.parseJSON(report.DataSource);
                    $(document).trigger(argosyEvents.EVENT_SEND_EXCEL_DATASOURCE,
                    {
                        records: data
                    });
                }
            }
            unblock();
        },
        error: function (args) {
            unblock();
        }
    });

};

ReportDetailGridView.prototype.setUpGrid = function (result) {
    var that = this;
    that.properties.Report = $.parseJSON(result.Records.Report);
    that.properties.TotalCount = result.Records.TotalCount;
    var reportDataSource = $.parseJSON(that.properties.Report.DataSource);
    var reportColumns = $.parseJSON(that.properties.Report.Columns);
    var reportQuery = $.ReportQuery;
    that.properties.SelectedColumns = $.parseJSON(that.properties.Report.SelectedColumns);
    that.properties.OrigSelectedColumns = $.parseJSON(that.properties.Report.OriginalSelectedColumns);
    that.properties.AvailableColumns = $.parseJSON(that.properties.Report.AvailableColumns);
    that.properties.ReportColumnList = $.parseJSON(that.properties.Report.ReportAllColumns);
    that.properties.RptDataSrc = $.parseJSON(that.properties.Report.DataSource);
    that.properties.ReportGroupColumnList = that.properties.Report.GroupByColumnIds;
    that.properties.SelectedUserIds = that.properties.Report.SelectedUserIds;
    that.properties.SelectedFilters = that.properties.Report.FilterColumnsList;
    that.properties.SelectedDates = that.properties.Report.SelectedDates == null || that.properties.Report.SelectedDates == "" ? [] : that.properties.Report.SelectedDates;
    that.properties.SelDateFilterValue = that.properties.Report.DateFilterValue;
    that.properties.DateFormatValue = that.properties.Report.DateFormatValue;
    that.properties.ReportConfigId = that.properties.Report.ReportConfigId;
    that.properties.ReportId = that.properties.Report.ReportId;
    that.properties.ReportName = that.properties.Report.ReportName;
    that.properties.ReportDateRangeText = that.properties.Report.ReportDateRangeMsgText;
    that.properties.FiltersColumnList = [];

    //Populate Report Filters
    that.populateFilters();

    //populate Summary filters
    $(that.options.fancyboxReportSummary).html($(that.options.templateReportSummary).html());
    that.populateGroupByColumns();

    //Show Hide Add/Edit Filter buttons
    if ((that.properties.FiltersColumnList != null || that.properties.FiltersColumnList != undefined) && that.properties.FiltersColumnList.length <= 0) {
        $("#btnAddFilter").show();
        $("#btnEditFilter").hide();
    } else {
        $("#btnAddFilter").hide();
        $("#btnEditFilter").show();
    }

    var dataSource = new kendo.data.DataSource({
        data: reportDataSource,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        pageSize: that.properties.CurrPageSize,
        page: that.properties.CurrentPage,
        schema: {
            total: function () {
                return that.properties.Report.Count; // total is returned in the "total" field of the response
            }
        }
    });

    var opts = {
        scrollable: false,
        editable: false,
        autoBind: true,
        dataSource: dataSource,
        groupable: false,
        sortable: false,
        selectable: false,
        exportToExcel: true,
        resizable: false,
        useEventToGetExcelData: true,
        //filterable: {
        //    extra: false,
        //    operators: {
        //        string: {
        //            startswith: "Starts with",
        //            endswith: "Ends with",
        //            contains: "Contains",
        //            eq: "Is equal to",
        //            neq: "Is not equal to",
        //            gt: "Greater than",
        //            lt: "Less than"
        //        }
        //    }
        //},
        pageable: {
            refresh: true,
            pageSizes: [50, 100, 500],
            buttonCount: 5
        },
        toolbar: [
            { name: "selectdaterange", text: "SELECT DATE RANGE", template: "<a class='k-button k-button-icontext' id='btnSelectDateRange' onclick='ReportDetailGridView.prototype.showDateFiltersModal();return false;' href='##'><i class='fa la'></i>~{SelectDateRange}~</a>" },
            { name: "selectusers", text: "SELECT USERS", template: "<a class='k-button k-button-icontext' id='btnSelectUsers' onclick='ReportDetailGridView.prototype.showSelectUsersModal();return false;' href='##'><i class='fa la'></i>~{SelectUsers}~</a>" },
            { name: "editfilter", text: "EDIT FILTER", template: "<a class='k-button k-button-icontext' id='btnEditFilter' style='display:none;' onclick='ReportDetailGridView.prototype.showFiltersModal();return false;' href='##'><i class='fa la'></i>~{EditFilter}~</a>" },
            { name: "addfilter", text: "ADD FILTER", template: "<a class='k-button k-button-icontext' id='btnAddFilter' onclick='ReportDetailGridView.prototype.showFiltersModal();return false;' href='##'><i class='fa la'></i>~{AddFilter}~</a>" },
            { name: "summarize", text: "SUMMARIZE", template: "<a class='k-button k-button-icontext' id='btnSummarize'  onclick='ReportDetailGridView.prototype.showReportSummaryFilters();return false;' href='##'><i class='fa la'></i>~{Summarize}~</a>" },
            { name: "selectColumns", text: "SELECT COLUMNS", template: "<a class='k-button k-button-icontext' id='btnSelectColumns' onclick='ReportDetailGridView.prototype.showSelectColumnsModal();return false;' href='##' ><i class='fa la'></i>~{SelectColumns}~</a>" },
            { name: "ReportName", text: "ReportName", template: "<span class='big-price'>" + that.properties.ReportName + "</span><br/><span class='small_txt' id='rptDateRangeText'>" + that.properties.ReportDateRangeText + "</span>" }
        ],

        columns: reportColumns,
        dataBound: function (e) {

            ReportDetailGridView.prototype.properties.CurrentPage = e.sender.pager.page();
            
            if (ReportDetailGridView.prototype.gridEvent.ReportInit && ReportDetailGridView.prototype.properties.CurrPage != ReportDetailGridView.prototype.properties.CurrentPage && ReportDetailGridView.prototype.properties.CurrentPage != 0) {
                ReportDetailGridView.prototype.properties.CurrPage = ReportDetailGridView.prototype.properties.CurrentPage;
                ReportDetailGridView.prototype.gridEvent.IsPagerEvent = true;
                ReportDetailGridView.prototype.gridEvent.NeedsToRefresh = true;
                ReportDetailGridView.prototype.refreshReport();
                return;
            } else if ((ReportDetailGridView.prototype.properties.Sort != undefined || ReportDetailGridView.prototype.properties.Sort != null) && (ReportDetailGridView.prototype.properties.Sort[0] != null && ReportDetailGridView.prototype.properties.Sort[0] != undefined) && (ReportDetailGridView.prototype.properties.CurrPageSize == e.sender.dataSource._pageSize && !ReportDetailGridView.prototype.gridEvent.PageSizeEvent)) {

                if (e.sender.dataSource._sort != undefined && ((ReportDetailGridView.prototype.properties.Sort[0].dir != e.sender.dataSource._sort[0].dir) || ReportDetailGridView.prototype.properties.Sort[0].field != e.sender.dataSource._sort[0].field)) {
                    ReportDetailGridView.prototype.refreshReport();
                    return;
                }
            } else if (ReportDetailGridView.prototype.gridEvent.ReportInit && ReportDetailGridView.prototype.properties.CurrPageSize != e.sender.dataSource._pageSize && !ReportDetailGridView.prototype.gridEvent.PageSizeEvent) {
                ReportDetailGridView.prototype.gridEvent.PageSizeEvent = true;
                if (e.sender.dataSource._pageSize != ReportDetailGridView.prototype.properties.CurrPageSize) {
                    ReportDetailGridView.prototype.properties.PrevPageSize = ReportDetailGridView.prototype.properties.CurrPageSize;
                    ReportDetailGridView.prototype.properties.CurrPageSize = e.sender.dataSource._pageSize;
                }
                ReportDetailGridView.prototype.refreshReport();
                return;
            } else if (ReportDetailGridView.prototype.properties.PrevPageSize != ReportDetailGridView.prototype.properties.CurrPageSize && ReportDetailGridView.prototype.gridEvent.PageSizeEvent) {
                ReportDetailGridView.prototype.gridEvent.PageSizeEvent = false;
                return;
            }

        }
    };
    $(that.options.gridViewSelector).kendoArgosyGrid(opts);

    if (!that.properties.Report.HasUserFilter) {
        $("#btnSelectUsers").hide();
    } else {
        $("#btnSelectUsers").show();
    }

    if (!that.properties.Report.HasDateFilter) {
        $("#btnSelectDateRange").hide();
    } else {
        $("#btnSelectDateRange").show();
    }

    dataSource.read();

    $("#rptDateRangeText").html(that.properties.ReportDateRangeText);

    if (!ReportDetailGridView.prototype.gridEvent.ReportInit) {
        var obj = new Object();
        obj.dir = "asc";
        obj.field = reportColumns[0].field;
        ReportDetailGridView.prototype.properties.Sort[0] = obj;
    }

    ReportDetailGridView.prototype.gridEvent.ReportInit = true;


}

ReportDetailGridView.prototype.dataSourceOpts = {};

ReportDetailGridView.prototype.showSaveReportModal = function () {
    var that = this;
    if (that.options.userId > 0) {
        ReportDetailGridView.prototype.saveReport();
    } else {
        $(that.options.fancyboxReportSaveHref).html($(that.options.templateReportSave).html());
        ReportDetailGridView.prototype.properties.ReportOperation = "New";
        $("#btnSaveReport").bind("click", ReportDetailGridView.prototype.saveReport);
        $.fancybox({
            href: that.options.fancyboxReportSaveHref,
            type: "inline",
            scrolling: "no"
        });
    }
}

ReportDetailGridView.prototype.saveReport = function () {
    var that = this;
    var search = new Object();
    ReportDetailGridView.prototype.properties.SelRepColumnIds = [];

    $.each(ReportDetailGridView.prototype.properties.SelectedColumns, function () {
        ReportDetailGridView.prototype.properties.SelRepColumnIds.push(this.COLUMN_ID.toString());
    });

    if (ReportDetailGridView.prototype.properties.ReportOperation == "New") {
        search.ReportName = $("#txtViewName").val();
        ReportDetailGridView.prototype.properties.ReportConfigId = 0;
    }

    if ($("#dtStartDate").getKendoDatePicker() != undefined && $("#dtEndDate").getKendoDatePicker() != undefined) {
        var dStart = $("#dtStartDate").getKendoDatePicker().value();
        var dEnd = $("#dtEndDate").getKendoDatePicker().value();

        ReportDetailGridView.prototype.properties.StartDate = kendo.toString(dStart, "d");
        ReportDetailGridView.prototype.properties.EndDate = kendo.toString(dEnd, "d");
    }

    var dateRange = $('#lblDateRangeTxt').html();

    if (dateRange == undefined || dateRange == null) {
        dateRange = ReportDetailGridView.prototype.properties.ReportDateRangeText;
    }

    if ((ReportDetailGridView.prototype.properties.StartDate == null || ReportDetailGridView.prototype.properties.StartDate == undefined) && dateRange != undefined) {
        var sDate = dateRange.substring(dateRange.lastIndexOf("From") + 5, dateRange.lastIndexOf("To") - 1);
        ReportDetailGridView.prototype.properties.StartDate = sDate;
    }

    if ((ReportDetailGridView.prototype.properties.EndDate == null || ReportDetailGridView.prototype.properties.EndDate == undefined || !isNaN(ReportDetailGridView.prototype.properties.EndDate)) && dateRange != undefined) {
        var eDate = dateRange.substring(dateRange.lastIndexOf("To") + 2);
        ReportDetailGridView.prototype.properties.EndDate = eDate;
    }

    if (ReportDetailGridView.prototype.properties.StartDate == "") {
        ReportDetailGridView.prototype.properties.StartDate = kendo.toString(new Date($.now()), "d");
    }

    if (ReportDetailGridView.prototype.properties.EndDate == "") {
        ReportDetailGridView.prototype.properties.EndDate = kendo.toString(new Date($.now()), "d");
    }

    if (ReportDetailGridView.prototype.properties.SelFilterIds.length == 0 && $("#grdSelFilters").getKendoGrid() != null) {
        ReportDetailGridView.prototype.applyFilters();
    }


    search.SelColIds = ReportDetailGridView.prototype.properties.SelRepColumnIds.length > 0 ? ReportDetailGridView.prototype.properties.SelRepColumnIds : null;
    search.SelFilterIds = ReportDetailGridView.prototype.properties.SelFilterIds.length > 0 ? ReportDetailGridView.prototype.properties.SelFilterIds : ReportDetailGridView.prototype.properties.FiltersColumnList;
    search.SelUserIds = ReportDetailGridView.prototype.properties.SelectedUserIds.length > 0 ? ReportDetailGridView.prototype.properties.SelectedUserIds : null;
    search.DateFilterValue = ReportDetailGridView.prototype.properties.SelDateFilterValue == "" && !ReportDetailGridView.prototype.properties.XmlLoad ? "11" : ReportDetailGridView.prototype.properties.SelDateFilterValue;
    search.DateStart = ReportDetailGridView.prototype.properties.StartDate;
    search.EndDate = ReportDetailGridView.prototype.properties.EndDate;
    search.DateFormatValue = ReportDetailGridView.prototype.properties.DateFormatNode;
    search.GroupByColumns = ReportDetailGridView.prototype.properties.GroupByColumns;
    search.ReportConfigId = ReportDetailGridView.prototype.properties.ReportConfigId;
    search.ReportId = ReportDetailGridView.prototype.properties.ReportId;
    search.UserId = ReportDetailGridView.prototype.options.userId;


    var params = { search: search };
    $.ajax({
        url: "/Admin/Reports/SaveReportView",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        cache: false,
        processData: false,
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Failed) {
                alert(result.Message);
            } else {
                window.location.href = "/Admin/Reports/Details/" + result.Records.REPORT_CONFIG_ID;
                //ReportDetailGridView.prototype.setUpGrid(result);
            }
        },
        error: function (args) {
        }
    });
    return false;
}

//Set Report Selected and Available Columns for Select Colums PopUp
ReportDetailGridView.prototype.populateSelectColumns = function () {
    var that = this;
    var cols = "";
    var selCols = "";
    var lstCols = $("#lnkLstColumns");
    var lstSelCols = $("#lnkLstSelCols");

    if (that.properties.HasGrouping) {

        if (that.properties.SelectedColumns.length > 0) {
            $.each(that.properties.AvailableColumns, function () {
                var col = this;
                if ((col.IS_SUM || col.IS_COUNT) && $.grep(that.properties.SelectedColumns, function (e) { return e.COLUMN_ID == col.COLUMN_ID; }) == 0) {
                    cols += " <li class='list-item' COLUMN_ID='" + col.COLUMN_ID + "'>" + col.COLUMN_DISPLAY_NAME + "</li>";
                }
            });
        } else {
            $.each(that.properties.AvailableColumns, function () {
                var col = this;
                if (col.IS_VISIBLE && !col.IS_DEFAULT) {
                    cols += " <li class='list-item' COLUMN_ID='" + col.COLUMN_ID + "'>" + col.COLUMN_DISPLAY_NAME + "</li>";
                }
            });
        }

    } else {
        if (that.properties.SelectedColumns.length > 0) {
            $.each(that.properties.AvailableColumns, function () {
                var col = this;
                if (col.IS_VISIBLE && $.grep(that.properties.SelectedColumns, function (e) { return e.COLUMN_ID == col.COLUMN_ID; }) == 0) {
                    cols += " <li class='list-item' COLUMN_ID='" + col.COLUMN_ID + "'>" + col.COLUMN_DISPLAY_NAME + "</li>";
                }
            });
        } else {
            $.each(that.properties.AvailableColumns, function () {
                var col = this;
                if (col.IS_VISIBLE && !col.IS_DEFAULT) {
                    cols += " <li class='list-item' COLUMN_ID='" + col.COLUMN_ID + "'>" + col.COLUMN_DISPLAY_NAME + "</li>";
                }
            });
        }
    }

    //Selected Columns
    if (that.properties.SelectedColumns.length < 0) {
        $.each(that.properties.ReportColumnList, function () {
            var col = this;
            if (col.IS_VISIBLE && col.IS_DEFAULT) {
                var colName = that.properties.HasGrouping ? col.GROUP_COLUMN_DISPLAY_NAME : col.COLUMN_DISPLAY_NAME;
                selCols += " <li class='list-item' COLUMN_ID='" + col.COLUMN_ID + "'>" + colName + "</li>";
            }
        });

    } else {
        $.each(that.properties.SelectedColumns, function () {
            var col = this;
            var selColName = that.properties.HasGrouping ? col.GROUP_COLUMN_DISPLAY_NAME : col.COLUMN_DISPLAY_NAME;
            selCols += " <li class='list-item' COLUMN_ID='" + col.COLUMN_ID + "'>" + selColName + "</li>";
        });
    }

    lstCols.html("");
    lstSelCols.html("");

    if (lstCols.getKendoSortable() == undefined || lstCols.getKendoSortable() == null) {
        lstCols.kendoSortable({
            placeholder: function (element) {
                return $("<li class='list-item' id='placeholder'>Drop Here!</li>");
            },
            connectWith: lstSelCols,
            cursor: "move"
        });
    }

    if (lstSelCols.getKendoSortable() == undefined || lstSelCols.getKendoSortable() == null) {
        lstSelCols.kendoSortable({
            placeholder: function (element) {
                return $("<li class='list-item' id='placeholder'>Drop Here!</li>");
            },
            connectWith: lstCols,
            cursor: "move",
            end: function (e) {
                if (e.action == "receive") {
                    if (e.sender.items().length + 1 > 30) {
                        var message = 'We only allow maximum of 30 columns per report. Please remove number of selected columns and try again.';

                        prompt.notify({
                            question: message,
                            type: "error"
                        });

                        e.preventDefault();
                    }
                }
            }
        });
    }

    lstCols.html(cols);
    lstSelCols.html(selCols);

};

//Modal for Select Report Columns
ReportDetailGridView.prototype.showSelectColumnsModal = function () {
    var that = this;
    //show report columns modal 
    $(that.options.fancyboxReportColumnsHref).html($(that.options.templateSelectColumns).html());
    $("#btnSaveSelectColumns").unbind("click").bind("click", function () {
        ReportDetailGridView.prototype.properties.NeedtoClearGridContent = true;
        ReportDetailGridView.prototype.SetGroupByColumns();
        ReportDetailGridView.prototype.refreshReport();
    });
    $(document).keypress(function (ev) {
        var keycode = (ev.keyCode ? ev.keyCode : ev.which);
        if (keycode === 13) {
            $("#filterBtn").trigger("click");
        }
    });
    $("#clearBtn").unbind("click").bind("click", function () {
        $("#lnkLstColumns .list-item:hidden").show();
    });

    $("#filterBtn").unbind("click").bind("click", function () {
        var filterText = $("#filterText").val().toLowerCase();
        $("#lnkLstColumns .list-item")
            .each(function (e) {
                var item = $(this),
                    textToCompare =item.text().toLowerCase().replace(/\s/g, '');
                if (filterText.length > 0 && textToCompare.indexOf(filterText) < 0) {
                    item.hide();
                } else {
                    item.show();
                }
            });
    });

    that.populateSelectColumns();
    $.fancybox({
        href: that.options.fancyboxReportColumnsHref,
        type: "inline",
        scrolling: "no"
    });
}

//Populate Report Filters
ReportDetailGridView.prototype.populateFilters = function () {
    var that = this;
    var filters = that.properties.SelectedFilters;

    if (filters != null && filters.length > 0) {
        $.each(filters, function () {
            that.properties.FiltersColumnList.push({ ID: this.Id, COLUMN_ID: this.ColumnId, COLUMN_DISPLAY_NAME: this.FilterColumnName, VALUE: this.FilterByValue, OPERAND: this.FilterByOperand });
        });
    }
    //Show hide Add/Edit Filter buttons
    if (that.properties.FiltersColumnList != null && that.properties.FiltersColumnList != undefined && that.properties.FiltersColumnList.length <= 0) {
        $("#btnAddFilter").show();
        $("#btnEditFilter").hide();
    }
}

//Populate Report Filters
ReportDetailGridView.prototype.populateFilterDropDownList = function () {
    var that = this;
    var reportColumns = that.properties.ReportColumnList;

    var filterColumns = [];
    $.each(reportColumns, function () {
        if (this.IS_FILTER) {
            filterColumns.push(this);
        }
    });

    $("#ddlColumns").kendoDropDownList({
        optionLabel: "Select",
        dataTextField: "COLUMN_DISPLAY_NAME",
        dataValueField: "COLUMN_ID",
        dataSource: filterColumns
    });
}

ReportDetailGridView.prototype.loadFilterGrid = function () {
    var that = this;
    var ddlColumns = $("#ddlColumns").getKendoDropDownList();
    var filtersColumnList = ReportDetailGridView.prototype.properties.FiltersColumnList;
    var reportColumnList = ReportDetailGridView.prototype.properties.ReportColumnList;
    var filterSelected = false;

    if (ddlColumns != null && ddlColumns != undefined && ddlColumns.value() !== "") {

        if (filtersColumnList.length > 0) {

            $.each(filtersColumnList, function () {

                if (this.COLUMN_ID == ddlColumns.value()) {
                    filterSelected = true;
                }
            });
        }

        if (!filterSelected)
            filtersColumnList.push({ COLUMN_ID: ddlColumns.value(), COLUMN_DISPLAY_NAME: ddlColumns.text(), OPERAND: "", VALUE: "" });
    }

    if (filtersColumnList.length > 0) {
        $('#divEmptyFilterMessage').hide();
        $("#btnApplyFilters").show();
    } else {
        $("#btnApplyFilters").hide();
        if ($("#grdSelFilters").getKendoGrid() != null) {
            var grid1 = $("#grdSelFilters").getKendoGrid();
            grid1.columns = [];
            grid1.thead.remove();
            grid1.dataSource.data([]);
            grid1.destroy();
            grid1 = null;
        }
        $('#divEmptyFilterMessage').show();
        return;
    }

    if ($("#grdSelFilters").getKendoGrid() == null || $("#grdSelFilters").getKendoGrid() == undefined) {
        var opts = {
            dataSource: {
                data: filtersColumnList,
                schema: {
                    id: "COLUMN_ID",
                    model: {
                        fields: {
                            COLUMN_DISPLAY_NAME: { type: "string" }
                        }
                    }
                }
            },
            columns: [
                {
                    field: "COLUMN_DISPLAY_NAME",
                    title: "Name"
                },
                {
                    template: "<input id='ddl_${COLUMN_ID}' uid= 'uid_${COLUMN_ID}' value='${OPERAND}' />",
                    title: "Expression"
                },
                {
                    template: "<input id='txt_${COLUMN_ID}' type='text' value='${VALUE}' />",
                    title: "Value"
                },
                {
                    template: "<a href='\\#' value='${COLUMN_DISPLAY_NAME}' onclick='ReportDetailGridView.prototype.deleteFilter(${COLUMN_ID}, this )' class='btn btn-success'><i class='fa fa-remove'></i> Remove</a>",
                    title: ""

                }
            ],
            scrollable: false,
            sortable: false,
            dataBound: function (e) {
                $(e.sender._data).each(function () {
                    if (filtersColumnList.length > 0) {
                        var expressionValues = [];
                        var ind = -1;

                        for (var i = 0; i < reportColumnList.length; i++) {
                            var arr = reportColumnList[i];

                            if (arr.COLUMN_ID == this.COLUMN_ID) {
                                ind = i;
                            }

                            if (ind > -1) break;
                        }


                        if (ind > -1 && reportColumnList[ind].COLUMN_TYPE == "TEXT") {

                            expressionValues = [
                                { text: "Not Equals", value: "<>" },
                                { text: "Equals", value: "=" },
                                { text: "Contains", value: "like" },
                                { text: "Starts With", value: "startswith" },
                                { text: "Ends With", value: "endswith" }
                            ];
                        } else {
                            expressionValues = [
                                { text: "Not Equals", value: "<>" },
                                { text: "Equals", value: "=" },
                                { text: "Greater Than", value: ">" },
                                { text: "Less Than", value: "<" },
                            ];
                        }

                        $('#ddl_' + this.COLUMN_ID).kendoDropDownList({
                            optionLabel: "Select",
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: expressionValues
                        });

                        if (this.OPERAND !== "") {
                            var operand = this.OPERAND;
                            var ddlColOp = $('#ddl_' + this.COLUMN_ID).getKendoDropDownList();
                            ddlColOp.text(this.OPERAND);
                            ddlColOp.select(function (dataItem) {
                                return dataItem.value == operand;
                            });
                        }

                    }
                });
            }
        };
        $("#grdSelFilters").kendoGrid(opts);

        $("#ddlColumns").val("");
    } else {
        var grid = $("#grdSelFilters").getKendoGrid();
        grid.dataSource.data(filtersColumnList);
        grid.refresh();
    }

    var ddl = $("#ddlColumns").getKendoDropDownList();
    ddl.value('');
}

ReportDetailGridView.prototype.loadPresetDate = function () {
    var that = this;
    ReportDetailGridView.prototype.properties.SelDateFilterValue = $("#ddlPresetDate").data("kendoDropDownList").value();
    ReportDetailGridView.prototype.refreshReport();
}

ReportDetailGridView.prototype.loadDateRange = function () {
    var that = this;
    var dStart = $("#dtStartDate").data("kendoDatePicker").value();
    var dEnd = $("#dtEndDate").data("kendoDatePicker").value();
    var message = '';
    if (dStart == "" || dStart == null || dStart == undefined) {
        message = 'Please Select Start Date';

        prompt.notify({
            question: message,
            type: "error"
        });

        return;
    } else if (dEnd == "" || dEnd == null || dEnd == undefined) {
        message = 'Please Select End Date';

        prompt.notify({
            question: message,
            type: "error"
        });

        return;
    } else if (dStart > dEnd) {
        message = 'Start Date cannot be greater than End Date';

        prompt.notify({
            question: message,
            type: "error"
        });

        return;
    }
    var startDate = kendo.toString(dStart, "d");
    var endDate = kendo.toString(dEnd, "d");
    ReportDetailGridView.prototype.properties.SelDateFilterValue = "14";

    if (ReportDetailGridView.prototype.properties.SelectedDates != null && ReportDetailGridView.prototype.properties.SelectedDates != undefined && ReportDetailGridView.prototype.properties.SelectedDates.length > 0) {
        ReportDetailGridView.prototype.properties.SelectedDates[0] = startDate.trim();
        ReportDetailGridView.prototype.properties.SelectedDates[1] = endDate.trim();
    } else {
        ReportDetailGridView.prototype.properties.SelectedDates = [];
        ReportDetailGridView.prototype.properties.SelectedDates.push(startDate.trim());
        ReportDetailGridView.prototype.properties.SelectedDates.push(endDate.trim());
    }

    ReportDetailGridView.prototype.refreshReport();
}

ReportDetailGridView.prototype.populateReportDates = function () {
    var that = this;
    var selDateFilterValue = that.properties.SelDateFilterValue;
    var selectedDates = that.properties.SelectedDates;
    var presetDates = [
        { value: "1", text: "Today" },
        { value: "2", text: "Yesterday" },
        { value: "3", text: "This Week (Sun-Today)" },
        { value: "4", text: "This Week (Mon-Today)" },
        { value: "5", text: "Last 7 days" },
        { value: "6", text: "Last Week (Sun-Sat)" },
        { value: "7", text: "Last Week (Mon-Sun)" },
        { value: "8", text: "Last Business Week (Mon-Fri)" },
        { value: "9", text: "Last 14 Days" },
        { value: "10", text: "This Month" },
        { value: "11", text: "Last 30 Days" },
        { value: "12", text: "Last Month" },
        { value: "19", text: "Last 45 Days" },
        { value: "15", text: "Last 90 Days" },
        { value: "16", text: "Last 180 Days" },
        { value: "17", text: "Year To Date" },
        { value: "18", text: "Last Year" },
        { value: "13", text: "All Time" }
    ];

    if ($("#ddlPresetDate").getKendoDropDownList() == null || $("#ddlPresetDate").getKendoDropDownList() == undefined)
        $("#ddlPresetDate").kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: presetDates
        });

    if (selDateFilterValue !== "") {
        if ($("#ddlPresetDate").getKendoDropDownList() != null && $("#ddlPresetDate").getKendoDropDownList() != undefined)
            $("#ddlPresetDate").getKendoDropDownList().value(selDateFilterValue);
    }

    if ($("#dtStartDate").getKendoDatePicker() == null && $("#dtStartDate").getKendoDatePicker() == undefined) {
        $("#dtStartDate").kendoDatePicker({
            format: "MM/dd/yyyy"
        });
    }

    if ($("#dtEndDate").getKendoDatePicker() == null && $("#dtEndDate").getKendoDatePicker() == undefined) {
        $("#dtEndDate").kendoDatePicker({
            format: "MM/dd/yyyy"
        });
    }
    var dtStartDate = $("#dtStartDate").getKendoDatePicker();
    var dtEndDate = $("#dtEndDate").getKendoDatePicker();

    if (selectedDates != null) {

        if (selectedDates[0] != null && selectedDates[0].length > 0) {
            if (selectedDates[0] != null && selectedDates[0] !== '') {
                dtStartDate.value(selectedDates[0]);
            }
        }

        if (selectedDates[1] && selectedDates[1].length > 0) {
            if (selectedDates[1] != null && selectedDates[1] !== '') {
                dtEndDate.value(selectedDates[1]);
            }
        }
    }
}

//Modal for Select Report Filters
ReportDetailGridView.prototype.showFiltersModal = function () {
    var that = this;
    //show report filters modal
    $(that.options.fancyboxReportFiltersHref).html($(that.options.templateReportFilters).html());
    that.populateFilterDropDownList();
    $("#btnAddFilterCol").bind("click", that.loadFilterGrid);
    $("#btnApplyFilters").bind("click", that.refreshReport);
    that.loadFilterGrid();
    $.fancybox({
        href: that.options.fancyboxReportFiltersHref,
        type: "inline",
        scrolling: "no"
    });
}

//Modal for Select Report Date Filters
ReportDetailGridView.prototype.showDateFiltersModal = function () {
    var that = this;
    //show report columns modal 
    $(that.options.fancyboxReportDateFiltersHref).html($(that.options.templateReportDateFilters).html());
    $("#btnSearchPresetdate").bind("click", that.loadPresetDate);
    $("#btnSearchDateRange").bind("click", that.loadDateRange);
    that.populateReportDates();
    $.fancybox({
        href: that.options.fancyboxReportDateFiltersHref,
        type: "inline",
        scrolling: "no"
    });
}

ReportDetailGridView.prototype.loadCompanyUserGroups = function () {
    var that = this;
    if ($("#ddlUserGroup").getKendoDropDownList() == null || $("#ddlUserGroup").getKendoDropDownList == undefined) {
        var params = { companyId: that.options.companyId };
        $.ajax({
            url: "/Admin/UserGroups/GetCompanyUserGroups",
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify(params),
            processData: false,
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Failed) {
                    handleDataSourceException(result);
                } else {
                    var dataSource = result.Records;
                    $("#ddlUserGroup").kendoDropDownList({
                        optionLabel: "~{Select User Group}~",
                        dataTextField: "GroupName",
                        dataValueField: "UserGroupId",

                        dataSource: {
                            data: dataSource
                        }
                    });
                    ReportDetailGridView.prototype.loadCompanyUsers();
                }
            },
            error: function (args) {
            }
        });
    }
}

ReportDetailGridView.prototype.loadCompanyUsers = function () {
    var that = this;

    var multiSelectDataSource = new kendo.data.DataSource({
        serverPaging: true,
        serverFiltering: true,
        pageSize: 5,
        schema: {
            data: "Records",
            total: "TotalRecords"
        },
        transport: {
            read: {
                url: "/Admin/Users/GetCompanyUsers",
                type: "POST",
                contentType: 'application/json'
            },
            parameterMap: function (options) {
                var search = new Object();
                search.IncludeUserIds = ReportDetailGridView.prototype.properties.SelectedUserIds;
                search.Active = "Y";
                search.Take = 5;
                if (options.filter != null) {
					search.FullName = options.filter.filters[0].value;
                }
                options.search = search;
                return JSON.stringify(options);
            }
        }
    });
    var users;
    if ($("#ddlCompUsers").getKendoMultiSelect() == null || $("#ddlCompUsers").getKendoMultiSelect == undefined) {

        users = $("#ddlCompUsers").kendoMultiSelect({
            placeholder: "Search User By First, Last or Username...",
            dataTextField: "FullName",
            dataValueField: "UserId",
            headerTemplate: '<div class="dropdown-header k-widget k-header">' +
                '<span>Full Name</span>' +
                '<span>Username</span>' +
                '</div>',
            itemTemplate: '<span class="k-state-default"><h3>#: data.FullName #</h3><p>#: data.Username #</p></span>',
            tagTemplate: '<span class="selected-value"></span><span>#:data.FullName#(#: data.Username #)</span>',
            dataSource: multiSelectDataSource,
            filter: "startswith",
            minLength: 3,
            value: ReportDetailGridView.prototype.properties.SelectedUserIds,
            change: function () {
                ReportDetailGridView.prototype.properties.SelectedUserIds = [];
                var values = this._old;
                $.each(values, function (i) {
                    if (this != null && this != "" && this > 0) {
                        ReportDetailGridView.prototype.properties.SelectedUserIds.push(values[i]);
                    }
                    i++;
                });

            }

        });
        var customers = $("#ddlCompUsers").data("kendoMultiSelect");
        customers.wrapper.attr("id", "customers-wrapper");
    } else {
        users = $("#ddlCompUsers").data("kendoMultiSelect");
        users.dataSource.read();
        users.refresh();
    }

}

//Modal for Select Report User Filters
ReportDetailGridView.prototype.showSelectUsersModal = function () {
    var that = this;
    //show report user grid modal 
    $(that.options.fancyboxReportUsersHref).html($(that.options.templateReportUsers).html());
    $("#btnSelectFilterUsers").bind("click", that.refreshReport);
    that.loadCompanyUsers();
    $.fancybox({
        href: that.options.fancyboxReportUsersHref,
        type: "inline",
        scrolling: "no",
        afterClose: function () {
            $("#btnSelectFilterUsers").click();
        }
    });
}

ReportDetailGridView.prototype.getUserFilters = function () {
    var that = this;
    var compUserIds = [];
    if ($("#ddlCompUsers").getKendoMultiSelect() != null) {
        var compUsers = $("#ddlCompUsers").getKendoMultiSelect().dataSource.data();
        if (compUsers.length > 0) {

            $.each(compUsers, function () {
                if (compUsers.UserId != null && compUsers.UserId > 0) {
                    compUserIds.push(compUsers.UserId);
                }
            });
        }

        ReportDetailGridView.prototype.properties.SelectedUserIds = compUserIds.filter(function (v) { return v !== '' });
    }
}

//Group By
ReportDetailGridView.prototype.populateGroupByColumns = function () {
    var that = this;
    var reportColumnList = that.properties.ReportColumnList;

    var i = 0;
    var showSummary = false;
    that.properties.GroupByColumns = [];
    that.properties.GridGroupByColsDataSrc = [];

    var groupByCols = "";
    var lstGroupByCols = $("#lstLnkGroupByColumns");

    $('input[name="datePeriod"]').attr('disabled', 'disabled');

    $.each(reportColumnList, function () {
        if (this.IS_VISIBLE && this.IS_GROUP) {
            var reportColumnId = this.COLUMN_ID;
            that.properties.GridGroupByColsDataSrc.push({ COLUMN_ID: this.COLUMN_ID, COLUMN_DISPLAY_NAME: this.COLUMN_DISPLAY_NAME });
            showSummary = true;
            groupByCols += "<li class='list-item-not-sortable-disabled list-disabled' COLUMN_ID='" + this.COLUMN_ID + "' COLUMN_NAME='" + this.COLUMN_DISPLAY_NAME + "'><input type='checkbox' onclick='ReportDetailGridView.prototype.groupByColumnChanged(this," + this.COLUMN_TYPE.toUpperCase().indexOf('DATE') + ");' id='chkGroupBy_" + this.COLUMN_ID + "'/><label for='chkGroupBy_" + this.COLUMN_ID + "'>" + this.COLUMN_DISPLAY_NAME + "</label></li>";


            if (this.COLUMN_TYPE.toUpperCase().indexOf("DATE") != -1) {
                $("#chkGroupBy_" + this.COLUMN_ID).attr("IsDate", true);
            }

            if (!$("#btnSummarize").is(":visible")) {
                $("#btnSummarize").show();
            }

            if (that.properties.ReportGroupColumnList != null) {
                $.each(that.properties.ReportGroupColumnList, function () {
                    var groupColumnId = this;
                    if (reportColumnId == groupColumnId) {
                        $("#chkGroupBy_" + reportColumnId).prop('checked', true);
                        that.properties.HasGrouping = true;
                        that.properties.GroupByColumns.push(reportColumnId);
                    }
                    i++;
                });
            }

        }
    });

    lstGroupByCols.html("");

    if (lstGroupByCols.getKendoSortable() == undefined || lstGroupByCols.getKendoSortable() == null) {
        lstGroupByCols.kendoSortable({
            disabled: ".list-disabled"
        });
    }

    lstGroupByCols.html(groupByCols);

    if (showSummary) {
        $("#btnSummarize").show();
    } else {
        $("#btnSummarize").hide();
    }

    if (that.properties.DateFormatValue != null && that.properties.DateFormatValue != '') {
        $("input[name=datePeriod][value=" + that.properties.DateFormatValue + "]").prop('checked', true);
        that.properties.DateFormatNode = that.properties.DateFormatValue;
    }
}

//Modal show Summary filters
ReportDetailGridView.prototype.showReportSummaryFilters = function () {
    var that = this;
    //show summary filters 
    $("#btnGroupByContinue").bind("click", that.ReportGroupByContinue);
    $.fancybox({
        href: that.options.fancyboxReportSummary,
        type: "inline",
        scrolling: "no"
    });
}
ReportDetailGridView.prototype.SetGroupByColumns = function () {
    ReportDetailGridView.prototype.properties.HasGrouping = false;
    ReportDetailGridView.prototype.properties.GroupByColumns = [];

    var selGroupCols = $("#lstLnkGroupByColumns").getKendoSortable();
    var procSelectedColumns = [];

    $.each(selGroupCols.items(), function (i) {
        var colId = $(selGroupCols.items()[i]).attr("COLUMN_ID");
        var colName = $(selGroupCols.items()[i]).attr("COLUMN_NAME");
        var chk = $("#chkGroupBy_" + colId);

        if ($(chk).is(':checked')) {
            if ($.grep(procSelectedColumns, function (e) { return e.COLUMN_ID == colId; }) == 0) {
                procSelectedColumns.push({ COLUMN_ID: colId, COLUMN_DISPLAY_NAME: colName, GROUP_COLUMN_DISPLAY_NAME: colName });
                ReportDetailGridView.prototype.properties.GroupByColumns.push(colId);
                ReportDetailGridView.prototype.properties.HasGrouping = true;
            }
        }
    });

    procSelectedColumns = [];
}

ReportDetailGridView.prototype.ReportGroupByContinue = function () {
    var that = this;

    $(ReportDetailGridView.prototype.options.fancyboxReportColumnsHref).html($(ReportDetailGridView.prototype.options.templateSelectColumns).html());
    $("#btnSaveSelectColumns").bind("click", function () {
        ReportDetailGridView.prototype.properties.NeedtoClearGridContent = true;
        ReportDetailGridView.prototype.refreshReport();
    });

    ReportDetailGridView.prototype.properties.HasGrouping = false;
    ReportDetailGridView.prototype.properties.GroupByColumns = [];

    var selGroupCols = $("#lstLnkGroupByColumns").getKendoSortable();
    var cols = "";
    var selCols = "";
    var lstCols = $("#lnkLstColumns");
    var lstSelCols = $("#lnkLstSelCols");

    var procSelectedColumns = [];

    $.each(selGroupCols.items(), function (i) {
        var colId = $(selGroupCols.items()[i]).attr("COLUMN_ID");
        var colName = $(selGroupCols.items()[i]).attr("COLUMN_NAME");
        var chk = $("#chkGroupBy_" + colId);

        if ($(chk).is(':checked')) {
            if ($.grep(procSelectedColumns, function (e) { return e.COLUMN_ID == colId; }) == 0) {
                procSelectedColumns.push({ COLUMN_ID: colId, COLUMN_DISPLAY_NAME: colName, GROUP_COLUMN_DISPLAY_NAME: colName });

                if ($.grep(ReportDetailGridView.prototype.properties.SelectedColumns, function (e) { return e.COLUMN_ID == colId; }).length == 0) {
                    ReportDetailGridView.prototype.properties.SelectedColumns.push({ COLUMN_ID: colId, COLUMN_DISPLAY_NAME: colName, GROUP_COLUMN_DISPLAY_NAME: colName });
                }
                ReportDetailGridView.prototype.properties.GroupByColumns.push(colId);
                ReportDetailGridView.prototype.properties.HasGrouping = true;
            }
        }
    });


    if (ReportDetailGridView.prototype.properties.HasGrouping) {

        ReportDetailGridView.prototype.properties.DateFormatNode = $('input[name=datePeriod]:checked').val();

        $.each(ReportDetailGridView.prototype.properties.ReportColumnList, function () {
            if ((this.IS_SUM || this.IS_COUNT)) {
                cols += " <li class='list-item' COLUMN_ID='" + this.COLUMN_ID + "'>" + this.GROUP_COLUMN_DISPLAY_NAME + "</li>";
            }
        });

        $.each(procSelectedColumns, function () {
            selCols += " <li class='list-item' COLUMN_ID='" + this.COLUMN_ID + "'>" + this.GROUP_COLUMN_DISPLAY_NAME + "</li>";
        });

    } else {

        ReportDetailGridView.prototype.properties.SelectedColumns = [];

        $.each(ReportDetailGridView.prototype.properties.OrigSelectedColumns, function () {
            selCols += " <li class='list-item' COLUMN_ID='" + this.COLUMN_ID + "'>" + this.COLUMN_DISPLAY_NAME + "</li>";
            ReportDetailGridView.prototype.properties.SelectedColumns.push({ COLUMN_ID: this.COLUMN_ID, COLUMN_DISPLAY_NAME: this.COLUMN_DISPLAY_NAME, GROUP_COLUMN_DISPLAY_NAME: this.COLUMN_DISPLAY_NAME });
        });

        ReportDetailGridView.prototype.properties.GroupByColumns = [];
        ReportDetailGridView.prototype.properties.DateFormatNode = '';
    }

    lstCols.html("");
    lstSelCols.html("");

    if (lstCols.getKendoSortable() == undefined || lstCols.getKendoSortable() == null) {
        lstCols.kendoSortable({
            placeholder: function (element) {
                return $("<li class='list-item' id='placeholder'>Drop Here!</li>");
            },
            connectWith: lstSelCols,
            cursor: "move"
        });
    }

    if (lstSelCols.getKendoSortable() == undefined || lstSelCols.getKendoSortable() == null) {
        lstSelCols.kendoSortable({
            placeholder: function (element) {
                return $("<li class='list-item' id='placeholder'>Drop Here!</li>");
            },
            connectWith: lstCols,
            cursor: "move",
            end: function (e) {
                if (e.action == "receive") {
                    if (e.sender.items().length + 1 > 30) {
                        var message = 'We only allow maximum of 30 columns per report. Please remove number of selected columns and try again.';

                        prompt.notify({
                            question: message,
                            type: "error"
                        });

                        e.preventDefault();
                    }
                }
            }
        });
    }

    lstCols.html(cols);
    lstSelCols.html(selCols);


    $.fancybox({
        href: ReportDetailGridView.prototype.options.fancyboxReportColumnsHref,
        type: "inline",
        scrolling: "no"
    });

    return false;
}

ReportDetailGridView.prototype.groupByColumnChanged = function (col, ind) {
    var that = this;

    if (ind != -1 && $(col).is(':checked')) {
        $('input[name="datePeriod"]').attr('disabled', false);
    } else {
        $('input[name="datePeriod"]').attr('disabled', 'disabled');
    }

    if (!$(col).is(':checked')) {

        $.each(ReportDetailGridView.prototype.properties.SelectedColumns, function (i) {
            if (this.COLUMN_DISPLAY_NAME == col._text || this.GROUP_COLUMN_DISPLAY_NAME == col._text) {
                ReportDetailGridView.prototype.properties.SelectedColumns.splice(i, 1);
            }

        });

    }

    //if (pLoadEve) pLoadEve = false;

}

//Save Report Selected Columns on UI only and refresh report with new columns, it is not report save
ReportDetailGridView.prototype.setSelectedColumns = function () {
    var that = this;
    var selCols = $("#lnkLstSelCols").getKendoSortable();
    that.properties.SelRepColumnIds = [];

    if (selCols != null) {
        that.properties.SelectedColumns = [];

        $.each(selCols.items(), function () {
            that.properties.SelRepColumnIds.push($(this).attr("COLUMN_ID"));
            that.properties.SelectedColumns.push({ COLUMN_ID: $(this).attr("COLUMN_ID"), COLUMN_DISPLAY_NAME: $(this).html(), GROUP_COLUMN_DISPLAY_NAME: $(this).html() });
        });
    } else {

        that.properties.SelRepColumnIds = [];

        $.each(that.properties.SelectedColumns, function () {
            that.properties.SelRepColumnIds.push($(this).attr("COLUMN_ID"));
        });

    }

}

//Apply Filters Added to report from Add/Edit Filter
ReportDetailGridView.prototype.applyFilters = function () {
    var that = this;
    that.properties.SelFilterIds = [];
    var grid = $("#grdSelFilters").getKendoGrid();
    if (grid != null) {
        var gridReport = $("#grdSelFilters").getKendoGrid().dataSource;

        for (var j = 0; j < gridReport._data.length; j++) {
            var filter = new Object();
            filter.Id = j + 1;
            filter.ColumnId = gridReport._data[j].COLUMN_ID;
            filter.FilterColumnName = gridReport._data[j].COLUMN_DISPLAY_NAME;
            var dropDownList = $("#ddl_" + gridReport._data[j].COLUMN_ID).getKendoDropDownList();
            var textBox = $("#txt_" + gridReport._data[j].COLUMN_ID).val();

            filter.FilterByOperand = dropDownList.value();
            filter.FilterByValue = textBox;
            filter.ColumnNameInQuery = gridReport._data[j].COLUMN_DISPLAY_NAME;
            that.properties.SelFilterIds.push(filter);
        }
    }
}

ReportDetailGridView.prototype.refreshReport = function () {
    var that = this;
    //Setting xml flag to false to get filtered report
    ReportDetailGridView.prototype.properties.XmlLoad = false;
    ReportDetailGridView.prototype.setSelectedColumns();
    ReportDetailGridView.prototype.applyFilters();

    if (ReportDetailGridView.prototype.properties.NeedtoClearGridContent) {
        ReportDetailGridView.prototype.clearReportContents();
    }
    ReportDetailGridView.prototype.search();

    $.fancybox.close();
}
//Delete Filter
ReportDetailGridView.prototype.deleteFilter = function (colId, name) {
    var that = this;
    var col = [];
    col.push({ COLUMN_ID: colId, COLUMN_DISPLAY_NAME: name });

    $.each(ReportDetailGridView.prototype.properties.FiltersColumnList, function (i) {
        if (this.COLUMN_ID == colId) {
            ReportDetailGridView.prototype.properties.FiltersColumnList.splice(i, 1);
        }
    });

    ReportDetailGridView.prototype.loadFilterGrid();
    that.refreshReport();
}
ReportDetailGridView.prototype.clearReportContents = function () {
    var that = this;
    //columns added or removed need column definition refershed
    //kendoReportInit = false;
    var grid = $(ReportDetailGridView.prototype.options.gridViewSelector).getKendoGrid();
    if (grid != null) {
        grid.columns = [];
        grid.thead.remove();
        grid.dataSource.data([]);
        grid.destroy();
        grid = null;
    }
}
