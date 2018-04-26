function AddressVerification(opts) {
    var that = this;
    var controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("AddressVerification", function (template) {
        $(document.body).append(template);
        that.options.templateLoaded = true;
    });
    $(document).bind(argosyEvents.VERIFY_ADDRESS, function () {
        that.verifyAddress();
    });
}

AddressVerification.prototype.options = {
    url: "",
    type: ""
};

AddressVerification.prototype.dataSourceOpts = {};

AddressVerification.prototype.baseOptions = {
    templateLoaded: false,
    addressNotVerifiedTemplate: "#_AddressNotVerified",
    addressNotVerifiedSection: "#addressNotVerifiedSection",
    addressCorrectedTemplate: "#_AddressCorrected",
    addressCorrectedSection: "#addressCorrectedSection"
};


AddressVerification.prototype.searchCriteria = {};

AddressVerification.prototype.verifyAddress = function () {
    var that = this;
    var submitForm = null;
    var form;
    var addressLine1Input;
    var addressLine2Input;
    var addressLine3Input;
    var cityInput;
    var stateIdInput = $("[data-role='states']").getKendoStates();
    var zipCodeInput;
    switch (that.options.type) {
        case "checkout":
            form = $("#checkoutForm");
            var kendoValidator = form.getKendoValidator();
            submitForm = function () {
                var disabledValid = true;
                $("input[readonly='readonly'][data-val-required][type!='hidden']").each(function (i) {
                    if (!kendoValidator.validateInput($(this))) {
                        disabledValid = false;
                    }
                });

                if (form.valid() && disabledValid) {
                    kendoValidator.destroy();
                    form.submit();
                    $(document).trigger(argosyEvents.START_LOADING, { element: $(".main-div-submit"), message: "~{MsgHeadingToCheckout}~" });
                }
            };
            addressLine1Input = $("input[id='ShipToAddress_AddressLine1']");
            addressLine2Input = $("input[id='ShipToAddress_AddressLine2']");
            addressLine3Input = $("input[id='ShipToAddress_AddressLine3']");
            cityInput = $("input[id='ShipToAddress_City']");
            zipCodeInput = $("input[id='ShipToAddress_ZipCode']");
            break;
        case "addAddress":
            form = $("form.add-address");
            submitForm = function () {
                form.submit();
            };
            addressLine1Input = $("input[id='AddressLine1']");
            addressLine2Input = $("input[id='AddressLine2']");
            addressLine3Input = $("input[id='AddressLine3']");
            cityInput = $("input[id='City']");
            zipCodeInput = $("input[id='ZipCode']");
            break;
    }
    var address = {
        AddressLine1: addressLine1Input.val(),
        AddressLine2: addressLine2Input.val(),
        AddressLine3: addressLine3Input.val(),
        City: cityInput.val(),
        ZipCode: zipCodeInput.val(),
        StateId: stateIdInput.value()
    }
    var disabledValid = true;
    $("input[readonly='readonly'][data-val-required][type!='hidden']").each(function (i) {
        if (!kendoValidator.validateInput($(this))) {
            disabledValid = false;
        }
    });
    if (disabledValid) {
        $(document).trigger(argosyEvents.START_LOADING, { element: $(".main-div-submit"), message: "~{MsgHeadingToCheckout}~" });
        $.ajax({
            url: that.options.url,
            data: JSON.stringify(address),
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                var originalAddress = result.Records.OriginalAddress;
                var correctedAddress = result.Records.CorrectedAddress;
                var addressVerificationViewModel = kendo.observable({
                    correctedAddress: correctedAddress,
                    originalAddress: originalAddress,
                    closeAddressNotVerified: function () {
                        $.fancybox.close();
                    },
                    useOriginalAddress: function () {
                        this.useAddress(originalAddress);
                    },
                    useCorrectedAddress: function () {
                        this.useAddress(correctedAddress);
                    },
                    useAddress: function (addressToUse) {
                        addressLine1Input.val(addressToUse.Address1);
                        addressLine2Input.val(addressToUse.Address2);
                        addressLine3Input.val(addressToUse.Address3);
                        cityInput.val(addressToUse.City);
                        stateIdInput.value(addressToUse.State);
                        zipCodeInput.val(addressToUse.ZipCode);
                        submitForm();
                    },
                    isAddressChanged: function () {
                        return (this.isAddress1Changed() ||
                            this.isCityChanged() ||
                            this.isStateChanged() ||
                            this.isZipCodeChanged());
                    },
                    isAddress1Changed: function () {
                        return (this.originalAddress.Address1 !== this.correctedAddress.Address1);
                    },
                    isCityChanged: function () {
                        return (this.originalAddress.City !== this.correctedAddress.City);
                    },
                    isStateChanged: function () {
                        return this.originalAddress.State !== this.correctedAddress.State;
                    },
                    isZipCodeChanged: function () {
                        return (this.originalAddress.ZipCode.substring(0, 5) !==
                            this.correctedAddress.ZipCode.substring(0, 5));
                    },
                    address1FontWeight: function () {
                        if (this.isAddress1Changed()) {
                            return "bold";
                        } else {
                            return "";
                        }
                    },
                    cityFontWeight: function () {
                        if (this.isCityChanged()) {
                            return "bold";
                        } else {
                            return "";
                        }
                    },
                    stateFontWeight: function () {
                        if (this.isStateChanged()) {
                            return "bold";
                        } else {
                            return "";
                        }
                    },
                    zipCodeFontWeight: function () {
                        if (this.isZipCodeChanged()) {
                            return "bold";
                        } else {
                            return "";
                        }
                    },
                    type: function () {
                        switch (that.options.type) {
                            case "checkout":
                                return "shipping";
                            case "addAddress":
                                return "new";
                        }
                    }
                });
                $(document).trigger(argosyEvents.END_LOADING, { element: $(".main-div-submit") });
                switch (result.Records.Status) {
                    case 0: // Invalid address
                        $(that.options.addressNotVerifiedSection).html($(that.options.addressNotVerifiedTemplate).html());
                        kendo.bind(that.options.addressNotVerifiedSection, addressVerificationViewModel);
                        $.fancybox({
                            href: that.options.addressNotVerifiedSection,
                            autoHeight: true,
                            minWidth: 500,
                            closeBtn: true,
                            modal: false
                        });
                        break;
                    case 1: // Valid address
                        if (addressVerificationViewModel.isAddressChanged()) {
                            $(that.options.addressCorrectedSection).html($(that.options.addressCorrectedTemplate).html());
                            kendo.bind(that.options.addressCorrectedSection, addressVerificationViewModel);
                            $.fancybox({
                                href: that.options.addressCorrectedSection,
                                autoSize: true,
                                minWidth: 450,
                                closeBtn: true,
                                modal: false
                            });
                        } else {
                            if (addressVerificationViewModel.originalAddress.ZipCode !==
                                addressVerificationViewModel.correctedAddress.ZipCode) {
                                zipCodeInput.val(correctedAddress.ZipCode);
                            }
                            submitForm();
                        }
                        break;
                    case 4: // No response
                        submitForm();
                        break;
                }
            }
        });
    }
}