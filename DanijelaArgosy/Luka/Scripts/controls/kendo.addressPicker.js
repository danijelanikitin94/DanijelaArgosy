(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var AddressPicker = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            controlLoader.loadTemplate("AddressPicker", function (data) {
                $(document.body).append(data);
                that._initialize();
            });
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "AddressPicker",
            keyword: "",
            addToBook: null,
            userId: null,
            userName: "",
            billTo: null,
            shipTo: null,
            companyId: null,
            isBilling: false,
            isUserlevel: null,
            templates: {
                link: "#_AddressPickerLink",
                modal: "#_AddressPickerModal",
                item: "#_AddressPickerItem"
            }
        },
        value: function (data) {
            var that = this;
            if (data == null) {
                return null;
            } else {
                // set the address?
            }
        },
        _initialize: function () {
            var that = this;
            $(that.element).append($(that.options.templates.link).html());
            kendo.bind(that.element, kendo.observable({
                companyAddressDataSource: that._getCompanyAddressDataSource(),
                orderAddressDataSource: that._getOrderAddressDataSource(),
                keyword: "",
                onAddressSelect: function (e) {
                    e.data.userName = that.options.userName;
                    if (that.options.isBilling) {
                        $(document).trigger(argosyEvents.EVENT_USER_SELECTED_BILLING_ADDRESS, e.data);
                    } else {
                        $(document).trigger(argosyEvents.EVENT_USER_SELECTED_ADDRESS, e.data);
                    };
                    $.fancybox.close();
                },
                searchAddress: function (e) {
                    that.options.keyword = this.keyword;
                    this.companyAddressDataSource.read();
                    if (that.options.showOrderAddresses) {
                        this.orderAddressDataSource.read();
                    };
                },
                onDataBound: function (e) {
                    var count = e.sender.dataSource._total;
                    if (count > 0) {
                        e.sender.wrapper.closest(".listViewWrapper").removeClass("hide").show();
                    } else {
                        e.sender.wrapper.closest(".listViewWrapper").removeClass("show").hide();
                    }
                    if (count > 50) {
                        e.sender.wrapper.closest(".listViewWrapper").find("*[data-role=pager]").removeClass("hide").show();
                    } else {
                        e.sender.wrapper.closest(".listViewWrapper").find("*[data-role=pager]").removeClass("show").hide();
                    }
                    $.fancybox.update();
                },
                onPreviousDataBound: function (e) {
                    var count = e.sender.dataSource.total();
                    if (!that.options.isBilling && count > 0) {
                        e.sender.wrapper.closest(".listViewWrapper").removeClass("hide").show();
                    } else {
                        e.sender.wrapper.closest(".listViewWrapper").removeClass("show").hide();
                    }
                    if (!that.options.isBilling && count > 50) {
                        e.sender.wrapper.closest(".listViewWrapper").find("*[data-role=pager]").removeClass("hide").show();
                    } else {
                        e.sender.wrapper.closest(".listViewWrapper").find("*[data-role=pager]").removeClass("show").hide();
                    }
                    $.fancybox.update();
                },
                showAddressBook: function (e) {
                    var parentModel = this,
                        content = $(that.options.templates.modal).html();
                    $.fancybox({
                        content: content,
                        afterShow: function () {
                            kendo.bind(this.wrap, parentModel);
                            $.fancybox.update();
                        }
                    })
                }
            }));
        },
        _getCompanyAddressDataSource: function () {
            var that = this,
                dataSource = {
                    requestStart: function () {
                        block();
                    },
                    requestEnd: function () {
                        unblock();
                    },
                    autoBind: true,
                    transport: {
                        read: function (options) {
                            var search = {
                                userId: that.options.userId,
                                companyId: that.options.companyId,
                                keyword: that.options.keyword,
                                shipTo: that.options.shipTo,
                                billTo: that.options.billTo
                            };
                            $.extend(true, search, kendoOptionsToObject(options), {});
                            $.ajax({
                                url: "/DataView/GetAvailableAddressesForUser",
                                dataType: "text/json",
                                data: search,
                                type: "POST",
                                complete: function (result) {
                                    options.success(JSON.parse(result.responseText));
                                }
                            });
                        }
                    },
                    serverPaging: true,
                    pageSize: 10,
                    serverFiltering: true
                };
            $.extend(true, dataSource, _defaultDataSourceConfig);
            return new kendo.data.DataSource(dataSource);

        },
        _getOrderAddressDataSource: function () {
            var that = this,
                dataSource = {
                    autoBind: false,
                    transport: {
                        read: function (options) {
                            var search = {
                                userId: that.options.userId,
                                userGroupId: that.options.userGroupId,
                                companyId: that.options.companyId,
                                addToAddressBook: that.options.addToBook,
                                userName: that.options.userName,
                                keyword: that.options.keyword
                            };
                            $.extend(true, search, kendoOptionsToObject(options), {});
                            $.ajax({
                                url: "/DataView/GetOrderAddresses",
                                dataType: "text/json",
                                data: search,
                                type: "POST",
                                complete: function (result) {
                                    options.success(JSON.parse(result.responseText));
                                }
                            });
                        }
                    }
                };
            $.extend(true, dataSource, _defaultDataSourceConfig);
            return new kendo.data.DataSource(dataSource);

        }
    });
    ui.plugin(AddressPicker);
})(jQuery);