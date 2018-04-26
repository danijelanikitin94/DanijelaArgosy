var basePartSearch = {
    Active: "Y",
    PartGroupId: 0,
    Keyword: "",
    Sku: "",
    PartName: "",
    Description: "",
    FormNo: "",
    Code: "",
    Type: "",
    Plant: "",
    Manufacturer: "",
    VendorSku: "",
    InternalPartId: "",
    ExcludeChildConfigParts: true,
},
    baseAssetSearch = {
        AssetGroupId: null,
        Name: "",
        TypeId: "",
        MinDpi: 0,
        MaxDpi: 0,
        IsDeleted: false,
        SortOption: "AssetAsc",
        FilterOption: "All",
        DirectoryName: "Root"
    };

$(function () {
    $('.top-search').hide();
    $("#btnClearAll").on("click", function(e) {
        e.preventDefault();
        $('.term-li').remove();
        checkForTerms();
        searchForTerms();
    });
    BuildSearchTermsFromQueryString();
    setupEvents();
    setupEventListeners();
});

function setupEventListeners() {
    $(document).on("PRODUCT_VIEW_LISTENERS_LOADED ASSET_VIEW_LISTENERS_LOADED", function (e) {
        searchForTerms(true);
    });

    $(document).on("ASSET_VIEW_DATABOUND", function (e, data) {
        var spanDamChecked = $('#spanDAM').hasClass("checked");
        
        if (data.Count > 0) {
            if (!spanDamChecked) {
                $("#chDAM").trigger('click');
            }
        } else {
            if (spanDamChecked) {
                $("#chDAM").trigger('click');
            }
        }
    });
}
function changeButtonText() {
    var  spanDam = $('#spanDAM'),
         spanProducts = $("#spanProducts"),
         damText = $("#spanDAMText"),
         productsText = $("#spanProductsText");
    if (spanProducts.hasClass("checked")) {
        productsText.text("~{HideProducts}~")
    }
    else {
        productsText.text("~{ShowProducts}~")
    }

    if (spanDam.hasClass("checked")) {
        damText.text("~{HideDownloads}~")
    }
    else {
        damText.text("~{ShowDownloads}~")
    }
}
function setupEvents() {
    $("#chProducts").on('click', function () {
        
        var spanProducts = $("#spanProducts"),
            divProductResults = $('#divProductResults'),
            spanDam = $('#spanDAM'),
            divDamResults = $("#divDAMResults");

        if (spanProducts.hasClass("checked")) {
            spanProducts.removeClass("checked");
            divProductResults.hide("slow");
            if (spanDam.hasClass("checked")) {
                divDamResults.removeClass("col-sm-6 border1")
                                    .addClass("col-sm-12");
            }
        }
        else {
            spanProducts.addClass("checked");
            divProductResults.show("slow");
            if (spanDam.hasClass("checked")) {
                divDamResults.removeClass("col-sm-12")
                                   .addClass("col-sm-6 border1");
                divProductResults.removeClass("col-sm-12")
                                   .addClass("col-sm-6");
            }
            else {
                divProductResults.removeClass("col-sm-6")
                                  .addClass("col-sm-12");
            }
        }
        changeButtonText();
    });

    $("#chDAM").on('click', function () {
        
        var spanDam = $("#spanDAM");
        var divDamResults = $('#divDAMResults');
        var spanProducts = $('#spanProducts');
        var divProductResults = $("#divProductResults");
        if (spanDam.hasClass("checked")) {
            spanDam.removeClass("checked");
            divDamResults.hide("slow");

            if (spanProducts.hasClass("checked")) {
                divProductResults.removeClass("col-sm-6");
                divDamResults.removeClass("border1");
                divProductResults.addClass("col-sm-12");
            }

        }
        else {
            spanDam.addClass("checked");
            divDamResults.show("slow");

            if (spanProducts.hasClass("checked")) {
                divProductResults.removeClass("col-sm-12")
                                  .addClass("col-sm-6");
                divDamResults.removeClass("col-sm-12")
                    .addClass("col-sm-6 border1");
            }
            else {
                divDamResults.removeClass("col-sm-6")
                             .addClass("col-sm-12");
            }
        }
        changeButtonText();
    });

    $('#searchBtn').off('click').on('click', function () {
        var input = $('#searchInput'),
            terms = [];
        terms.push(input.val());
        addTerms(terms, $('.term-ul'));
        input.val('');
        searchForTerms();
    });

    $('#advanceSearchBtn').off('click').on('click', function () {
        var keywords = $('#advs-keyword'),
            terms = [];
        terms.push(keywords.val());
        addTerms(terms, $('.term-ul'));
        keywords.val('');
        searchForTerms(false, true);
    });

    $(document).keypress(function () {
        if (event.keyCode == 13) {
            if ($.fancybox.isOpen === true) {
                $('#advanceSearchBtn').trigger("click");
            } else {
                $('#searchBtn').trigger("click");
            }
            if (event.preventDefault()) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        }
        event.returnValue = true;
    });
}

