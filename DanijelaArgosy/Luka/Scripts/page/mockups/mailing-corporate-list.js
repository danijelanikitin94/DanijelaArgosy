$(document).ready(function () {
    $("#AddressSearch").hide();

    $("#chAddressSearch").click(function () {
        var test = $(this).val();
        $("#ZipSearch").hide(); 
        $("#ext_instrct").hide();
        $("#AddressSearch").show();
    });

    $("#chZipSearch").click(function () {
        var test = $(this).val();
        $("#AddressSearch").hide();
        $("#ZipSearch").show();
        $("#ext_instrct").show();
    });
});
