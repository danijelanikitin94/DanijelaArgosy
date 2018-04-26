function ModalPersistentMessageDetail(opts) {
    var that = this;
    var controlLoader = new ControlLoader();
    $.extend(true, that.options, opts);
    $.ajax({
        url: "/Account/Messages/ShowPersistentMessageCheck",
        type: "GET",
        dataType: "json",
        cache: false,
        complete: function (result) {
            if (result.responseText === "True") {
                controlLoader.loadTemplate("ModalPersistentMessageDetail", function (template) {
                    $.fancybox({
                        modal: true,
                        content: kendo.template($(template).html())(that.options),
                        beforeShow: function () {
                            $(document).trigger(argosyEvents.START_LOADING);
                        },
                        afterShow: function () {
                            $(document).trigger(argosyEvents.END_LOADING);
                            $(this.wrap).find("div.btn.btn-primary").click(function () {
                                $.ajax({
                                    url: "/Account/Messages/SetPersistentMessageViewed",
                                    type: "POST",
                                    dataType: "json",
                                    success: function (data) {
                                        if (data.ReturnCode === ReturnCode.Success) {
                                            $.fancybox.close();
                                        } else {
                                            prompt.clientResponseError(data);
                                        }
                                    }
                                });
                            });
                        }
                    });
                });
            }
        }
    });
}

ModalPersistentMessageDetail.prototype.options = {};
