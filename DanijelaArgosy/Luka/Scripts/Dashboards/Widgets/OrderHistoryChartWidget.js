function LoadOrderHistory() {
    var chart = $("#LoadOrderHistoryDiv").data("kendoChart");
    args.startDate = startDate;
    args.endDate = endDate; args.filterBy = filterBy;
    args.userIds = userIds;
    kendo.ui.progress($("#LoadOrderHistoryDiv"), true); chart.dataSource.read()
}
var dsOrderHis = null;
function LoadOrderHistoryHideSvg() {
    
    $("#LoadOrderHistoryDiv").removeClass('showLoading').addClass('showImage');
    if ($("#LoadOrderHistoryDiv svg").length > 0) {
         $("#LoadOrderHistoryDiv svg").each(function() {
             $(this).fadeOut();
         })
    } else { $("#LoadOrderHistoryDiv div:first-child").fadeOut(); }
}
function LoadOrderHistoryLarge() {
     $('#largeChart').kendoChart({
         title:{ text: 'Order: History' },
         dataSource: dsOrderHis,
         legend: { position: "bottom", visible: false },
         series: [{ type: "line", field: "YAxis" }],
         categoryAxis: {
             field: "XAxisLabel",
             labels: { rotation: 42 }
         },
         valueAxis: {
              labels: { format: ' {0:n0}' }
         },
         tooltip: {
             visible: true,
             template: "#= kendo.format('{0:n0}',dataItem.YAxis) # orders placed in #= dataItem.XAxisLabel # .",
             padding: 9
         },
         
     });
    $('a#anchorLargeChart').trigger('click');
}
function LoadOrderHistoryAddIcon() {
    
    $("#LoadOrderHistoryDiv").append("<a class=\"anchor_icon\" onclick=\"LoadOrderHistoryLarge();return false; \"><img src=\"http://portal.mypropago.com/images/ArgosyV4/Styles/Default/Dashboard/maximize-icon.png\" /></a>")

}
$(document).ready(function () {
    
    args.startDate = startDate;
    args.endDate = endDate;
    args.filterBy = filterBy;
    args.userIds = userIds;
    dsOrderHis = new kendo.data.DataSource({
         transport: { read: {
             cache: false,
             url: "/admin/dashboards/GetOrderHistory",
             dataType: "json",
             contentType: "application/json; charset=utf-8", type: "POST"
         }
          
         },
         change: function () {
             //debugger;
             var dataCount = $("#LoadOrderHistoryDiv").data("kendoChart").dataSource.view().length;
             if (dataCount <= 0) {
                 setTimeout("LoadOrderHistoryHideSvg();", 400);
             } else {
                 $("#LoadOrderHistoryDiv").removeClass('showImage').addClass('showLoading');
                 if ($("#LoadOrderHistoryDiv svg").length > 0) {
                     $("#LoadOrderHistoryDiv svg").each(function() {
                         $(this).fadeIn();
                     });
                 } else {
                      $("#LoadOrderHistoryDiv div:first-child").fadeIn();
                 }
                 setTimeout("LoadOrderHistoryAddIcon();", 100);
             }
         }
    });
    
    $('#LoadOrderHistoryDiv').kendoChart({
        dataBound: function (e) {
            $("#LoadOrderHistoryLoading").hide();

        },
        title: {
            text: 'Order: History'
        },
        dataSource: dsOrderHis,
        legend: {
            position: "bottom",
            visible: false
        },
        series: [
            {
                type: "line",
                field: "YAxis"
            }
        ],
        categoryAxis: {
            field: "XAxisLabel",
            labels: { rotation: 42 }
        },
        valueAxis: {
            labels: {
                format: '{0:n0}'
            }
        },
        tooltip: { visible: true, template: " #= kendo.format('{0:n0}',value) # orders placed in #= category # .", padding: 9 }
    });
});