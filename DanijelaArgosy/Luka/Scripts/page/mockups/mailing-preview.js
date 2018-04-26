$(document).ready(function () {
    var mailinglist = [{
        name: "Brian Williams<br/>ABC Company",
        address: "2400 Main Street<br/>Suite 123<br/>Townsville, TX 54321",
        hobby: "Soccer"
    }, {
        name: "Abel Maclead<br/>C 4 Network",
        address: "6 Greenleaf Ave<br />San Jose, CA 95111",
        hobby: "Baseball"
    }, {
        name: "Bette Nicka<br/>U Pull It",
        address: "86 Nw 66th St #8673<br />Albany, NY 12204",
        hobby: "Soccer"
    }, {
        name: "Lorrie Nelson<br/>Vicon Corp.",
        address: "14302 Pennsylvania Ave<br />Suite 123<br />Montgomery, PA 19006",
        hobby: "Baseball"
    }, {
        name: "Tawna Buvens<br/>HHH Enterprises",
        address: "3305 Nabell Ave<br />#679<br />New York, NY 10099",
        hobby: "Football"
    }, {
        name: "Mya Munns<br/>Anker Law",
        address: "37 Pistorio Rd<br />Suite 1239230<br />Madison, WI 43101",
        hobby: "Baseball"
    }, {
        name: "Cecily Hollack<br/>Alpenlite",
        address: "201 Hawk Ct<br />Providence, RI 29101",
        hobby: "Football"
    }];
    var localDataSource = new kendo.data.DataSource({
        data: mailinglist
    });
    $("#grid_sample").kendoGrid({
        dataSource: localDataSource,
        groupable: false,
        sortable: true,
        selectable: true,
        scrollable: false,
        pageable: false,
        columns: [{
            title: "Name",
            field: "name",
            encoded: false
        }, {

            title: "Address",
            field: "address",
            encoded: false
        }, {
            title: "Hobby",
            field: "hobby"
        }],
    });
    
    $(".click_secondpage").on('click', function () {
        $("#DesignDisplay2").show('slow');
        $("#DesignDisplay1").hide('slow');
    });
    $(".click_firstpage").on('click', function () {
        $("#DesignDisplay1").show('slow');
        $("#DesignDisplay2").hide('slow');
    });
});