function searchForTerms(noDataSourceRead, advancedSearch) {
    var keywords = "",
        currentPartSearch = basePartSearch,
        currentAssetSearch = baseAssetSearch,
        keywordsArray = [];
    $('.search-terms').each(function () {
        var textValue = $(this).text();
        if (textValue) {
            keywords += textValue + " ";
            keywordsArray.push(textValue);
        }
    });
    if (advancedSearch) {
        currentPartSearch.Sku = $.trim($('#advs-sku').val());
        currentPartSearch.PartName =  $.trim($('#advs-partName').val());
        currentPartSearch.Description =  $.trim($('#advs-description').val());
        currentPartSearch.FormNo = $.trim($('#advs-formNo').val());
        currentPartSearch.Code =  $.trim($('#advs-code').val());
        currentPartSearch.Type =  $.trim($('#advs-type').val());
        currentPartSearch.Plant =  $.trim($('#advs-plant').val());
        currentPartSearch.Manufacturer =  $.trim($('#advs-mfr').val());
        currentPartSearch.VendorSku =  $.trim($('#advs-vendorSku').val());
        currentPartSearch.InternalPartId = $.trim($('#advs-internalPartId').val());
        currentAssetSearch.MinDpi = $('#advs-minDpi').val();
        currentAssetSearch.MaxDpi = $('#advs-maxDpi').val();
        currentAssetSearch.Type = $('#advs-imageTypes').val();
    }
    currentPartSearch.Keywords = keywordsArray;
    currentAssetSearch.Keywords = keywordsArray;

    var needToReadDataSource = true;
    if (noDataSourceRead) {
        needToReadDataSource = false;
    }
    $(document).trigger(argosyEvents.FULL_TEXT_SEARCH, {
        read: needToReadDataSource,
        currentPartSearch: currentPartSearch,
        currentAssetSearch: currentAssetSearch
    });
    $.fancybox.close();
}

function BuildSearchTermsFromQueryString() {
    var queryString = decodeURIComponent(getQuerystring('searchFor', ""));
    var terms = [];
        terms.push(queryString.replace("+", " "));
    var termDiv = $(".term-search-div");

    var ul = $('<ul/>', {
        class: 'term-ul'
    });
    ul.appendTo(termDiv);
    var outerLi = $('<li/>');
    
    outerLi.appendTo(ul);

    addTerms(terms, ul);
}

function addTerms(terms, ul) {
    $(terms).each(function () {
        var colorClass = "";
        if (this.indexOf("-") === 0) {
            colorClass = "-red";
        }
        if (this.length > 0) {
            var li = $('<li/>', {
                class: 'floatl marr10 term-li'
            });
            var label = $('<label/>', {
                class: 'search-terms finger keyword-box'+colorClass,
                text: this,
            });
            $('<i/>', {
                class: 'fa fa-times small_txt marr5',
                title: ' Delete Filter'
            }).prependTo(label);
            label.appendTo(li);
            label.off('click').on('click', function () {
                $(this).parent().remove();
                checkForTerms();
                searchForTerms();
            });
            li.appendTo(ul);
        }
    });
    checkForTerms();
}

function checkForTerms() {
    var termUl = $('.term-ul');
    var searchForDiv = $(".search-for-div");
    var btnClearAll = $("#btnClearAll");
    if (termUl.children('li').length > 1) {
        searchForDiv.fadeIn();
        btnClearAll.fadeIn();
    } else {
        searchForDiv.hide();
        btnClearAll.hide();
    }
}