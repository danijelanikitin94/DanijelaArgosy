(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var MapImage = Widget.extend({
        init: function (element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this._create();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "MapImage",
            hiddenFieldName: null,
            hiddenFieldId: null,
            showFancyboxAfterEdit: false,
            fancyboxAfterEditHref: null,
            latitude: 30.268107,
            longitude: -97.744821,
            zoom: 12,
            markerInsertActive: false,
            defaultAddress: null
        },
        value: function () {
            var that = this;
            return that._input.val();
        },
        show: function() {
            var that = this;
            $.fancybox.open({
                content: that._map.element.closest(".map-wrapper").show(),
                afterShow: function (e) {
                    if (that.options.defaultAddress == null || that.options.defaultAddress == "") {
                        that._getGeoLocation();
                        var center = that._map.center();
                        that._map.center([center.lat, center.lng]);
                        that._map.zoom(that._map.zoom());
                    } else {
                        that._geoCodeAddress(that.options.defaultAddress);
                    }
                    setTimeout(function (e) {
                        $(".k-attribution").show();
                    }, 500);
                },
                modal: true,
                scrolling: 'no'
            });
        },
        close: function() {
            var that = this;
            if (that.options.showFancyboxAfterEdit && that.options.fancyboxAfterEditHref != null) {
                $.fancybox({
                    href: "#" + that.options.fancyboxAfterEditHref
                });
            } else {
                $.fancybox.close();
            }
        },
        exportMap: function () {
            var that = this;
            // Convert the DOM element to a drawing using kendo.drawing.drawDOM
            block(null, "Generating your map...");
            kendo.drawing.drawDOM(that._map.element)
                .then(function(group) {
                    // Render the result as a PNG image
                    return kendo.drawing.exportImage(group);
                })
                .done(function(data) {
                    // Save the image file
                    var originalData = data;
                    data = data.replace("data:","");
                    data = data.split(";");
                    var content = data[0];
                    var base64 = data[1].replace("base64,", "");
                    $.ajax({
                        url: "/Upload/Export",
                        dataType: "json",
                        method: "POST",
                        data: {
                            base64: base64,
                            contentType: content
                        },
                        success: function (result) {
                            if (result.ReturnCode == ReturnCode.Success) {
                                that._input.val(result.Records.UploadFileUrl);
                                that._editMapButton.element.show();
                                that._addMapButton.element.hide();
                                that.close();
                            } else {
                                prompt.notify({
                                    type: "error",
                                    question: result.Message + " | Ref: " + result.Guid
                                });
                            }
                        },
                        complete: function(e) {
                            unblock();
                        }
                    });
                });
        },
        _input: null,
        _templates: {
            kendoMapOptions: {},
            insertMapButton: '<button>Insert Map</button>', 
            editMapButton: '<button data-role="button"><i class="fa fa-map-o"></i> Edit Map</button>',
            kendoMapElement:
                '<div class="hide map-wrapper">' +
                '<h3>Map Creator</h3>' +
                '   <div class="clearfix">' +
                '       <div class="btn_not_full">' +
                '           <input type="text" class="k-textbox" placeholder="Enter Address Here...">' +
                '           <button class="btn btn-link" data-role="button" class="floatl"><i class="fa fa-search"></i></button>' +
                '       </div>' +
                '   </div>' +
                '   <div class="padb10 padu10 clearfix">' +
                '       <div class="">' +
                '           <div data-role="map"></div>' +
                '       </div>' +
                '   </div>' +
                '   <div class="clearfix padb10 padu10">' +
                '       <div class="">' +
                '           <em>&copy; Microsoft Corporation. <a href="https://www.microsoft.com/maps/assets/docs/terms.aspx">Terms of Use</a> | <a href="https://www.microsoft.com/maps/product/print-rights.html">Print Rights</a></em>' +
                '       </div>' +
                '   </div>' +
                '   <div class="clearfix">' +
                '       <div class="pull-right btn_not_full">' +
                 '           <button class="btn btn-default"  data-role="button" class="floatr"><i class="fa fa-times"></i><span class="hidden-xs hidden-sm"> Cancel</span></button>&nbsp;' +
                '           <button class="btn btn-default" data-role="button"><i class="fa fa-map-pin"></i><span class="hidden-xs hidden-sm"> Clear Marker</span></button>&nbsp;' +
                '           <button class="btn btn-default" data-role="button"><i class="fa fa-map-o"></i><span class="hidden-xs hidden-sm"> Remove Map</span></button>&nbsp;' +
                '           <button class="btn btn-primary" data-role="button"><i class="fa fa-chevron-right"></i><span class="hidden-xs hidden-sm"> Insert Map</span></button>' +
                '       </div>' +
                '   </div>' +
                '<div>',
            hiddenInput: "<input type='hidden' />"
        },
        _create: function() {
            var that = this;
            that._createHiddenInput();
            that._createInsertMapButton();
            that._createEditMapButton();
            that._createMapElement();
            that._mapKendoControls();
            that._setupKendoEvents();
        },
        _mapKendoControls: function () {
            var that = this;
            that._map = that._map.kendoMap({
                center: [that.options.latitude, that.options.longitude],
                zoom: that.options.zoom,
                layerDefaults: {
                    bing: {
                        opacity: 1,
                    }
                },
                controls: {
                    attribution: true
                },
                layers: [{
                    type: "bing",
                    key: "AizA5aFF9XxV-yjC5T5nsQ0-YqsDqFsMFN84LoHy6IrT1aMlgBXaFLg05ZIKQhPP"
                }],
                click: function (e) {
                    var latitude = e.location.lat;
                    var longitude = e.location.lng;
                    that._map.markers.dataSource.data([
                        {
                            location: [latitude, longitude],
                            shape: "pin"
                        }
                    ]);
                }
            }).getKendoMap();
            that._addMapButton = that._addMapButton.kendoButton({
                icon: "plus"
            }).getKendoButton();
            that._editMapButton = that._editMapButton.kendoButton().getKendoButton();
            that._insertMapButton = that.element.find(".map-wrapper").find(".fa-chevron-right").closest("button").kendoButton().getKendoButton();
            that._removeMapButton = that.element.find(".map-wrapper").find(".fa-map-o").closest("button").kendoButton().getKendoButton();
            that._cancelMapButton = that.element.find(".map-wrapper").find(".fa-times").closest("button").kendoButton().getKendoButton();
            that._clearMarkersButton = that.element.find(".map-wrapper").find(".fa-map-pin").closest("button").kendoButton().getKendoButton();
            that._searchMapButton = that.element.find(".map-wrapper").find(".fa-search").closest("button").kendoButton().getKendoButton();
        },
        _setupKendoEvents: function () {
            var that = this;
            that._addMapButton.bind("click", function (e) {
                that.show();
            });
            that._editMapButton.bind("click", function (e) {
                that.show();
            });
            that._insertMapButton.bind("click", function (e) {
                that.exportMap();
            });
            that._removeMapButton.bind("click", function (e) {
                that._input.val("");
                that._editMapButton.element.hide();
                that._addMapButton.element.show();
                that.close();
            });
            that._cancelMapButton.bind("click", function (e) {
                that.close();
            });
            that._clearMarkersButton.bind("click", function (e) {
                that._map.markers.dataSource.data([]);
            });
            that._searchMapButton.bind("click", function (e) {
                var address = e.sender.element.parent().parent().find("input").val();
                that._geoCodeAddress(address);
            });
        },
        _createHiddenInput: function() {
            var that = this;
            that._input = that.element.find("input");
            if (that._input.length == 0) {
                that._input = that.element.append(that._templates.hiddenInput);
            }
        },
        _createMapElement: function () {
            var that = this;
            var map = $(that._templates.kendoMapElement);
            that._map = that.element.append(map).find("*[data-role=map]");
            if (that.options.defaultAddress != null) {
                that.element.find("input[type=text]").val(that.options.defaultAddress);
            }
            that._resizeMapWrapper(that._map);
        },
        _createInsertMapButton: function () {
            var that = this;
            var button = $(that._templates.insertMapButton);
            if (that._input.is(':disabled')) {
                button.attr("disabled", "disabled");
            }
            that._addMapButton = that.element.append(button).find("button");
        },
        _createEditMapButton: function () {
            var that = this;
            var button = $(that._templates.editMapButton);
            if (that._input.is(':disabled')) {
                button.attr("disabled", "disabled");
            }
            that._editMapButton = that.element.append(button).find(".fa-map-o").closest("button");
            that._editMapButton.hide();
        },
        _resizeMapWrapper: function (mapElement) {
            var width = $(document).width();
            if (width < 880) {
                width = width * .90;
            } else {
                width = 800;
            }
            mapElement.closest(".map-wrapper").css("min-width", width);
        },
        _getGeoLocation: function () {
            var that = this;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        that.options.latitude = position.coords.latitude;
                        that.options.longitude = position.coords.longitude;
                    });
                } else {
                    prompt.notify({
                        type: "error",
                        question: "Geolocation is not supported by this browser."
                    });
                }
        },
        _geoCodeAddress: function (address) {
            var that = this;
            $.ajax({
                url: "/Store/Proofing/GeoCodeAddress?address=" + address,
                dataType: "json",
                method: "GET",
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Success) {
                        if (result.Records.ErrorMessage == null && result.Confidence != "No results") {
                            that._map.markers.dataSource.data([
                                {
                                    location: [result.Records.Latitude, result.Records.Longitude],
                                    shape: "pin"
                                }
                            ]);
                            that._map.center([result.Records.Latitude, result.Records.Longitude]);
                            that._map.zoom(that._map.zoom());
                        } else if (result.Confidence == "No results") {
                            prompt.notify({
                                type: "error",
                                question: "We were unabled to find a location for the information provided."
                            });
                        } else {
                            prompt.notify({
                                type: "error",
                                question: result.Records.ErrorMessage
                            });
                        }
                    } else {
                        prompt.notify({
                            type: "error",
                            question: result.Message + " | Ref: " + result.Guid
                        });
                    }
                },
                complete: function (e) {
                    unblock();
                }
            });
        }
    });
    ui.plugin(MapImage);
})(jQuery);