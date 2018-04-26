function ProductViewDataSource(options) {
    var that = this;
    that.options = $.extend(true, that.options, that._defaultOptions, options);
    return new kendo.data.DataSource(that.options);
}

ProductViewDataSource.prototype._defaultOptions = {
    transport: {
        read: function(options) {
            $.ajax({
                url: "/DataView/GetProductView",
                dataType: "jsonp",
                success: function(result) {
                    options.success(result);
                },
                error: function(result) {
                    options.error(result);
                }
            });
        }
        /*read: {
            url: "/DataView/GetProductView",
        },
        prefix: ""*/
    },
    pageSize: 20,
    page: 1,
    serverPaging: true,
    serverSorting: true,
    serverFiltering: true,
    sort: [
        {
            field: "PartName",
            encoded: false,
            dir: "asc"
        }
    ],
    filter: [],
    schema: {
        data: "Records",
        total: "TotalRecords",
        errors: "Errors",
        model: {
            fields: {
                PartId: {
                    type: "number"
                },
                CompanyId: {
                    type: "number"
                },
                SiteId: {
                    type: "number"
                },
                PartName: {
                    type: "string"
                },
                Description: {
                    type: "string"
                },
                ThumbnailFile: {
                    type: "string"
                },
                Sku: {
                    type: "string"
                },
                FormFolder: {
                    type: "string"
                },
                CommodityCode: {
                    type: "string"
                },
                Manufacturer: {
                    type: "string"
                },
                OrderUnit: {
                    type: "string"
                },
                QuantityAvailable: {
                    type: "number"
                },
                QuantityOnHand: {
                    type: "number"
                },
                Pieces: {
                    type: "number"
                },
                IsRegularKit: {
                    type: "number"
                },
                IsDynamicKit: {
                    type: "number"
                },
                IsBundleKit: {
                    type: "number"
                },
                IsKit: {
                    type: "number"
                },
                IsFeatured: {
                    type: "string"
                },
                CanCustomize: {
                    type: "string"
                },
                CanUpload: {
                    type: "boolean"
                },
                CanCreateList: {
                    type: "boolean"
                },
                CanDirectMail: {
                    type: "boolean"
                },
                ClientCode: {
                    type: "string"
                },
                BuyerGroup: {
                    type: "string"
                },
                PartCategory: {
                    type: "string"
                },
                LeadTime: {
                    type: "string"
                },
                ItemType: {
                    type: "string"
                },
                Plant: {
                    type: "string"
                },
                IsNew: {
                    type: "number"
                }
            }
        }
    }
};