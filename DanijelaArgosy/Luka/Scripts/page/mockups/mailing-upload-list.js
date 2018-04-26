$(document).ready(function () {
    $("#grid").kendoGrid({
        dataSource: {
            type: "odata",
            transport: {
                read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
            },
            pageSize: 5
        },
        groupable: false,
        sortable: false,
        scrollable: false,
        pageable: false,
        columns: [{
            field: "ContactName",
            title: "Contact Name",
            width: 200
        }, {
            field: "ContactTitle",
            title: "Contact Title"
        }, {
            field: "CompanyName",
            title: "Company Name"
        }, {
            field: "Country"
        }]
    });

    $("#showSampleMapping").on('click', function () {

        $("#divSampleMapping").show("slow");

    });
});