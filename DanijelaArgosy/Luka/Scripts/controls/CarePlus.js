function CarePlus(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    that.options.element = $("[data-argosy-uuid=" + that.options.uuid + "]");
    controlLoader.loadTemplate("CarePlus", function (template) {
        $("#_CarePlusContent").html(template);
        that.options.viewModel = that.setupViewModel();
        kendo.bind($("#_CarePlusContent"), that.options.viewModel);
    });
}

CarePlus.prototype.options = {
    element: null,
    viewModel: null
};

CarePlus.prototype.setupViewModel = function () {
    var that = this,
        viewModel = kendo.observable({
            carePlusModel: {
                SystemAssignNumber: null,
                LastName: "",
                CountryId: 219
            },
            loginModel: {
                RegistrationUser: {
                    User: {
                        FirstName: "",
                        LastName: "",
                        Address1: "",
                        Address2: "",
                        City: "",
                        State: {
                            StateId: 0
                        },
                        Country: {
                            CountryId: 0
                        },
                        ZipCode: "",
                        PhoneNumber: 0,
                        Fax: 0,
                        Email: ""
                    }
                }
            },
            data: {
                AGT_CNT: 0
            },
            getData: function () {
                var vm = this,
                    systemAssignNumber = $("#txtSAN").val(),
                    isNumeric = function (obj) {
                        return !$.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
                    };
                vm.carePlusModel.LastName = $("#txtLName").val();

                if (!isNumeric(parseInt(systemAssignNumber)) || systemAssignNumber === "") {
                    prompt.notify({
                        question: "SAN is numbers only",
                        type: "error"
                    });
                } else {
                    vm.carePlusModel.SystemAssignNumber = parseInt(systemAssignNumber);
                    $(document).trigger(argosyEvents.START_LOADING);
                    $.ajax({
                        url: "/DataView/GetCarePlusData?systemAssignNumber=" + vm.carePlusModel.SystemAssignNumber,
                        dataType: "json",
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        success: function (result) {
                            $(document).trigger(argosyEvents.END_LOADING);
                            if (result.ReturnCode === ReturnCode.Success) {
                                vm.set("data", kendo.observable(result.Records));
                                CarePlus.prototype.options.viewModel.getUser();
                            } else {
                                prompt.notify({
                                    question: result.Message,
                                    type: "error"
                                });
                            };
                        }
                    });
                };
            },
            getUser: function () {
                var vm = this;
                $(document).trigger(argosyEvents.START_LOADING);
                $.ajax({
                    url: "/DataView/GetCarePlusUser",
                    dataType: "json",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({
                        data: vm.data,
                        lastName: vm.carePlusModel.LastName
                    }),
                    success: function (result) {
                        $(document).trigger(argosyEvents.END_LOADING);
                        if (result.Records !== null) {
                            prompt.notify({
                                question: result.Message,
                                type: "success"
                            });
                            vm.set("loginModel", kendo.observable({
                                RegistrationUser: {
                                    User: result.Records
                                }
                            }));
                            CarePlus.prototype.options.viewModel.loginModel.RegistrationUser.User = result.Records;
                            CarePlus.prototype.options.viewModel.loginModel.RegistrationUser.User.Custom01 = vm.data.AGT_SYS_ASSGN_NBR;
                            CarePlus.prototype.options.viewModel.loginModel.RegistrationUser.User.Custom02 = vm.data.SAN_TYPE.toUpperCase();
                            if (CarePlus.prototype.options.viewModel.loginModel.RegistrationUser.User.Custom02 === "AGCY") {
                                CarePlus.prototype.options.viewModel.loginModel.RegistrationUser.User.Custom03 = $("#txtAgentCount").val();
                            };
                            $("div[data-role='states']").getKendoStates()
                                .value(CarePlus.prototype.options.viewModel.loginModel.RegistrationUser.User.StateId);
                            if (result.ReturnCode === ReturnCode.Success) {
                                CarePlus.prototype.options.viewModel.getLoginModel();
                            } else {
                                CarePlus.prototype.options.viewModel.setupRegister();
                            };
                        } else {
                            prompt.notify({
                                question: result.Message,
                                type: "error"
                            });
                        };
                    }
                });
            },
            getLoginModel: function () {
                var vm = this,
                    user = vm.loginModel.RegistrationUser.User;
                $(document).trigger(argosyEvents.START_LOADING);
                $.ajax({
                    url: "/Register/CarePlusGetLoginModel",
                    dataType: "json",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({
                        user: user
                    }),
                    success: function (result) {
                        $(document).trigger(argosyEvents.END_LOADING);
                        vm.loginModel = result.Records;
                        if (result.ReturnCode === ReturnCode.Success) {
                            vm.login();
                        }
                        else {
                            prompt.notify({
                                question: result.Message,
                                type: "error"
                            });
                        };
                    }
                });
            },
            login: function () {
                var vm = this;
                $(document).trigger(argosyEvents.START_LOADING);
                $.ajax({
                    url: "/Register/CarePlusLogin",
                    dataType: "json",
                    type: "POST",
                    data: JSON.stringify(vm.loginModel),
                    contentType: "application/json; charset=utf-8",
                    success: function (result) {
                        $(document).trigger(argosyEvents.END_LOADING);
                        that.loginModel = result.Records;
                        if (result.ReturnCode === ReturnCode.Success) {
                            window.location = that.loginModel.ReturnUrl;
                        } else {
                            prompt.notify({
                                question: result.Message,
                                type: "error"
                            });
                        };
                    }
                });
            },
            register: function () {
                var vm = this;
                $(document).trigger(argosyEvents.START_LOADING);
                $.ajax({
                    url: "/Register/CarePlusRegister",
                    dataType: "json",
                    type: "POST",
                    data: JSON.stringify({
                        model: vm.loginModel,
                        data: vm.data
                    }),
                    contentType: "application/json; charset=utf-8",
                    success: function (result) {
                        $(document).trigger(argosyEvents.END_LOADING);
                        CarePlus.prototype.options.viewModel.loginModel = result.Records;
                        if (result.ReturnCode === ReturnCode.Success) {
                            CarePlus.prototype.options.viewModel.login();
                        } else {
                            prompt.notify({
                                question: result.Message,
                                type: "error"
                            });
                        };
                    }
                });
            },
            setupRegister: function () {
                var vm = this;

                $("#_VerifyTemplate").hide();
                $("#_RegisterTemplate").show();
                if (vm.data.SAN_TYPE === "AGCY") {
                    $("#divAgency").show();
                    $("#divAgentMessage").hide();
                } else {
                    $("#divAgency").hide();
                    $("#divAgentMessage").show();
                };
            },
            verifyInputs: function () {
                var vm = this;

                if ($("#txtFirstName").val() === "") {
                    prompt.notify({
                        question: "First Name is required",
                        type: "error"
                    });
                    $("#txtFirstName").focus();
                    return;
                };
                if ($("#txtLastName").val() === "") {
                    prompt.notify({
                        question: "LastName is required",
                        type: "error"
                    });
                    $("#txtLastName").focus();
                    return;
                };
                if ($("#txtAddress1").val() === "") {
                    prompt.notify({
                        question: "Address Line 1 is required",
                        type: "error"
                    });
                    $("#txtAddress1").focus();
                    return;
                };
                if ($("#txtCity").val() === "") {
                    prompt.notify({
                        question: "City is required",
                        type: "error"
                    });
                    $("#txtCity").focus();
                    return;
                };
                if ($("#txtZip").val() === "") {
                    prompt.notify({
                        question: "ZIP Code is required",
                        type: "error"
                    });
                    $("#txtZip").focus();
                    return;
                };
                if (parseInt($("#txtPhone").val()) <= 0) {
                    prompt.notify({
                        question: "Phone is required",
                        type: "error"
                    });
                    $("#txtPhone").focus();
                    return;
                };
                if ($("#txtEmail").val() === "") {
                    prompt.notify({
                        question: "Email is required",
                        type: "error"
                    });
                    $("#txtEmail").focus();
                    return;
                };
                vm.register();
            }
        });
    return viewModel;
}