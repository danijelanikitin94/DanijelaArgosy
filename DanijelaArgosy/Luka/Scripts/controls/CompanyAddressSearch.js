function CompanyAddressSearch(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();

    controlLoader.loadTemplate("CompanyAddressSearch", function (template) {
        $(document.body).append(template);
        that.initialize();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });

}
CompanyAddressSearch.prototype.EVENT_TEMPLATE_LOADED = "COMPANY_ADDRESS_SEARCH_TEMPLATES_LOADED";
CompanyAddressSearch.prototype.options = {};
CompanyAddressSearch.prototype.baseOptions = {
    viewTemplate: "#_CompanyAddressSearchViewTemplate",
    modelBindSelector: "#_CompanyAddressBindContainer",
    orderAddressSelector: "#_OrderAddressContainer",
    addressSelector: "#_AddressContainer",
    userId: 0,
    userGroupId: 0,
    companyId: 0,
    addressSearchViewModel: null,
    keyword: ''
};
CompanyAddressSearch.prototype.searchCriteria = {
    Keyword: null,
};
CompanyAddressSearch.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};
CompanyAddressSearch.prototype.addressSearchViewModel = null;
CompanyAddressSearch.prototype.initialize = function () {
    var that = this,
        wrapper = that.getElement();
    wrapper.append($(that.options.viewTemplate).html());
    kendo.bind(wrapper, kendo.observable({
        showAddressBook: function (e) {
            var model = kendo.observable({
                addresses: that.getDataSource({}),
                orderAddressDataSource: that.getOrderAddressDataSource({}),
                searchAddress: function (e) {
                    var kendoObj = this,
                        dataSource = kendoObj.get("addresses");

                    that.options.keyword = $("#_AddressSearchText").val();
                    dataSource.read();
                },
                updateAddress: function (e) {
                    e.data.userName = that.options.userName;
                    $(document).trigger(argosyEvents.EVENT_USER_SELECTED_ADDRESS, e.data);
                    $.fancybox.close();
                },
                onChange: function (e) {
                    var listview = $("#_AddresslistView").data("kendoListView");
                    listview.dataSource.page(e.sender.page());
                }
            });
            $.fancybox({
                content: $("#_CompanyAddressSearchModal").html(),
                afterShow: function ()  {
                    kendo.bind(this.wrap, model);
                }
            });
        }
    }));
};
CompanyAddressSearch.prototype.getOrderAddressDataSource = function (dataSourceOpts) {
    var that = this,
        dataSource = {};
    $.extend(true, dataSource, _defaultDataSourceConfig, dataSourceOpts);
    dataSource.autoBind = true;
    dataSource.transport = {
        read: function (options) {
                var search = that.options,
                orderAddressContainer = $(that.options.orderAddressSelector);
            $.ajax({
                url: "/DataView/GetOrderAddresses",
                dataType: "text json",
                data: search,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        if (result.Records && result.Records.length === 0) {
                            orderAddressContainer.hide();
                        } else {
                            orderAddressContainer.show();
                        }
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(dataSource);
};

CompanyAddressSearch.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.autoBind = false;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options,
                addressContainer = $(that.options.addressSelector);
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetCompanyAddresses",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        if (result.Records && result.Records.length === 0) {
                            addressContainer.hide();
                        }
                        that.options.initialLoad = false;
                        options.success(result);
                    }
                }
            });
        }
    };
    that.dataSourceOpts.requestStart = function (e) {
        $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
    };
    that.dataSourceOpts.requestEnd = function (e) {
        $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
        if (e.hasOwnProperty('response')) {
            if (e.response.TotalRecords <= 6) {
                $("#_AddressPager").addClass("hidden");
            } else {
                $("#_AddressPager").removeClass("hidden");
            }
            if (e.response.TotalRecords <= 0) {
                $(".empty-address").removeClass("hidden");
            } else {
                $(".empty-address").addClass("hidden");
            }
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

CompanyAddressSearch.prototype.dataSourceOpts = {};
