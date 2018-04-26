function BuyerGroupReports(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.Frequency = that.options.frequency;
    that.DayOfMonth = that.options.dayOfMonth;

    that.setUpControls();
}

BuyerGroupReports.prototype.options = {};

BuyerGroupReports.prototype.baseOptions = {
    ddlSelector: "div[data-argosy-view=BuyerGroupReports]"
};

BuyerGroupReports.prototype.setUpControls = function () {
    var that = this;

    var frequency = [
        { value: "W", text: "~{Weekly}~" },
        { value: "B", text: "~{Bi-Weekly}~" },
        { value: "M", text: "~{Monthly}~" }
    ];
 
    $(that.options.ddlSelector).kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: frequency,
        change: function () {
            if (this.value() == "M") {
                that.setUpMonthDdl();
                $("#divSelectMonthDays").show();
                $("#divSelectWeekDays").hide();
            } else {
                $("#ChkSunday").attr('checked', false);
                $("#ChkSunday").val(false);
                $("#ChkMonday").attr('checked', false);
                $("#ChkMonday").val(false);
                $("#ChkTuesday").attr('checked', false);
                $("#ChkTuesday").val(false);
                $("#ChkWednesday").attr('checked', false);
                $("#ChkWednesday").val(false);
                $("#ChkThursday").attr('checked', false);
                $("#ChkThursday").val(false);
                $("#ChkFriday").attr('checked', false);
                $("#ChkFriday").val(false);
                $("#ChkSaturday").attr('checked', false);
                $("#ChkSaturday").val(false);

                $("#divSelectMonthDays").hide();
                $("#divSelectWeekDays").show();
            }
        }
    });

    $(that.options.ddlSelector).getKendoDropDownList().value(that.options.frequency);

    that.setControlValues(that.options.frequency);

};

BuyerGroupReports.prototype.setUpMonthDdl = function () {
    var that = this;

    var monthDays = [
           { value: "1", text: "1" },
          { value: "2", text: "2" },
          { value: "3", text: "3" },
          { value: "4", text: "4" },
          { value: "5", text: "5" },
          { value: "6", text: "6" },
          { value: "7", text: "7" },
          { value: "8", text: "8" },
          { value: "9", text: "9" },
          { value: "10", text: "10" },
          { value: "11", text: "11" },
          { value: "12", text: "12" },
          { value: "13", text: "13" },
          { value: "14", text: "14" },
          { value: "15", text: "15" },
          { value: "16", text: "16" },
          { value: "17", text: "17" },
          { value: "18", text: "18" },
          { value: "19", text: "19" },
          { value: "20", text: "20" },
          { value: "21", text: "21" },
          { value: "22", text: "22" },
          { value: "23", text: "23" },
          { value: "24", text: "24" },
          { value: "25", text: "25" },
          { value: "26", text: "26" },
          { value: "27", text: "27" },
          { value: "28", text: "28" },
          { value: "29", text: "29" },
          { value: "30", text: "30" },
          { value: "31", text: "31" }];

    $('#ddlDayOfMonth').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: monthDays
    });
}

BuyerGroupReports.prototype.setControlValues = function (frequency) {
    var that = this;
    if (frequency == "M") {
        that.setUpMonthDdl();
        $("#divSelectMonthDays").show();
        $("#divSelectWeekDays").hide();
    } else {
        $("#divSelectMonthDays").hide();
        $("#divSelectWeekDays").show();
    }
}