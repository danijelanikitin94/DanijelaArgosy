$(function () {
    $("._locationRadioBtns").on("change", function (e) {
        var isResidential = $(e.currentTarget).data('isResidential');
        $("#ShipToAddress_IsResidential").val(isResidential);
    });
    function setCountryAndStateForShipToAddress(countryId, stateId) {
        var country = $('[data-role="countries"][data-binding-group="ShipToAddress"]').getKendoCountries();
        if (country) {
            country.value(countryId, stateId);
        }
    }
    function setCountryAndStateForBillToAddress(countryId, stateId) {
        var country = $('[data-role="countries"][data-binding-group="BillToAddress"]').getKendoCountries();
        if (country) {
            country.value(countryId, stateId);
        }
    }
    $("._clearSelectedUser").on("click", function () {
        $(document).trigger(argosyEvents.CLEAR_SELECTED_USER);
    });
    function updateAccountingUnitsForUser(userId, selectedAccountingUnit) {
        var list = $("#SelectedAccountingUnit").getKendoDropDownList();
        if (list && selectedAccountingUnit !== null) {
            $.ajax({
                url: "/Admin/AccountUnit/GetAccountingUnitsForUser?userId=" + userId,
                dataType: "json",
                success: function (result) {
                    var dataSource;

                    if (result.ReturnCode === ReturnCode.Success && result.TotalRecords > 0) {
                        $("#accountUnitRow").removeClass("hide").addClass("show");
                        var data = [];
                        $.each(result.Records, function (i, record) {
                            data.push({text: record.AccountingUnitId,value: record.AccountingUnitId})
                        });
                        dataSource = new kendo.data.DataSource({
                            data: data
                        });
                        list.setDataSource(dataSource);
                        if (selectedAccountingUnit && selectedAccountingUnit > 0) {
                            setInputValue("#SelectedAccountingUnit", selectedAccountingUnit);
                        } else {
                            setInputValue("#SelectedAccountingUnit", result.Records[0].AccountingUnitId);
                        }
                    } else {
                        $("#accountUnitRow").removeClass("show").addClass("hide");
                        dataSource = new kendo.data.DataSource({
                            data: [{ AccountUnitDesc: "Not applicable", AccountingUnitId: 0 }]
                        });
                        list.setDataSource(dataSource);
                        setInputValue("#SelectedAccountingUnit", 0);
                    }

                }
            });
        }
    }
    $("#btnSameAsShipping").on("click", function (e) {
        setInputValue("#BillToAddress_Company", getInputValue('#ShipToAddress_Company'));
        setInputValue("#BillToAddress_Name", getInputValue('#ShipToAddress_Name'));
        setInputValue("#BillToAddress_AddressLine1", getInputValue('#ShipToAddress_AddressLine1'));
        setInputValue("#BillToAddress_AddressLine2", getInputValue('#ShipToAddress_AddressLine2'));
        setInputValue("#BillToAddress_AddressLine3", getInputValue('#ShipToAddress_AddressLine3'));
        setInputValue("#BillToAddress_City", getInputValue('#ShipToAddress_City'));
        setInputValue("#BillToAddress_ZipCode", getInputValue('#ShipToAddress_ZipCode'));
        setInputValue("#BillToAddress_Country", getInputValue('#ShipToAddress_Country'));
        setInputValue("#BillToAddress_State", getInputValue('#ShipToAddress_State'));
        setInputValue("#BillToAddress_PhoneNumber", getInputValue('#ShipToAddress_PhoneNumber'));
        var addressCode = getInputValue('#ShipToAddress_AddressCode');
        setInputValue("#BillToAddress_AddressCode", addressCode);
        if (addressCode != null && addressCode.length > 0) {
            $("#BillToAddress_addressCodeDiv").show();
        } else {
            $("#BillToAddress_addressCodeDiv").hide();
        };
        setCountryAndStateForBillToAddress($('[data-role="countries"][data-binding-group="ShipToAddress"]').getKendoCountries().value(),
            $('[data-role="states"][data-binding-group="ShipToAddress"]').getKendoStates().value());
    });

    //todo refactor selected_user and selected consumer to use event_user_selected_address event
    $(document).bind(argosyEvents.SELECTED_USER, function (e, user) {
        setInputValue("#ShipToAddress_AddressLine1", user.Address1);
        setInputValue("#ShipToAddress_AddressLine2", user.Address2);
        setInputValue("#ShipToAddress_AddressLine3", user.Address3);
        setInputValue("#ShipToAddress_City", user.City);
        setInputValue("#ShipToAddress_Name", user.FullName);
        setInputValue("#ShipToAddress_ZipCode", user.ZipCode);
        setInputValue("#ShipToAddress_PhoneNumber", user.PhoneNumber);
        setInputValue("#ShipToAddress_Company", user.DivisionName);
        updateAccountingUnitsForUser(user.UserId, user.AccountingUnitId);
        setCountryAndStateForShipToAddress(user.CountryId, user.StateId);
    });
    $(document).bind(argosyEvents.SELECTED_CONSUMER, function (e, consumer) {
        setInputValue("#ShipToAddress_AddressLine1", consumer.ConsumerAddress1);
        setInputValue("#ShipToAddress_AddressLine2", consumer.ConsumerAddress2);
        setInputValue("#ShipToAddress_AddressLine3", consumer.ConsumerAddress3);
        setInputValue("#ShipToAddress_City", consumer.ConsumerCity);
        setInputValue("#ShipToAddress_Name", consumer.ConsumerFirstName + " " + consumer.ConsumerLastName);
        setInputValue("#ShipToAddress_ZipCode", consumer.ConsumerZip);
        setInputValue("#ShipToAddress_PhoneNumber", consumer.ConsumerPhone);
        setInputValue("#ShipToAddress_Company", consumer.ConsumerCompanyName);
        setInputValue("#OrderComments", consumer.ConsumerComment);
        setCountryAndStateForShipToAddress(consumer.ConsumerCountry, consumer.ConsumerStateId);

    });
    $(document).bind(argosyEvents.EVENT_USER_SELECTED_ADDRESS, function (e, address) {
        setInputValue("#ShipToAddress_AddressLine1", address.AddressLine1);
        setInputValue("#ShipToAddress_AddressLine2", address.AddressLine2);
        setInputValue("#ShipToAddress_AddressLine3", address.AddressLine3);
        setInputValue("#ShipToAddress_City", address.City);
        if (address.Name && address.Name.trim().length > 0) {
            setInputValue("#ShipToAddress_Name", address.Name);
        } else if(address.userName && address.userName.trim().length > 0){
            setInputValue("#ShipToAddress_Name", address.userName);
        }
        setInputValue("#ShipToAddress_ZipCode", address.ZipCode);
        setInputValue("#ShipToAddress_PhoneNumber", address.PhoneNumber);
        setInputValue("#ShipToAddress_Company", address.Company);
        setInputValue("#ShipToAddress_AddressCode", address.AddressCode);
        if (address.AddressCode != null && address.AddressCode.length > 0) {
            $("#ShipToAddress_addressCodeDiv").show();
        } else {
            $("#ShipToAddress_addressCodeDiv").hide();
        };
        setInputValue("#ShipToAddress_SystemId", address.SystemId);
        var countryId = 0;
        var stateId = 0;
        if (address.Country) {
            countryId = address.Country.CountryId;
        }
        if (address.State) {
            stateId = address.State.StateId;
        }
        setCountryAndStateForShipToAddress(countryId, stateId);
    });
    $(document).bind(argosyEvents.EVENT_USER_SELECTED_BILLING_ADDRESS, function (e, address) {
        setInputValue("#BillToAddress_AddressLine1", address.AddressLine1);
        setInputValue("#BillToAddress_AddressLine2", address.AddressLine2);
        setInputValue("#BillToAddress_AddressLine3", address.AddressLine3);
        setInputValue("#BillToAddress_City", address.City);
        if (address.Name && address.Name.trim().length > 0) {
            setInputValue("#BillToAddress_Name", address.Name);
        } else if(address.userName && address.userName.trim().length > 0) {
            setInputValue("#BillToAddress_Name", address.userName);
        }
        setInputValue("#BillToAddress_ZipCode", address.ZipCode);
        setInputValue("#BillToAddress_PhoneNumber", address.PhoneNumber);
        setInputValue("#BillToAddress_Company", address.Company);
        setInputValue("#BillToAddress_AddressCode", address.AddressCode);
        if (address.AddressCode != null && address.AddressCode.length > 0) {
            $("#BillToAddress_addressCodeDiv").show();
        } else {
            $("#BillToAddress_addressCodeDiv").hide();
        };
        setInputValue("#BillToAddress_SystemId", address.SystemId);
        var countryId = 0;
        var stateId = 0;
        if (address.Country) {
            countryId = address.Country.CountryId;
        }
        if (address.State) {
            stateId = address.State.StateId;
        }
        setCountryAndStateForBillToAddress(countryId, stateId);
    });
});