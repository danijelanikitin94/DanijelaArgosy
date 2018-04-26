var prompt = null;

$(document).ready(function (e) {
    prompt = new Message({});
});

function Message(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("Message", function (template) {
        that.TEMPLATE = $(template);
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

Message.prototype.options = {};
Message.prototype.defaultMessage = {
    question: "No question defined?",
    description: "",
    button: "Continue",
    buttonClass: "btn-default",
    buttonNo: "Cancel",
    buttonNoIcon: "fa-stop-circle-o",
    buttonNoClass: "btn-default",
    buttonNoHidden: true,
    buttonMaybe: "Maybe",
    buttonMaybeIcon: "fa-stop-circle-o",
    buttonMaybeClass: "btn-default",
    buttonMaybeHidden: true,
    type: "warning",
    yes: function(e) {
        $.fancybox.close();
    },
    no: null,
    maybe: null
};

Message.prototype.baseOptions = {
    templateSelector: "#_AlertNotificationTemplate",
};

Message.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_ALERT_NOTIFICATIONS_LOADED";
Message.prototype.TEMPLATE = null;


Message.prototype.initKendoNotifications = function () {
    var that = this;
    if ($(window).getKendoNotification() == null) {
        $(window).kendoNotification({
            autoHideAfter: 15000,
            bottom: 20,
            right: 20
        });
    }
    return $(window).getKendoNotification();
};
Message.prototype.notify = function(message) {
    var that = this;

    message = that.makeMessageObject(message);

    that.setNotification(message);
};
Message.prototype.success = function (message) {
    var that = this;

    message = that.makeMessageObject(message, "success");

    that.setNotification(message);
};
Message.prototype.error = function (message) {
    var that = this;

    message = that.makeMessageObject(message, "error");

    that.setNotification(message);
};

Message.prototype.log = function (message) {
    var that = this;
    message = that.makeMessageObject(message);
    window.console && console.log(message.question);
};

Message.prototype.makeMessageObject = function (message, type) {
    var that = this;
    var data = {};
    if (type == null) {
        type = "warning";
    }
    if (typeof message == 'string' || message instanceof String) {
        data = {
            question: message,
            type: type
        };
    } else {
        data = message;
    }
    return data;
};
Message.prototype.setNotification = function (message) {
    var that = this;
    var notify = that.initKendoNotifications({
        autoHideAfter: 2000
    });

    var data = {};
    $.extend(true, data, that.defaultMessage, message);
    if (message.question != null && message.question.toLowerCase() === "null") {
        message.question = "An error occurred.  Please contact support.";
    }
    switch (data.type) {
        case "warning":
            notify.warning(message.question);
            break;
        case "error":
            notify.error(message.question);
            break;
        case "info":
            notify.info(message.question);
            break;
        case "success":
            notify.success(message.question);
            break;
    }
};

Message.prototype.alert = function (message) {
    var that = this;
    if (that.TEMPLATE) {
        var template = kendo.template(that.TEMPLATE.html());
        var data = {};
        $.extend(true, data, that.defaultMessage, message);
        if (data.description == "Ref: null") {
            data.description = "";
        }
        data.icon = (data.type == "success" ? "check" : data.type);
        $.fancybox({
            content: template(data),
            afterShow: function() {
                var fancybox = this.wrap;
                var continueButton = fancybox.find(".notification a.btn.yes");
                var maybeButton = fancybox.find(".notification a.btn.maybe");
                var cancelButton = fancybox.find(".notification a.btn.no");
                continueButton.unbind("click");
                continueButton.click(function(e) {
                    if (data.yes != null) {
                        data.yes(e);
                    }
                });
                maybeButton.unbind("click");
                maybeButton.click(function(e) {
                    if (data.maybe != null) {
                        data.maybe(e);
                    }
                });
                cancelButton.unbind("click");
                cancelButton.click(function(e) {
                    if (data.no != null) {
                        data.no(e);
                    }
                });
            },
            afterClose: function(e) {
                if (data.no != null && data.yes == null) {
                    setTimeout(function() {
                            data.no(e);
                        },
                        100);
                } else if (data.yes != null && data.no == null) {
                    setTimeout(function() {
                            data.yes(e);
                        },
                        100);
                }
            },
            keys: {
                close: [27, 13, 32]
            }
        });
    }
};

Message.prototype.clientResponseError = function (result) {
    prompt.alert({
        question: result.Message,
        description: result.Guid == null ? "" : result.Guid,
        button: "Acknowledge",
        type: "warning"
    });
}