$(document).ready(function () {

    $("#AddressSearch").hide();

    $("#chAddressSearch").click(function () {
        var test = $(this).val();
        $("#ZipSearch").hide();
        $("#AddressSearch").show();
    });

    $("#chZipSearch").click(function () {
        var test = $(this).val();
        $("#AddressSearch").hide();
        $("#ZipSearch").show();
    });

});
