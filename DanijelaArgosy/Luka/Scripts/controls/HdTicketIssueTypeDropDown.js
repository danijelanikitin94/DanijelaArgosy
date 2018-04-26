function HdTicketIssueTypeDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setUpDropDown();
}
HdTicketIssueTypeDropDown.prototype.options = {};

HdTicketIssueTypeDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=HdTicketIssueTypeDropDown]"
};

HdTicketIssueTypeDropDown.prototype.setUpDropDown = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {
       
        $(that.options.ddlViewSelector).kendoDropDownList({
            dataSource: { data: HDIssueTypes },
            dataTextField: "text",
            dataValueField: "value",
            optionLabel: "-- Select Issue Type --",

        });
    }

};
