function ConsumerUserSearch(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
            if ($("#_ConsumerSearchModal").css('display') !== "none" || that.options.initialLoad === true) {
              that.refineSearch(data);
             }
       
    });
    $(document).bind(argosyEvents.CLEAR_SELECTED_CONSUMER, function (e) {
        if (that.options.userSearchViewModel) {
            that.options.userSearchViewModel.clearSelectedUser();
        }
    });
   
    $(document).bind(argosyEvents.EVENT_CONSUMER_UPDATED, function (e, consumer) {
        that.refineSearch({});
    });
    controlLoader.loadTemplate("ConsumerUserSearch", function (template) {
        $(document.body).append(template);
        $("*[data-argosy-uuid='" + that.options.uuid + "']").append($(that.options.viewTemplate).html());
        that.refineSearch({});
        that.loaded = true;
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });

}

ConsumerUserSearch.prototype.EVENT_TEMPLATE_LOADED = "CONSUMER_USER_SEARCH_TEMPLATES_LOADED";
ConsumerUserSearch.prototype.options = {};
ConsumerUserSearch.prototype.baseOptions = {
    viewTemplate: "#_ConsumerUserSearchViewTemplate",
    gridViewSelector: "div[data-argosy-view=ConsumerUserSearch]",
    modelBindSelector: "#_ConsumerUserBindContainer",
    addBtn: "#addConsumerBtn",
    clearBtn:"#clearConsumerBtn",
    searchBtn: "#searchConsumerBtn",
    AddNewBtn: "#_ConsumerUserCreateModal",
    valueSelector: "#_hiddenConsumerId",
    consumerNameLabel:"#ConsumersFullName",
    userSearchViewModel: null,
    initialLoad:true
};
ConsumerUserSearch.prototype.searchCriteria = {
    Keyword: null,
    recordSizeCategory:0
};

ConsumerUserSearch.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

ConsumerUserSearch.prototype.setupGrid = function () {
    $('#_ConsumerSearchAlert').addClass('hidden');
    var that = this;
        that.options.userSearchViewModel = kendo.observable({
            clearSelectedUser: function (e) {
                $(that.options.consumerNameLabel).html('');
                that.updateBtns(false);
                $(that.options.valueSelector).val(0);
            },
            addUsers: function (e) {
                var selectedConsumer = null;
                var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();
                $(kendoGrid.select()).each(function (i) {
                    selectedConsumer = kendoGrid.dataItem(this);
                });
                
                if (selectedConsumer !== null) {
                    $(that.options.valueSelector).val(selectedConsumer.ConsumerId);
                    that.updateBtns(true);
                    $(document).trigger(argosyEvents.SELECTED_CONSUMER, selectedConsumer);
                    $(that.options.consumerNameLabel).html(selectedConsumer.ConsumerFirstName + " " + selectedConsumer.ConsumerLastName);
                    $.fancybox.close();
                } else {
                    $('#_ConsumerSearchAlert').removeClass('hidden');
                }
            }
        });

    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            exportToExcel: false,
            sortable: true,
            selectable: "single, row",
           
            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "~{Consumer}~",
                    template: "${ConsumerFirstName} ${ConsumerLastName} <br/> ${ConsumerCompanyName}"
                },
                {
                    title: "~{Address}~",
                    template: "${ConsumerAddress1} <br/>${ConsumerCity},${ConsumerStateCode} ${ConsumerZip}"
                }
                
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByNameCompany﻿}~", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
        kendo.bind($(that.options.modelBindSelector), that.options.userSearchViewModel);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
        grid.dataSource.sort({});
        grid.dataSource.filter({});
    }

};
ConsumerUserSearch.prototype.updateBtns = function (userIsSelected) {
    var that = this,
        editingBtns = that.options.clearBtn + "," + that.options.searchBtn;
    if (userIsSelected === true) {
        $(editingBtns).removeClass('hidden');
        $(that.options.addBtn).addClass('hidden');
    } else {
        $(editingBtns).addClass('hidden');
        $(that.options.addBtn).removeClass('hidden');
    }
};
ConsumerUserSearch.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetConsumers",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        that.options.initialLoad = false;
                        options.success(result);
                        $.fancybox.update();
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

ConsumerUserSearch.prototype.dataSourceOpts = {};
