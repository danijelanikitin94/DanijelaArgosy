$(document).ready(function () {

    $("#grid_deduping").kendoGrid({
        dataSource: {
            type: "odata",
            transport: {
                read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
            },
            pageSize: 5
        },
        groupable: false,
        sortable: true,
        selectable: false,
        scrollable: false,
        pageable: false,
        columns: [{
            template: "Anna Jackson",
            title: "Full Name"
        }, {

            template: "123 Any Street Street<br />Suite 123<br />Townsville Texas 54321",
            title: "Uploaded Address"

        }
        , {

            template: "2 records",
            title: "No. of Duplicates"

        }, {

            template: "<a id='checkbox_click'><i id='checkbox_status' class='fa fa-square-o'></i><a>",
            width: "150px",
            title: "Keep Duplicate"

        }],
    });




});
