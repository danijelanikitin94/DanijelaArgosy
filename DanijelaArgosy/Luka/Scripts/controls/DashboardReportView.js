function DashboardReportView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.addScriptWithPath("OrderHistoryChartWidget.js", "/Scripts/Dashboards/Widgets/");
    
    controlLoader.loadTemplate("DashboardReportView", function (template) {
        $(document.body).append(template);
        that.loaded = true;
       
    });
}

DashboardReportView.prototype.options = {};
