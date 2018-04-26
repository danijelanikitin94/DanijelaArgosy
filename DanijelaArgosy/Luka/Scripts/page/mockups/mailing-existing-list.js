$(document).ready(function () {
    addExtraStylingToGrid = function () {
        $(".k-grid table tbody tr").hover(

            function () {
                $(this).toggleClass("k-grid k-state-hover");
            }

          );


        $("table.k-focusable tbody tr").hover(

          function () {
              $(this).toggleClass("k-state-hover");
          }

        );
    };

    $("#grid").kendoGrid({
        dataSource: {
            type: "odata",
            transport: {
                read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
            },
            pageSize: 10
        },
        groupable: false,
        sortable: true,
        selectable: true,
        scrollable: false,
        dataBound: addExtraStylingToGrid,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        columns: [{

            template: "<input type='checkbox' />"

        }, {
            
            template: "<i class='fa fa-pencil'></i>"

        }, {

            template: "<i class='fa fa-trash-o'></i>"

        }, {
            title: "<div class='text-center'>Date Created</div>",
            template: "<div class='text-center'>11/7/2014</div>"

        }, {
            title: "List Name",
            template: "Corporate @ 11/20/2014 8:53:15 AM"
        }, {
            title: "<div class='textr'># of Records</div>",
            template: "<div class='textr'>280</div>"
        }],

        toolbar: [
         { text: "<i class='fa fa-plus'></i>Add single contact" 
         },

        ],
       
        search: [
            { name: "Name", type: "text", placeholder: "Search by List Name", toolbar: true },
     
        ],

        // this is where the hover effect function is bound to grid]

    });
});
