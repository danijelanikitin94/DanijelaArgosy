function MailingListExisting(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListExisting", function (template) {
        $(document.body).append(template);
        that.initialize();
        controlLoader.processControlElement($("[data-argosy-control=MailingListShippingOptions]"));
    });
}

MailingListExisting.prototype.options = {};

MailingListExisting.prototype.baseOptions = {
    dataSource: null,
    gridSelector:  "#_mailingListExistingWrapper",
    listNameSelector: ".list-name",
    listRecordCountSelector: ".record-count",
    listRecordsNeededSelector: "#records-needed",
    templates: {
        contentTemplate: "#_MailingListExistingTemplate"
    }
};
MailingListExisting.prototype.dataSourceOpts = {

};

MailingListExisting.prototype.initialize = function () {
    var that = this;
    var sku = that.options.sku == null ? getQuerystring("sku") : that.options.sku;
    var customizationStateId = that.options.customizationStateId == null ? getQuerystring("customizationStateId") : that.options.customizationStateId;

    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())({
        Sku: sku,
        CustomizationStateId: customizationStateId,
        Name: that.options.displayName
    });
    that.getElement().append(content);
    that.getElement().find(that.options.listRecordsNeededSelector).kendoNumericTextBox({
        decimals: 0,
        format: "n0",
        spinners: false
    });
    that.setupGrid();
};

MailingListExisting.prototype.setupGrid = function() {
    var that = this;
    that.grid = $(that.options.gridSelector);
    that.grid = that.grid.kendoGrid({
        dataSource: that.getDataSource(),
        groupable: false,
        sortable: true,
        selectable: true,
        scrollable: false,
        dataBound: function () {
            $(".k-grid table tbody tr").hover(function () {$(this).toggleClass("k-grid k-state-hover");});
            $("table.k-focusable tbody tr").hover(function () { $(this).toggleClass("k-state-hover"); });
            $(".k-grid table tbody tr").dblclick(function (e) {
                var data = that.grid.getKendoGrid().dataItem(this);
                var element = that.getElement();
                $.submitAsForm("/Tools/Mailing/Mapper?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), data, "listData");
            });
        },
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        change: function (e) {
            /*var data = this.dataItem(this.select());
            var element = that.getElement();
            element.find(that.options.listNameSelector).text(data.Name);
            element.find(that.options.listRecordCountSelector).text(kendo.toString(data.TotalRecords, 'n0'));
            var input = element.find(that.options.listRecordsNeededSelector).getKendoNumericTextBox();
            if (input.value() == 0 || input.value() > data.TotalRecords) {
                input.value(data.TotalRecords);
            }*/
        },
        columns: [/*{
            template: "<input type='checkbox' />"
        }, {

            template: "<i class='fa fa-pencil'></i>"

        }, {

            template: "<i class='fa fa-trash-o'></i>"

        }, */{
            title: "~{DateCreated}~",
            template: "${kendo.toString(new Date(DateCreated),'d')}",
            field: "DateCreated"
        }, {
            title: "~{ListName}~",
            field: "Name"
        }, {
            title: "<div class='textr'>~{NumberOfRecords}~</div>",
            template: "<div class='textr'>${kendo.toString(TotalRecords,'n0')}</div>",
            field: "TotalRecords"
        }],
        /*toolbar: [
            {
                text: "<i class='fa fa-plus'></i>Add single contact"
            },

        ],*/
        search: [
            { name: "Name", type: "text", placeholder: "~{SearchByListName}~", toolbar: true },
        ]
    });
}

MailingListExisting.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetMailLists",
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
    that.dataSourceOpts.pageSize = 15;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

MailingListExisting.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};