(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change";

    var DropDownListOrUpload = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            that.options.inputId = that.options.argosyInputId;
            that._initialize();
            
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "DropDownListOrUpload",
            value: null,
            inputId: null,
            argosyInputId: null,
            optionLabel: "~{SelectOne}~",
            valueField: "value",
            valueTemplate: null,
            template: null,
            dataSource: null,
            variableId: null,
            controlType: null,
            displayName: null,
            variableName: null,
            required: false,
            disabled: false,
            minHeight: null,
            minWidth: null,
            fixedAspectRation: false,
            maxImageSize: null,
            showFancyBoxAfterEdit: false,
            fancyboxAfterEditHref: null,
            dropdownText: "Drop Down",
            uploadText: "Upload",
            appendAsSwitchId: "-kendoSwitch",
            appendAsDropDown: "-kendoDropDown",
            appendAsUpload: "-kendoImageEditor",
            appendAsUploadLink: "-kendoUploadLink",
            appendAsDropDownLink: "-kendoDropDownLink",
            appendAsTabStrip: "-kendoTabStrip"
        },
        // events are used by other widgets / developers - API for other purposes
        // these events support MVVM bound items in the template. for loose coupling with MVVM.
        events: [
            // call before mutating DOM.
            // mvvm will traverse DOM, unbind any bound elements or widgets
            DATABINDING,
            // call after mutating DOM
            // traverses DOM and binds ALL THE THINGS
            DATABOUND
        ],
        _initialize: function () {
            var that = this;
            that.element.append(that._createHiddenInput());
            that._hiddenInput = that.element.find("input[type=hidden]");
            that.element.append(that._createNavOptions());
            that._switch = that.element.find("#" + that.options.inputId + that.options.appendAsSwitchId);
            that._configureSwitch();
            that._configureUpload();
        },
        _configureUpload: function () {
            var that = this;
            $("#" + that.options.inputId + that.options.appendAsUpload).kendoImageEditor();
            that._imageUpload = $("#" + that.options.inputId + that.options.appendAsUpload).getKendoImageEditor();
        },
        _configureSwitch: function () {
            var that = this;
            $("#" + that.options.inputId + that.options.appendAsTabStrip).kendoTabStrip();
            that._tabStrip = $("#" + that.options.inputId + that.options.appendAsTabStrip).getKendoTabStrip();
        },
        _createNavOptions: function () {
            var that = this,
            parent = $("<div />", {
                "data-role": "tabstrip",
                id: that.options.inputId + that.options.appendAsTabStrip
            }),
            group = $("<ul />", {
                id: that.options.inputId + that.options.appendAsSwitchId,
            }),
            firstItem = $("<li />", {
                "class": "k-state-active",
                text: that.options.dropdownText
            }),
            firstWrapper = $("<div />", {
                id: that.options.variableId + that.options.appendAsDropDownLink
            }),
            secondItem = $("<li />", {
                text: that.options.uploadText
            }),
            secondWrapper = $("<div />", {
                id: that.options.variableId + that.options.appendAsUploadLink
            }),
            dropDownList = $("<select />", {
                id: that.options.inputId + that.options.appendAsDropDown,
                "data-role": "dropdownlist"
            }),
            upload = $("<div />", {
                id: that.options.inputId + that.options.appendAsUpload,
                "data-role": "imageeditor",
                "data-min-height": that.options.minHeight,
                "data-min-width": that.options.minWidth,
                "data-fixed-aspect-ratio": that.options.fixedAspectRatio,
                "data-max-image-size": that.options.maxImageSize,
                "data-show-fancybox-after-edit": that.options.showFancyBoxAfterEdit,
                "data-fancybox-after-edit-href": that.options.fancyboxAfterEditHref,
                "data-variable-id": that.options.variableId,
                "data-control-type": that.options.controlType,
                "data-display-name": that.options.displayName,
                "data-variable-name": that.options.variableName
            });
            firstWrapper.append(dropDownList);
            secondWrapper.append(upload);

            group.append(firstItem);
            group.append(secondItem);
            parent.append(group);
            parent.append(firstWrapper);
            parent.append(secondWrapper);

            return parent;
        },
        _createHiddenInput: function () {
            var that = this;

            if (that.options.inputId == null) {
                that.options.inputId = kendo.guid();
            }

            var input = $("<input />", {
                type: "hidden",
                id: that.options.inputId,
                name: that.options.inputId.replace('_', '.'),
                isUpload: "true"
            });
            return input;
        },
        value: function(data, stateId) {
            var that = this;
            that.options.stateId = stateId;
            if (data == null) {
                return that._hiddenInput.val();
            } else {
                that._hiddenInput.val(data);
            }
        }
    });
    ui.plugin(DropDownListOrUpload);
})(jQuery);6