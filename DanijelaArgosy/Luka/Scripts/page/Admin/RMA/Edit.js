function CompleteRMA() {
    alert($("#RMANumber").val());

    //var that = this;
    //var message = {
    //    question: "Are you sure you want to complete the RMA Order " + $("#RMANumber").val() + "?",
    //    description: "",
    //    button: "Complete",
    //    type: "warning",
    //    yes: function (e) {
    //        that.completeOrder();
    //    }
    //};
    //prompt.alert(message);
}

function completeOrder() {
    var params = { RMANumber: $("#RMANumber").val() };

    $.ajax({
        url: '/Admin/RMA/CompleteOrder',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Data).each(function () {
                    prompt.notify({
                        question: this.Value ? result.Message : "The RMA Order was " + (!this.Value ? "" : "not") + " successfully completed.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
        }
    });
    $.fancybox.close();
}