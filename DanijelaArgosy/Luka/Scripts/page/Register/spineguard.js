$(function () {
    function setCountryAndStateForShipToAddress(countryId, stateId) {
        $('[data-role="countries"]').getKendoCountries().value(countryId, stateId);
    }
    $(document).bind(argosyEvents.EVENT_USER_SELECTED_ADDRESS, function (e, address) {
        setInputValue("#RegistrationUser_User_Address1", address.AddressLine1);
        setInputValue("#RegistrationUser_User_Address2", address.AddressLine2);
        setInputValue("#RegistrationUser_User_Address3", address.AddressLine3);
        setInputValue("#RegistrationUser_User_City", address.City);
        setInputValue("#RegistrationUser_User_ZipCode", address.ZipCode);
        setInputValue("#RegistrationUser.User.PhoneNumber", address.ConsumerPhone);

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
});
