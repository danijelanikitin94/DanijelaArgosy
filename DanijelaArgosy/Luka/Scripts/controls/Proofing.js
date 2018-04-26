function Proofing(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    that.setupEventListeners();
    controlLoader.loadTemplate("Proofing", function (template) {
        $(document.body).append(template);
        that.initialize(that.getDataSource());
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

Proofing.prototype.options = {};

Proofing.prototype.baseOptions = {
    dataSource: null,
    isPreview:false,
    proofingView: "div[data-argosy-control=proofing]",
    proofingModalWrapper: "div[data-argosy-view=ProofingModalWrapper]",
    proofingCurrentPagePreviewImage: "img[data-argosy-view=ProofingCurrentPagePreviewImage]",
    proofingRightNavigationPanel: "div[data-argosy-view=ProofingRightNavigationPanel]",
    proofingMainWrapperPanel: "div[data-argosy-view=ProofingMainWrapperPanel]",
    proofingNavigationCurrentPage: "span[data-argosy-view=ProofingNavigationCurrentPage]",
    proofingNavigationWrapper: "div[data-argosy-view=ProofingNavigationWrapper]",
    proofingModalImageUploadWrapper: "#proofingVariableImageUploadModal",
    proofingImageBankListView: "#proofingImageBankListView",
    proofingCustomizationView: "#divPersonalize",
    proofingSaveProfileView: "#divSaveProfileModal",
    proofingTemplate: "#_ProofingTemplate",
    proofingQrCodeGenerationModal: "#divGenerateQrCode",
    proofingPreviewTemplate: "#_ProofingPreviewTemplate",
    proofingContinueAndDownloadOptionsPlaceHolder: "#_ProofingContinueAndDownloadOptionsPlaceHolder",
    proofingContinueAndDownloadOptions: "#_ProofingContinueAndDownloadOptions",
    proofingDownloadOptionsForPreview: "#_ProofingDownloadOptionsForPreview",
    proofingPageNavigationTemplate: "#_ProofingPageNavigationTemplate",
    proofingDownloadOptionsTemplate: "#_ProofingDownloadOptionsTemplate",
    proofingApproveProofTemplate: "#_ProofingApproveProofTemplate",
    proofingPersonalizeTemplate: "#_ProofingPersonalizeTemplate",
    proofingDesignTemplatesTemplate: "#_ProofingDesignTemplatesTemplate",
    proofingCustomizationOptionsTemplate: "#_ProofingCustomizationOptionsTemplate",
    proofingImageBankListViewModalTemplate: "#_ProofingImageBankListViewModalTemplate",
    proofingVariableImageUploadModal: "#_ProofingVariableImageUploadModal",
    proofingRightNavigationPanelTemplate: "#_ProofingRightNavigationPanelTemplate",
    proofingGenerateQRCodeTemplate: "#_ProofingGenerateQRCodeTemplate",
    proofingSaveProfileTemplate: "#_ProofingSaveProfileModal",
    approvalProofInitial: "#approvalProofInitial",
    approvalProofName: "#approvalProofName",
    approvalProofModalHref: "#divApproveProof",
    approvalProofAcceptButton: "#approvalProofAcceptButton",
    dynamicDataSourceForm: "#_ProofingDynamicDataSourceForm",
    formInstanceCount: 0
};

Proofing.prototype.taskHub = null;
Proofing.prototype.dynamicDataSourceKey = null;
Proofing.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_PROOFING_LOADED";
Proofing.prototype.EVENT_LISTENERS_LOADED = "PROOFING_LISTENERS_LOADED";

Proofing.prototype.initialize = function (data) {
	var that = this;
	that.data = data;

	var html = $(that.options.proofingTemplate).html();
	var kendoTemplate = kendo.template(html);
	var result = kendoTemplate(that.data);
    if (that.data.DynamicDataSource != null) {
        that.taskHub = new TaskHub(that.update, that.complete, that.error);
    } else {
        that.taskHub = null;
    }
	that.dynamicDataSourceKey = null;
	that.getElement().append(result);
	that.renderDesignTemplate();
	that.renderPersonalizeTemplate();
	that.renderPickProfileTemplate();
	that.renderApproveProofTemplate();
	that.renderGenerateQRCodeTemplate();
	that.renderSaveProfileTemplate();
	that.configureMultiplePartsNavigation();

	if (that.data.LockProofName != null && that.data.LockProofName === true) {
        $("#approvalProofName").prop("readonly", true).css('cursor', 'not-allowed');
	}
	$(".btn-buildproof").click(function (e) {
		that.buildProof();
	});
	$(".btn-dynamic-datasource").click(function (e) {
        pageCacheBuster = Math.random();
		that.showDynamicDataSourceForm();
	});
	$(".btn-dynamic-refresh").click(function (e) {
        pageCacheBuster = Math.random();
		that.refreshDynamicDataSourceForm();
	});
	$(".btn-spellcheck").click(function (e) {
		that.spellCheck();
	});
	$(".btn-saveprofile").click(function (e) {
		$.fancybox({
			href: that.options.proofingSaveProfileView
		});
	});
	$(".btn-createProfile").click(function (e) {
		that.createProfile();
	});
	$(".btn-cancelCreateProfile").click(function (e) {
		$.fancybox({
			href: that.options.proofingCustomizationView
		});
	});
	var viewModel = kendo.observable({
		showGenerateQrCode: function (e) {
			$.fancybox({
				href: that.options.proofingQrCodeGenerationModal,
				autoSize: true,
				modal: true,
				afterLoad: function (afterLoadEvent) {
					kendo.bind($(that.options.proofingQrCodeGenerationModal), kendo.observable({
						onDropDownListDataBound: function (e) {
							var defaultValue = e.sender.element.attr("data-value");
							e.sender.select(function (item) {
								return item.name === defaultValue;
							});
						},
						onCancelQRCode: function (onCancelQRCodeEvent) {
							var originalInput = $(e.sender.element[0]);
							$("#qr_code_save").getKendoButton().enable(false);
							if (originalInput.attr("data-show-fancybox-after-edit") == "true") {
								$.fancybox({
									href: "#" + originalInput.attr("data-fancybox-after-edit-href")
								});
							}
						},
						onRemoveQRCode: function (onRemoveQRCodeEvent) {
							var originalInput = $(e.sender.element[0]);
							$("#" + originalInput.attr("data-hidden-field-id")).val("");
							originalInput.text("Add QR Code");
							$("#qr_code_remove").getKendoButton().enable(false);
							$("#qr_code_save").getKendoButton().enable(false);
							$(that.options.proofingQrCodeGenerationModal).find("img").attr("src", "/noimagefound.png?w=300&h=300");
							if (originalInput.attr("data-show-fancybox-after-edit") == "true") {
								$.fancybox({
									href: "#" + originalInput.attr("data-fancybox-after-edit-href")
								});
							}
						},
						onSaveQRCode: function (onSaveQRCodeEvent) {
							var originalInput = $(e.sender.element[0]);
							$("#" + originalInput.attr("data-hidden-field-id")).val($(that.options.proofingQrCodeGenerationModal).find("#qr_final_url").val());
							originalInput.text("Edit QR Code");
							$("#qr_code_save").getKendoButton().enable(false);
							if (originalInput.attr("data-show-fancybox-after-edit") == "true") {
								$.fancybox({
									href: "#" + originalInput.attr("data-fancybox-after-edit-href")
								});
							}
						},
						onGenerateQRCode: function (onGenerateQRCodeEvent) {
							if (that.isValidVariables(that.options.proofingQrCodeGenerationModal, "qr_", "data-argosy-qrcode")) {
								var variableObject = that.getVariables(false, that.options.proofingQrCodeGenerationModal, "qr_", "data-argosy-qrcode");
								$(document).trigger(argosyEvents.START_LOADING, { name: "QrCode" });
								$.ajax({
									url: "/Store/Proofing/GenerateQrCode/",
									dataType: "json",
									method: "POST",
									data: {
										variables: JSON.stringify(variableObject)
									},
									success: function (result) {
										$(document).trigger(argosyEvents.END_LOADING, { name: "QrCode" });
										if (result.ReturnCode == ReturnCode.Success) {
											$(that.options.proofingQrCodeGenerationModal).find("img").attr("src", result.Records.Url + "?w=300&h=300");
											$(that.options.proofingQrCodeGenerationModal).find("#qr_final_url").val(result.Records.Url);
											$("#qr_code_remove").getKendoButton().enable(true);
											$("#qr_code_save").getKendoButton().enable(true);
										} else {
											prompt.alert({
												question: result.Message,
												description: "Ref: " + result.Guid,
												type: "warning",
												yes: function (e) {
													$.fancybox({
														href: that.options.proofingQrCodeGenerationModal,
														autoSize: true,
														scrolling: "no"
													});
												}
											});
										}
									}
								});
							} else {
								prompt.alert({
									question: "~{MsgMissingQrFields}~",
									description: "~{MsgUpdateFormContinue}~",
									type: "warning",
									yes: function (e) {
										$.fancybox({
											href: that.options.proofingQrCodeGenerationModal,
											autoSize: true,
											scrolling: "no"
										});
									}
								});
							}
						},
						qrTypes: [{ name: 'Contact' }, { name: 'Email' }, { name: 'Phone' }, { name: 'Website' }],
						qrColors: [{ name: 'Black', value: 'Black' }, { name: 'Deep Sky Blue', value: 'DeepSkyBlue' }, { name: 'Red' }, { name: 'Green', value: 'Green' }, { name: 'Red', value: 'Red' }, { name: 'White', value: 'White' }],
						qrBackgroundColors: [{ name: 'White', value: 'White' }, { name: 'Black', value: 'Black' }, { name: 'Deep Sky Blue', value: 'DeepSkyBlue' }, { name: 'Green', value: 'Green' }, { name: 'Red', value: 'Red' }, { name: 'Transparent', value: 'Transparent' }],
						qrStates: [{ name: 'AA' }, { name: 'AE' }, { name: 'AK' }, { name: 'AL' }, { name: 'AP' }, { name: 'AR' }, { name: 'AS' }, { name: 'AZ' }, { name: 'CA' }, { name: 'CO' }, { name: 'CT' }, { name: 'DC' }, { name: 'DE' }, { name: 'FL' }, { name: 'FM' }, { name: 'GA' }, { name: 'GU' }, { name: 'HI' }, { name: 'IA' }, { name: 'ID' }, { name: 'IL' }, { name: 'IN' }, { name: 'KS' }, { name: 'KY' }, { name: 'LA' }, { name: 'MA' }, { name: 'MD' }, { name: 'ME' }, { name: 'MH' }, { name: 'MI' }, { name: 'MN' }, { name: 'MO' }, { name: 'MP' }, { name: 'MS' }, { name: 'MT' }, { name: 'NA' }, { name: 'NC' }, { name: 'ND' }, { name: 'NE' }, { name: 'NH' }, { name: 'NJ' }, { name: 'NM' }, { name: 'NV' }, { name: 'NY' }, { name: 'OH' }, { name: 'OK' }, { name: 'OR' }, { name: 'PA' }, { name: 'PR' }, { name: 'PW' }, { name: 'RI' }, { name: 'SC' }, { name: 'SD' }, { name: 'TN' }, { name: 'TX' }, { name: 'UT' }, { name: 'VA' }, { name: 'VI' }, { name: 'VT' }, { name: 'WA' }, { name: 'WI' }, { name: 'WV' }, { name: 'WY' }],
					}));
				}
			});
		},
		onProofingPrePopChange: function (e) {
			var selectedItem = e.sender.dataItem(e.sender.select());
			var variables = selectedItem.Variables;
			var clearValue = false;
			if (variables == null) {
				variables = e.sender.dataItem(1).Variables;
				clearValue = true;
			}
			if (variables != null && variables.length > 0) {
				$(variables).each(function (i) {
					var input = $("#var_" + this.Key);
					input.val(clearValue ? "" : this.Value);
				});
			}
		},
		onProgressChange: function (e) {
			e.sender.progressStatus.text(e.value + " of " + e.sender.options.max);
		},
		onDropDownListDataBound: function (e) {
			var defaultValue = e.sender.element.attr("data-value");
			e.sender.select(function (item) {
				return item.Value === defaultValue;
			});
		},
		onComboBoxDataBound: function (e) {
			//debugger;
			//var defaultValue = e.sender.element.attr("data-value");
			//e.sender.value(defaultValue);
		},
		onProofingImageBankListOpen: function (e) {
			if ($(that.options.proofingImageBankListView)) {
				$(that.options.proofingImageBankListView).remove();
			}
			// kendo is returning the empty value from the placeholder as well.
			var currentData = JSON.stringify($.grep(e.sender.dataSource.data(), function (item) {
				return item.Rule != null && item.Option != null;
			}));
			var html = $(that.options.proofingImageBankListViewModalTemplate).html();
			var kendoTemplate = kendo.template(html);
			var result = kendoTemplate(currentData);
			$(that.options.proofingModalWrapper).append(result);
			kendo.bind($(that.options.proofingImageBankListView));
			var ddl = $(e.sender.element).getKendoDropDownList();
			var listView = $(that.options.proofingImageBankListView).find("div[data-role=listview]").getKendoListView();
			listView.bind("change", function (ev) {
				var val = listView.dataItem(listView.select());
				if (val != null) {
					ddl.value(val.Rule);
				}
			});
			$.fancybox({
				href: that.options.proofingImageBankListView,
				afterClose: function (e) {
					//ddl.value()
					setTimeout(function (e) {
						$.fancybox({
							href: that.options.proofingCustomizationView
						});
					});
				},
				afterLoad: function (e) {
					kendo.bind($(that.options.proofingImageBankListView));
				}
			});
			e.preventDefault();
		}
	});

	$(that.data.Variables).each(function (e) {
		viewModel["var_" + this.Id + "_DataSourceJson"] = eval(this.DataSourceJson);
		viewModel["var_" + this.Id + "_VariableOptionsJson"] = eval(this.VariableOptionsJson);
        if (this.TooltipText != null) {
            var tooltip = $("#tooltip_" + this.Id);
            tooltip.kendoTooltip({
                content: this.TooltipText,
                position: "top"
            });
        };
	});
	kendo.bind($(that.options.proofingCustomizationView), viewModel);
	setTimeout(function (e) {
		//Adding check to prevent double binding
		if ($(that.options.proofingCustomizationView).find("*[data-role='maskedtextbox']").getKendoMaskedTextBox() == null) {
			//todo: hack because kendo apparently can't bind the masked textboxes immediately after load... no idea why.
			$(that.options.proofingCustomizationView).find("*[data-role='maskedtextbox']").kendoMaskedTextBox();
		}
        // force the datepicker text box to be uneditable
        $("[data-role=datepicker]").keypress(function(e) { return false; });
        $("[data-role=datepicker]").focus(function (e) {
            $(e.target).getKendoDatePicker().open();
        });
        $("[data-role=dropdownlist][data-control-type=imagebank],[data-role=dropdownlist][data-control-type=imagebanklistview]").each(function (i, element) {
           element = $(element);
           var value = element.attr("data-value"),
               ddl = element.getKendoDropDownList(),
               data = ddl.dataSource.data();
            ddl.select(function (dataItem) {
                return dataItem.Rule == value;
            });
        });
        $("[data-role=imageeditor][data-control-type=imagebankorupload]").each(function (e) {
            var element = $(this);
            var variableName = element.attr("data-variable-name");
            var variable = $.grep(that.data.Variables, function(item) {
                return item.Name == variableName;
            })[0];
            var dataSource = eval(variable.DataSourceJson);
            if (dataSource == null || dataSource.length == 0) {
                dataSource = eval(variable.VariableOptionsJson);
            }
            var kendoElement = element.getKendoImageEditor();
            kendoElement.setImageBankImages(dataSource);
        });
        $("[data-role=progressbar]").each(function(i) {
            var input = $("#" + $(this).attr("data-variable-control"));
            var kendoControl = $(this).getKendoProgressBar();
            input.keyup(function (e) {
                kendoControl.value(input.val().length);
            });
        });
        var hasProfileWithInstance = false;
        if (that.data.GlobalProfilesWithInstance != null && (Object.keys(that.data.GlobalProfilesWithInstance).length > 0 && that.data.GlobalProfilesWithInstance[Object.keys(that.data.GlobalProfilesWithInstance)[0]].length > 0)) {
            hasProfileWithInstance = true;
        }
        if (that.data.DynamicDataSource != null) {
            that.showDynamicDataSourceForm();
        } else if ((that.data.GlobalProfiles != null && that.data.GlobalProfiles.length > 0) || (that.data.Profiles != null && that.data.Profiles.length > 0) || (hasProfileWithInstance)) {
        //todo: hack because the kendo mvvm binding is an async method and the dropdownlists may not be bound yet causing the value to return as [object object]
            if (!that.data.IsEdit) {
                Proofing.prototype.baseOptions.formInstanceCount = $("select[data-argosy-action=select-proofing-profile]").length;
                block(null, "~{MsgLoadingProfile}~");
                that.selectProfile(0,
                    function(e) {
                        that.FormInstanceLoaded();
                    }, false);
            } else {
                that.buildProof(false);
            }
        } else {
            that.buildProof(false);
        }
    }, 500);
    addArgosyActions($(that.options.proofingModalWrapper));
    $(document).on(argosyEvents.KENDO_EDITOR_IMAGE_UPLOADED, function (event, data, target) {
        if (target == undefined) {
            target = data.target;
        }
        if (data.Extension == undefined && data.response.Extension == ".pdf") {
            data = data.response;
        }
        that.CheckValidUpload(data, target);
    });
};

Proofing.prototype.getGlobalFormsId = function () {
    var that = this;
    var globalFormId = 0;
    $(that.data.DynamicDataSourceProfiles).each(function(i, profile) {
        globalFormId = profile.GlobalFormsId;
    });
    return globalFormId;
}
Proofing.prototype.refreshDynamicDataSourceForm = function () {
    var that = this;
    if (that.dynamicDataSourceParameters != null && that.dynamicDataSourceViewModel != null) {
        that.dynamicDataSourceViewModel.getTemporaryProfileId(that.dynamicDataSourceParameters, true);
    }
}

Proofing.prototype.showDynamicDataSourceForm = function () {
    var that = this;
    var content = kendo.Template.compile($(that.options.dynamicDataSourceForm).html())(that.data.DynamicDataSource);
    var viewModel = kendo.observable({
        disableDynamicDataSourceContinue: true,
        onContinueDynamicDataSource: function (e) {
            var params = this.getDynamicDataSourceParams();
            this.getTemporaryProfileId(params);
        },
        isDynamicDataSourceReady: function (e) {
            var inputs = $("#divDynamicDataSourceForm").find("input:not([type=hidden])");
            var allFilledOut = true;
            $(inputs).each(function(i, input) {
                if ($(input).val().trim().length === 0) {
                    allFilledOut = false;
                }
            });
            this.set("disableDynamicDataSourceContinue", !allFilledOut);
        },
        getTemporaryProfileId: function (parameters, forceRefresh, updateInputs) {
            var model = this;
            var identifier = "";
            forceRefresh = forceRefresh == null ? false : forceRefresh;
            updateInputs = updateInputs == null ? true : updateInputs;
            that.dynamicDataSourceParameters = parameters;
            block(null, "~{MsgLoading}~");
            $(parameters).each(function (e, param) {
                if (param.isIdentifier) {
                    identifier += param.value + ",";
                }
            });
            that.dynamicDataSourceKey = identifier;
            $.ajax({
                url: "/Store/Proofing/GetTemporaryGlobalProfile/",
                dataType: "json",
                data: {
                    globalFormId: that.getGlobalFormsId(),
                    identifier: identifier
                },
                success: function (result) {
                    result.globalProfileId = result.globalProfileId === 0 ? null : result.globalProfileId;
                    if (result.globalProfileId == null || result.globalProfileId === 0 || result.isExpired || forceRefresh) {
                        var requestUrl = model.generateRequestUrl(parameters);
                        that.dynamicDataSourceResponse = {
                            requestUrl: requestUrl,
                            identifier: identifier,
                            result: result
                        };
                        model.getDynamicDataSourceData(requestUrl, identifier, result.globalProfileId);
                    } else {
                        $(document).trigger(argosyEvents.SELECT_GLOBAL_PROFILE, {
                            globalProfileId: result.globalProfileId,
                            isTemporary: true, 
                            callback: function (e) {
                                $.fancybox({
                                    href: that.options.proofingCustomizationView
                                });
                            },
                            updateInputs: updateInputs
                        });
                    }
                }
            });
        },
        onCancelDynamicDataSource: function (e) {
            $.fancybox({
                href: that.options.proofingCustomizationView
            });
        },
        generateRequestUrl: function (parameters) {
            var dataSource = that.data.DynamicDataSource;
            var url = dataSource.UrlStructure;
            $(parameters).each(function(i, param) {
                var regExp = new RegExp("{" + param.name + "}");
                url = url.replace(regExp, param.value);
            });
            return url;
        },
        getDynamicDataSourceData: function (requestUrl, identifier, globalProfileId) {
            var model = this;
            $.ajax({
                url: "/DataView/GetRemoteJsonObject/",
                dataType: "json",
                data: {
                    path: requestUrl
                },
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Success) {
                        if (model.isValid(result.Records)) {
                            that.createTemporaryGlobalProfile(result.Records, identifier, globalProfileId);
                        }
                    } else {
                        prompt.alert({
                            question: result.Message,
                            description: "Ref: " + result.Guid,
                            type: "warning",
                            yes: function (e) {
                                $.fancybox.close();
                            }
                        });
                    }
                    unblock();
                }
            });
        },
        isValid: function(data) {
            var dataSource = that.data.DynamicDataSource;
            var valid = true;
            if (dataSource.SuccessResponse != null && dataSource.SuccessJsonPath != null) {
                valid = this.getValue(data, dataSource.SuccessJsonPath) == dataSource.SuccessResponse;
                if (!valid) {
                    var message = this.getValue(data, dataSource.ErrorJsonPath);
                    if (message == null || message === "") {
                        message = "~{MsgFailedDynamicDataFetch}~";
                    }
                    prompt.alert({
                        question: message,
                        type: "warning",
                        yes: function (e) {
                            that.showDynamicDataSourceForm();
                        }
                    });
                }
            }
            return valid;
        },
        getValue: function(data, path) {
            var arrayValue = jsonPath(data, path);
            var parsedValue = null;
            if (arrayValue.length === 1) {
                parsedValue = arrayValue[0];
            }
            return parsedValue.toString();
        },
        getDynamicDataSourceParams: function() {
            var items = $("*[data-argosy-dynamic]");
            var params = new Array();
            $(items).each(function(e, item) {
                var param = $(item);
                params.push({
                    name: param.attr("data-argosy-dynamic"),
                    value: param.val().trim(),
                    isIdentifier: eval(param.attr("data-argosy-identifier"))
                });
            });
            return params;
        }
    });
    viewModel.bind("change", function (e) {
        this.isDynamicDataSourceReady(e);
    });
    $(that.data.DynamicDataSource.Parameters).each(function(i, variable) {
        viewModel["dynamic_" + this.Name] = variable.DefaultValue;
    });
    that.dynamicDataSourceViewModel = viewModel;
    if (that.firstRun && that.data != null && that.data.CustomizationState != null && that.data.CustomizationState.DynamicDataSourceJson != null && that.data.CustomizationState.DynamicDataSourceJson.trim().length > 0) {
        var params = JSON.parse(that.data.CustomizationState.DynamicDataSourceJson);
        if (params != null && params.length > 0) {
            that.dynamicDataSourceViewModel.getTemporaryProfileId(params, false, false);
            that.firstRun = false;
        }
    } else {
        $.fancybox({
            content: content,
            modal: true,
            afterShow: function (e) {
                var wrapper = $(".fancybox-inner");
                kendo.bind(wrapper, that.dynamicDataSourceViewModel);
            }
        });
    }
};

Proofing.prototype.firstRun = true;

Proofing.prototype.changeProofingView = function (data) {
    var that = this;
    that.destroy();
    that.proofingResult = null;
    that.initialize(data);
};

Proofing.prototype.destroy = function () {
    var that = this;
    kendo.destroy(that.getElement());
    that.getElement().empty();
};
Proofing.prototype.configureMultiplePartsNavigation = function () {
    var that = this;
    if (that.data.Parts.length > 1) {
        var element = that.getElement();
        var previousPartButton = element.find(".goto-previous-part").closest("a");
        var nextPartButton = element.find(".goto-next-part").closest("a");
        var proofingRequiredMessage = {
            question: "~{MsgApproveToContinue}~",
            description: "",
            type: "warning",
            yes: function (e) {
                var href = that.options.proofingCustomizationView;
                if (that.proofingResult != null) {
                    href = that.options.approvalProofModalHref;
                }
                $.fancybox({
                    href: href
                });
            }
        };
        previousPartButton.click(function (e) {
            var partState = that.getCurrentPartState();
            if (partState != null && partState.IsApproved) {
                var nextNumber = 0;
                if (that.data.CurrentPartNumber === 1) {
                    nextNumber = that.data.Parts.length;
                } else {
                    nextNumber = that.data.CurrentPartNumber - 1;
                }
                that.updateProofingDisplay(nextNumber);
            } else {
                prompt.alert(proofingRequiredMessage);
            }
        });
        nextPartButton.click(function (e) {
            var partState = that.getCurrentPartState();
            if (partState != null && partState.IsApproved) {
                var nextNumber = 0;
                if (that.data.CurrentPartNumber === that.data.Parts.length) {
                    nextNumber = 1;
                } else {
                    nextNumber = that.data.CurrentPartNumber + 1;
                }
                that.updateProofingDisplay(nextNumber);
            } else {
                prompt.alert(proofingRequiredMessage);
            }
        });
    }
};

Proofing.prototype.updateDefaultProofName = function (variables) {
    var that = this,
        proofName = that.getProofName(variables);
    $(that.options.approvalProofModalHref).find("#approvalProofName").val(proofName);
};
Proofing.prototype.initialCounter = [];
Proofing.prototype.selectProfile = function (index, callback, showLoading) {
    if (showLoading == null) {
        showLoading = true;
    }
    
    $("select[data-argosy-action=select-proofing-profile]").each(function (loop, element) {
        var ddl = $(element).getKendoDropDownList();
        var formId = $(element).attr("data-form-id") == undefined ? 0 : $(element).attr("data-form-id");
        if (Proofing.prototype.initialCounter[formId] != undefined) {
            var counter = Proofing.prototype.initialCounter[formId];
            Proofing.prototype.initialCounter[formId]++;
        } else {
            var counter = 1;
            Proofing.prototype.initialCounter[formId] = 2;
        }
        var index = 0;
        ddl.select(function (data) {
            if (data.value !== "-1" && counter === index)
            {
                return true;
            }
            else {
                index++;
            }
        });
        triggerProfileChangeEvent(ddl.value(), callback, showLoading);
    });
    
};

Proofing.prototype.FormInstanceLoaded = function () {
    var that = this;
    that.baseOptions.formInstanceCount = that.baseOptions.formInstanceCount - 1;
    if (that.baseOptions.formInstanceCount == 0) {
        unblock();
        that.buildProof(false);
    }
}

Proofing.prototype.getCurrentPartState = function() {
    var that = this;
    var partState = null;
    $(that.data.Parts).each(function(i) {
        if (that.data.Part.Sku === this.Sku) {
            partState = this;
        }
    });
    return partState;
};

Proofing.prototype.updateProofingDisplay = function (nextNumber) {
    var that = this;
    var partView = that.data.Parts[(nextNumber - 1)];
    block(null, "~{MsgLoadingNextProduct}~");
    $.ajax({
        url: "/Store/Proofing/GetProofingViewModel/" + partView.Sku + "/",
        dataType: "json",
        success: function(result) {
            if (result.ReturnCode === ReturnCode.Success) {
                result.Records.Parts = that.data.Parts;
                result.Records.CurrentPartNumber = nextNumber;
                that.changeProofingView(result.Records);
            } else {
                prompt.alert({
                    question: result.Message,
                    description: "Ref: " + result.Guid,
                    type: "warning",
                    yes: function(e) {
                        $.fancybox.close();
                    }
                });
            }
            unblock();
        }
    });
};

Proofing.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

Proofing.prototype.renderDesignTemplate = function () {
    var that = this;
    var html = $(that.options.proofingDesignTemplatesTemplate).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.data);
    $(that.options.proofingModalWrapper).append(result);
    var templates = $(that.options.proofingModalWrapper).find("*[data-argosy-action=select-design-template]");
    $(templates).each(function (i) {
        var image = $(this);
        var value = image.attr("data-argosy-value");
        if (i === 0) {
            image.closest("div").addClass("k-state-selected");
        } else {
            image.closest("div").removeClass("k-state-selected");
        }
        image.closest("a").click(function (e) {
            if (that.data != null) {
                $(that.data.Variables).each(function(z) {
                    if (this.IsDesignTemplate) {
                        $("#var_" + this.Name).val(value);
                    }
                });
                $(templates).each(function (i) {
                    $(this).closest("div").removeClass("k-state-selected");
                });
                image.closest("div").addClass("k-state-selected");
                that.buildProof(true);
            }
        });
    });
};

Proofing.prototype.renderPersonalizeTemplate = function () {
    var that = this;
    var html = $(that.options.proofingPersonalizeTemplate).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.data);
    $(that.options.proofingModalWrapper).append(result);
};

Proofing.prototype.updateImageList = function (images, variableName, selectedImage, structId, instanceId) {
    // this needs to change to updating the image options on the image editor.
    if (instanceId > 0) {
        var imageElement = $("[id=var_" + variableName + "][data-instance-id=" + instanceId + "]");
    } else {
        var imageElement = $("#var_" + variableName);
    }
    
    if (!imageElement.is("input[type=hidden]")) {
        var imageEditor = imageElement.getKendoImageEditor();
        imageEditor.setImageBankImages(images, structId);
        var extension = getFileExtension(selectedImage);
        if (extension == ".pdf" || extension == ".eps")
        {
            imageEditor.initializeImageList(selectedImage, null);
            imageEditor.generatePreviewImage(selectedImage, function (previewPath) {
                if (getFileExtension(selectedImage) == ".pdf") {
                    previewPath = previewPath[0].href;
                }
                imageEditor.updateSelectedFile(selectedImage, previewPath);
            });
        } else {
            imageEditor.initializeImageList(selectedImage, null);
        }
        
    }
};

Proofing.prototype.createTemporaryGlobalProfile = function (dynamicDataSource, identifier, globalProfileId) {
    var that = this;
    var dataSourceProfiles = that.data.DynamicDataSourceProfiles;
    var globalProfile = new Array();
    var globalFormsId = 0;
    globalProfileId = globalProfileId == null ? 0 : globalProfileId;
    $(dataSourceProfiles).each(function (i, variable) {
        var arrayValue = jsonPath(dynamicDataSource, variable.JsonPath);
        var parsedValue = null;
        var parsedDataSource = null;
        if (arrayValue.length === 1) {
            parsedValue = arrayValue[0];
        }
        if (parsedValue != null && $.isArray(parsedValue)) {
            parsedDataSource = arrayValue[0];
            parsedValue = parsedDataSource[0];
        }
        var profileData = {
            Value: parsedValue,
            GlobalFormStructId: variable.GlobalFormsStructId
        };
        globalFormsId = variable.GlobalFormsId;
        if (parsedDataSource != null) {
            profileData.DataSource = JSON.stringify(parsedDataSource);
        }
        globalProfile.push(profileData);
    });

    that.taskHub.generateDynamicDataGlobalProfile(that.data.DynamicDataSource.Name, globalFormsId, identifier, that.data.Part.ProofingProjectId, globalProfile, globalProfileId);
};

Proofing.prototype.update = function (task) {
    var that = this;
};

Proofing.prototype.complete = function (task) {
    var that = this;
    if (task.ErrorGuid != null && task.ErrorGuid !== "") {
        prompt.alert({
            question: "~{MsgErrorProofingProfile}~",
            description: "Ref: " + task.ErrorGuid,
            type: "warning",
            yes: function (e) {
                $.fancybox({
                    href: "#divPersonalize"
                });
            }
        });
    } else {
        var variables = eval(task.Data.variables);
        $(document).trigger(argosyEvents.EVENT_TEMPORARY_GLOBAL_PROFILE_CREATED, [variables]);
    }
};

Proofing.prototype.error = function (task) {
    var that = this;
};

Proofing.prototype.getControlType = function (input) {
    var controlType = input.attr("data-control-type");
    if (controlType != null) {
        controlType = controlType.toLowerCase();
    }
    return controlType;
}

Proofing.prototype.updateVariableValues = function(variables, isRegularProfile, updateInputs) {
    var that = this;
    if (isRegularProfile == null) {
        isRegularProfile = true;
    }
    updateInputs = (updateInputs == null) ? true : false;
    $(variables).each(function (e) {
        if (this.INSTANCE_ID > 0) {
            var input = $("*[data-variable-id=" + this.VARIABLE_ID + "][data-instance-id=" + this.INSTANCE_ID + "]");
        } else {
            var input = $("*[data-variable-id=" + this.VARIABLE_ID + "]");
        }
        
        var controlType = that.getControlType(input);
        if (!updateInputs) {
            this.VALUE = that.getValue(input);
        } else if (controlType == "imagelist") {
            if (input[0].attributes['data-default-value'] !== undefined) {
                this.VALUE = input[0].attributes['data-default-value'].value;
            } else if (input[0].attributes['data-original'] !== undefined) {
                this.VALUE = input[0].attributes['data-original'].value;
            }
        }
    });
    $(variables).each(function (i) {
        var input = null;
        var controlType = null;
        if (isRegularProfile) {
            input = $("#var_" + this.Name);
            controlType = that.getControlType(input);
            if (controlType !== "imagelist") {
                setInputValue(input, this.Value);
            } else if (controlType === "imagelist") {
                // do nothing user profiles can not modify an imagelist.
            }
        } else {
            if (this.INSTANCE_ID > 0) {
                input = $("*[data-variable-id=" + this.VARIABLE_ID + "][data-instance-id=" + this.INSTANCE_ID + "]");
            } else {
                input = $("*[data-variable-id=" + this.VARIABLE_ID + "]");
            }
            if (this.TYPE != null && this.TYPE.toLowerCase() === "dropdownlist" && input.is("select") && this.DATASOURCE_JSON != null && this.DATASOURCE_JSON.length > 0) {
                var ddl = input.getKendoDropDownList();
                ddl.setOptions({ dataTextField: "Text", dataValueField: "Value" });
                ddl.setDataSource(new kendo.data.DataSource({
                    data: eval(this.DATASOURCE_JSON)
                }));
            }
            controlType = that.getControlType(input);
            var data = null;
            if (controlType === "imagelist") {
                data = eval(this.DATASOURCE_JSON);
                that.updateImageList(data, input.attr("data-variable-name"), this.VALUE, this.VARIABLE_ID, this.INSTANCE_ID);
            }
            if (data == null) {
                setInputValue(input, this.VALUE);
            }
        }
    });
    setTimeout(function(e) {
        $.fancybox.update();
    }, 500);
}

Proofing.prototype.reloadProfileOptions = function(options) {
    var that = this;
    var ddl = $("select[data-argosy-action=select-proofing-profile]").getKendoDropDownList();
    that.data.Profiles = options;
    var data = [];
    if (that.data.Profiles.length > 0) {
        data.push({ text: "~{TxtDdlUserProfiles}~" });
        $(that.data.Profiles).each(function() {
            data.push({ text: this.Name, value: this.Id });
        });
    }
    if (that.data.GlobalProfiles.length > 0) {
        data.push({ text: "~{TxtDdlGlobalProfiles}~" });
        $(that.data.GlobalProfiles).each(function() {
            data.push({ text: this.NAME, value: this.GLOBAL_FORMS_PROFILE_ID });
        });
    }
    var dataSource = new kendo.data.DataSource({
        data: data
    });
    ddl.setDataSource(dataSource);

    ddl = $("#existingProfileName").getKendoDropDownList();
    that.data.Profiles = options;
    data = [];
    $(options).each(function () {
        data.push({ text: this.Name, value: this.Id });
    });
    dataSource = new kendo.data.DataSource({
        data: data
    });
    ddl.setDataSource(dataSource);

    that.enableProfiles(!(that.data.Profiles.length === 0 && that.data.GlobalProfiles.length === 0));
}

Proofing.prototype.enableProfiles = function (enable) {
    var that = this;
    enable = enable == null ? true : enable;
    if (enable) {
        $(".proofingProfiles").show();
    } else {
        $(".proofingProfiles").hide();
    }
    var ddl = $(".proofingProfiles").getKendoDropDownList();
    if (ddl != null) {
        ddl.ul.width(400);
    }
}

Proofing.prototype.createProfile = function () {
    var that = this;
    var variables = that.getVariables(false);
    var profileName = $("#profileName").val();
    var existingProfileId = $("#existingProfileName").val();
    if (profileName.length > 0) {
        $.ajax({
            url: "/Store/Proofing/CreateProfile?partId=" + that.data.Part.PartId,
            dataType: "json",
            method: "POST",
            data: {
                Name: profileName,
                Variables: JSON.stringify(variables)
            },
            success: function(result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    $.fancybox({
                        href: that.options.proofingCustomizationView
                    });
                    that.reloadProfileOptions(result.Records);
                } else {
                    prompt.alert({
                        question: result.Message,
                        description: "Ref: " + result.Guid,
                        type: "warning",
                        yes: function(e) {
                            $.fancybox({
                                href: that.options.proofingSaveProfileView
                            });
                        }
                    });
                }
            }
        });
        $("#profileName").removeClass("input-validation-error");
    } else if (existingProfileId > 0) {
        $.ajax({
            url: "/Store/Proofing/UpdateProfile?profileId=" + existingProfileId + "&partId=" + that.data.Part.PartId,
            dataType: "json",
            method: "POST",
            data: {
                Name: profileName,
                Variables: JSON.stringify(variables)
            },
            success: function(result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    $.fancybox({
                        href: that.options.proofingCustomizationView
                    });
                    that.reloadProfileOptions(result.Records);
                } else {
                    prompt.alert({
                        question: result.Message,
                        description: "Ref: " + result.Guid,
                        type: "warning",
                        yes: function(e) {
                            $.fancybox({
                                href: that.options.proofingSaveProfileView
                            });
                        }
                    });
                }
            }
        });
        $("#profileName").removeClass("input-validation-error");
    } else {
        $("#profileName").addClass("input-validation-error");
        $("#profileName").focus();
    }
}


Proofing.prototype.renderPickProfileTemplate = function() {
    var that = this;
    
    that.enableProfiles(!(that.data.Profiles.length === 0 && (that.data.GlobalProfiles === null && that.data.GlobalProfiles.length === 0) && (that.data.GlobalProfilesWithInstance === null && Object.keys(that.data.GlobalProfilesWithInstance).length === 0)));
    $(document).bind(argosyEvents.EVENT_GENERATE_HIGH_RES_PROOF, function() {
        that.buildProof(true, true);
    });

    $(document).bind(argosyEvents.EVENT_TEMPORARY_GLOBAL_PROFILE_CREATED, function (e, data) {
        $.fancybox({
            href: "#divPersonalize"
        });
        that.updateVariableValues(data, false);
    });
    $(document).bind(argosyEvents.SELECT_GLOBAL_PROFILE, function (e, data) {
        if (!isNaN(data.globalProfileId)) {
            if (data.globalProfileId !== -1) {
                data.isTemporary = data.isTemporary != null ? data.isTemporary : false;
                data.instanceId = data.instanceId != null ? data.instanceId : false;
                if (data.showLoading == null || data.showLoading) {
                    block(null, "~{MsgLoadingProfile}~");
                }
                $.ajax({
                    url: "/Store/Proofing/GetGlobalProfileVariables?globalFormsProfileId=" + data.globalProfileId + "&projectId=" + that.data.Part.ProofingProjectId/* + "&isTemporary=" + data.isTemporary*/ + "&instanceId=" + data.instanceId,
                    dataType: "json",
                    method: "GET",
                    success: function (result) {
                        if (result.ReturnCode == ReturnCode.Success) {
                            if (data.isTemporary) {
                                $.fancybox({
                                    href: "#divPersonalize"
                                });
                                that.updateVariableValues(result.Records, false);
                            } else {
                                that.updateVariableValues(result.Records, false, data.updateInputs);
                            }
                            if (data.callback != null) {
                                data.callback();
                            }
                        } else {
                            prompt.alert({
                                question: result.Message,
                                description: "Ref: " + result.Guid,
                                type: "warning",
                                yes: function (e) {
                                    $.fancybox({
                                        href: that.options.proofingCustomizationView
                                    });
                                }
                            });
                        }
                    },
                    complete: function (e) {
                        if (data.showLoading == null || data.showLoading) {
                            unblock();
                        }
                    }
                });
            }
            else {
                var variables = [];
                $("[data-instance-id=" + data.instanceId + "]").each(function (index, element) {
                    if ($(element).attr("data-variable-id") != undefined) {
                        variables.push({
                            VARIABLE_ID: $(element).attr("data-variable-id"),
                            INSTANCE_ID: data.instanceId,
                            VALUE: ""
                        });
                    }
                });
                that.updateVariableValues(variables, false, null);
            }
        }
    });
    $(document).bind(argosyEvents.SELECT_STANDARD_PROFILE, function (e, data) {
        if (!isNaN(data.standardProfileId)) {
            if (data.showLoading == null || data.showLoading) {
                block(null, "~{MsgLoadingProfile}~");
            }
            $.ajax({
                url: "/Store/Proofing/GetProfileVariables?profileId=" + data.standardProfileId + "&partId=" + that.data.Part.PartId,
                dataType: "json",
                method: "GET",
                success: function(result) {
                    if (result.ReturnCode == ReturnCode.Success && result.Records.length > 0) {
                        that.updateVariableValues(result.Records[0].Variables);
                        if (data.callback != null) {
                            data.callback();
                        }
                    } else {
                        prompt.alert({
                            question: result.Message,
                            description: "Ref: " + result.Guid,
                            type: "warning",
                            yes: function(e) {
                                $.fancybox({
                                    href: that.options.proofingCustomizationView
                                });
                            }
                        });
                    }
                },
                complete: function (e) {
                    if (data.showLoading == null || data.showLoading) {
                        unblock();
                    }
                }
            });
        }
    });
}
Proofing.prototype.renderApproveProofTemplate = function () {
    var that = this;
    var html = $(that.options.proofingApproveProofTemplate).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.data);
    $(that.options.proofingModalWrapper).append(result);
    var wrapper = $(that.options.proofingModalWrapper).find(that.options.approvalProofModalHref);
    wrapper.find(that.options.approvalProofAcceptButton).click(function (e) {
        var initial = $(that.options.approvalProofInitial).val();
        var name = $(that.options.approvalProofName).val();
        if (initial.length > 0) {
            var variableObject = that.getVariables(false);
            that.saveCustomizationState(variableObject, that.data.Part.PartId, that.proofingResult.TransactionId, initial, name);
        } else {
            prompt.alert({
                question: "~{MsgInitialToContinue}~",
                description: "",
                type: "warning",
                yes: function (e) {
                    $.fancybox({
                        href: that.options.approvalProofModalHref
                    });
                }
            });
        }
    });
};

Proofing.prototype.saveCustomizationState = function(variables, partId, transactionId, initials, name) {
    var that = this;
    var partState = that.getCurrentPartState();
    if (partState == null || partState.CustomizationStateId <= 0) {
        block(null, "~{MsgAddingToCart}~");
        $.ajax({
            url: "/Store/Proofing/SaveCustomizationState",
            dataType: "json",
            data: {
                variables: JSON.stringify(variables),
                partId: partId,
                transactionId: transactionId,
                initials: initials,
                orderLineTag: name,
                dynamicDataSourceKey: that.dynamicDataSourceKey,
                dynamicDataSourceParams: JSON.stringify(that.dynamicDataSourceParameters)
            },
            method: "POST",
            success: function(result) {
                if (result.ReturnCode == ReturnCode.Success && result.Records > 0) {
                    that.CustomizationStateId = result.Records;
                    that.saveCustomizationToCart(partId, that.CustomizationStateId);
                } else {
                    unblock();
                    prompt.alert({
                        question: result.Message,
                        description: "Ref: " + result.Guid,
                        type: "warning",
                        yes: function(e) {
                            $.fancybox({
                                href: that.options.approvalProofModalHref
                            });
                        }
                    });
                }
            }
        });
    } else {

        var message = "~{MsgUpdatingCart}~",
            isOrderEdit = that.data.RedirectUrl !== null && that.data.RedirectUrl.length > 0;
        if (isOrderEdit === true) {
            message = "~{MsgUpdatingOrder}~";
        }
        block(null, message);
        $.ajax({
            url: "/Store/Proofing/UpdateCustomizationState",
            dataType: "json",
            data: {
                customizationStateId: partState.CustomizationStateId,
                variables: JSON.stringify(variables),
                transactionId: transactionId,
                initials: initials,
                orderLineTag: name,
                dynamicDataSourceKey: that.dynamicDataSourceKey
            },
            method: "POST",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success && result.Records > 0) {
                    that.CustomizationStateId = result.Records;
                    if (isOrderEdit === false) {
                        that.saveCustomizationToCart(partId, that.CustomizationStateId);
                    } else {
                        window.location = that.data.RedirectUrl;
                    }
                } else {
                    unblock();
                    prompt.alert({
                        question: result.Message,
                        description: "Ref: " + result.Guid,
                        type: "warning",
                        yes: function (e) {
                            $.fancybox({
                                href: that.options.approvalProofModalHref
                            });
                        }
                    });
                }
            }
        });
    }
};
Proofing.prototype.updatePartState = function(sku, customizationStateId, isApproved, cartId) {
    var that = this;
    var partState = null;
    if (that.data.Parts != null) {
        $(that.data.Parts).each(function(i) {
            if (this.Sku === sku) {
                if (customizationStateId != null) {
                    this.CustomizationStateId = customizationStateId;
                }
                if (isApproved != null) {
                    this.IsApproved = isApproved;
                }
                if (cartId != null) {
                    this.CartId = cartId;
                }
                partState = this;
            }
        });
    }
    return partState;
};

Proofing.prototype.saveCustomizationToCart = function (partId, customizationStateId) {
    var that = this;
    var partState = that.updatePartState(that.data.Part.Sku, customizationStateId, true);
    var completeCustomization = function (response) {
        if (response != null && response.Records != null) {
            var records = response.Records;
            that.updatePartState(that.data.Part.Sku, customizationStateId, true, records.CartId);
        }
        var cartPath = "/Store/Cart";
        if (response != null && response.ReturnResponse != null &&
            response.ReturnResponse.ReturnUrl != null &&
            response.ReturnResponse.ReturnUrl.length > 0) {
            cartPath = response.ReturnResponse.ReturnUrl;
        }
        try {
            if (customizationStateIds != null) {
                customizationStateIds = $.grep(customizationStateIds, function (element) {
                    return element != customizationStateId;
                });
            }
        } catch (err) {
            // do nothing this means it isn't defined and we aren't worried about it.
        }
        if (that.data.Parts.length > 1) {
            var nextProof = 0;
            $(that.data.Parts).each(function(i) {
                if (!this.IsApproved && nextProof == 0) {
                    nextProof = i;
                }
            });
            if (nextProof == 0) {
                window.location = cartPath;
            } else {
                unblock();
                $.fancybox.close();
                that.updateProofingDisplay(nextProof + 1);
            }
        } else {
            window.location = cartPath;
        }
    }
    $.ajax({
        url: "/Store/Proofing/SaveCustomizationToCart",
        dataType: "json",
        data: {
            partId: partId,
            customizationStateId: customizationStateId,
            dynamicDataSourceKey: that.dynamicDataSourceKey,
            cartId: partState.CartId > 0 ? partState.CartId : null,
            orderLineId: getQuerystring("orderLineId", null)
        },
        method: "POST",
        success: function(result) {
            if (result.ReturnCode === ReturnCode.Success) {
                completeCustomization(result);
            } else {
                unblock();
                prompt.alert({
                    question: result.Message,
                    description: "Ref: " + result.Guid,
                    type: "warning",
                    yes: function(e) {
                        $.fancybox({
                            href: that.options.approvalProofModalHref
                        });
                    }
                });
            }
        }
    });
};

Proofing.prototype.renderGenerateQRCodeTemplate = function () {
    var that = this;
    var html = $(that.options.proofingGenerateQRCodeTemplate).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.data);
    $(that.options.proofingModalWrapper).append(result);
};

Proofing.prototype.renderSaveProfileTemplate = function () {
    var that = this;
    var html = $(that.options.proofingSaveProfileTemplate).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.data);
    $(that.options.proofingModalWrapper).append(result);
    $("#existingProfileName").kendoDropDownList();
};


Proofing.prototype.setupEventListeners = function () {
    var that = this;
    $(document).trigger(that.EVENT_LISTENERS_LOADED);

    $(document).bind(argosyEvents.EVENT_UPDATE_VARIABLES_BY_LINE_ID, function (e, data) {
        $(document).trigger(argosyEvents.START_LOADING);
        $.ajax({
            url: "/Proofing/GetOrderLineCustomizationStateVariables",
            dataType: "json",
            method: "POST",
            data: {
                orderLineId: data.orderLineId
            },
            success: function(result) {
                $.fancybox({
                    href: that.options.proofingCustomizationView
                });
                that.updateVariableValues(result.Records);
                that.buildProof();
            }
        });
    });
};

Proofing.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    return window[that.options.dataSource];
};

Proofing.prototype.buildProof = function (showRequiredFieldsWarning, generateHighRes) {
    var that = this;
    if (showRequiredFieldsWarning == null) {
        showRequiredFieldsWarning = true;
    }
    if (generateHighRes == null) {
        generateHighRes = false;
    }
    
    if (that.isValidVariables()) {
        $.fancybox.close();
        var variableObject = that.getVariables(false);
        $(document).trigger(argosyEvents.START_LOADING);
        var url = generateHighRes ? "/Store/Proofing/GenerateHighResProof/" + that.data.Part.Sku + "/" : "/Store/Proofing/GenerateProof/" + that.data.Part.Sku + "/";
        $.ajax({
            url: url,
            dataType: "json",
            method: "POST",
            data: {
                variables: JSON.stringify(variableObject),
                height: $(window).height()-250,// remove 250 from this if you want it to always compensate for the header/footer.
                width: $(window).width()
            },
            success: function(result) { 
                $(document).trigger(argosyEvents.END_LOADING);
                if (result.ReturnCode === ReturnCode.Success) {
                    if (!generateHighRes) {
                        that.proofingResult = result.Records;
                        that.updateProofingPageNavigation();
                        that.updateSelectedProofingPage();
                        that.updateDefaultProofName(variableObject);
                    } else {
                        window.open(result.Records.HighResUrl);
                    }
                } else {
                    prompt.alert({
                        question: result.Message,
                        description: "Ref: " + result.Guid,
                        type: "warning",
                        yes: function (e) {
                            $.fancybox({
                                href: that.options.proofingCustomizationView
                            });
                        }
                    });
                }
            }
        });
    } else {
        if (showRequiredFieldsWarning) {
            prompt.alert({
                question: "~{MsgMissingFieldsForProofing}~",
                description: "~{MsgUpdateFormContinue}~",
                type: "warning",
                yes: function(e) {
                    $.fancybox({
                        href: that.options.proofingCustomizationView
                    });
                }
            });
        } else {
            $.fancybox({
                href: that.options.proofingCustomizationView
            });
        }
    }
};
Proofing.prototype.getValue = function (element) {
    element = $(element);
    var value = null;
    if ($.isKendo(element)) {
        var kendoControl = $.getKendoControl(element);
        var dataValueField = kendoControl.element.attr("data-text-value");
        if (dataValueField == null || dataValueField === "") {
            value = kendoControl.value();
            if (element.attr("data-format") != null && value != null && value !== "") {
                value = kendo.toString(value, element.attr("data-format"));
            }
        } else {
            var selectedIndex = kendoControl.selectedIndex;
            var naturalValue = kendoControl.value();
            if (selectedIndex != null && selectedIndex > -1) {
                var dataItem = kendoControl.dataItem(selectedIndex);
                if (dataItem != null) {
                    value = kendoControl.dataItem(selectedIndex)[dataValueField];
                }
            } else if ($.type(naturalValue) === "string" || $.type(naturalValue) === "number") {
                value = naturalValue;
            }
        }
        if (value == null) {
            value = "";
        }
        if ($.type(value) === "date") {
            value = kendo.toString(value, "d");
        }
    } else {
        value = element.val();
    }
    return value;
};

Proofing.prototype.getProofName = function(variables)
{
    if (variables == null) {
        return null;
    };
    var proofName = "";
    _.forEach(variables, function (variable) {
        if (variable.IsProofName) {
            proofName += decodeURIComponent(variable.Value) + "_";
        };
    });
    proofName = proofName.slice(0, -1);
    if (proofName.length === 0) {
        _.forEach(variables, function (variable) {
            if (proofName.length === 0 && variable.ControlType.toLowerCase() === "textbox") {
                proofName = decodeURIComponent(variable.Value);
            };
        });
    };
    return proofName.substring(0, 100);
};

Proofing.prototype.getVariables = function (includeRequired, element, prefix, argosyType) {
    var that = this;
    if (prefix == null) {
        prefix = "var_";
    }
    if (element == null) {
        element = that.options.proofingCustomizationView;
    }
    if (argosyType == null) {
        argosyType = "data-argosy-proofing";
    }
    var variables = $(element).find("*[" + argosyType + "]");
    var variableObject = [];
    $(variables).each(function (i, variable) {
        variable = $(variable);
        var propertyName = variable.attr(argosyType).replace(prefix, ""),
            isProofName = variable.data("isProofName"),
            item = { Name: propertyName, Value: "", IsProofName: isProofName };
        item.Value = that.getValue(this);
        if (includeRequired) {
            item.Required = (variable.attr("required") != null);
            item.Element = variable;
        }
        if (variable.data("isUpload") != null) {
            item.IsUpload = variable.data("isUpload");
        } else {
            item.IsUpload = false;
        }
        if (variable.data("variableId") != null) {
            item.VariableId = variable.data("variableId");
        }
        if (variable.data("controlType") != null) {
            item.ControlType = variable.data("controlType");
        }
        // stop using this because we apparently support html elements and that breaks json parsing of the response.
        /*if ($(this).attr("data-display-name") != null) {
            item.DisplayName = $(this).attr("data-display-name");
        }*/
        if (variable.data("name") != null) {
            item.Name = variable.data("name");
            item.DisplayName = item.Name;
        }
        if (variable.data("instanceId") != null) {
            item.InstanceId = variable.data("instanceId");
        }
        if (item.Value != null) {
            item.Value = encodeURIComponent(item.Value);
        }
        if (item.Name != null && item.Name.trim().length > 0) {
            variableObject.push(item);
        }
    });
    return variableObject;
}
Proofing.prototype.isValidVariables = function (element, prefix, argosyType) {
    var that = this;
    var valid = true;
    var variables = that.getVariables(true, element, prefix, argosyType);
    $(variables).each(function (i) {
        if (this.Required && this.Value.trim().length == 0) {
            valid = false;
            if ($.isKendo(this.Element)) {
                $.getKendoControl(this.Element).wrapper.addClass("input-validation-error");
            } else {
                this.Element.addClass("input-validation-error");
            }
        } else {
            if ($.isKendo(this.Element)) {
                $.getKendoControl(this.Element).wrapper.removeClass("input-validation-error");
            } else {
                this.Element.removeClass("input-validation-error");
            }
        }
    });
    return valid;
}


Proofing.prototype.updateProofingPageNavigation = function () {
    var that = this;
    var navPanel = $(that.options.proofingRightNavigationPanel);
    // get the first page and fire the request early so it loads first.
    var firstPage = that.proofingResult.Pages[0];
    $('<link/>', {
        rel: "preload",
        as: "image",
        href: firstPage.PreviewImageUrl
    }).appendTo('body');
    $('<link/>', {
        rel: "preload",
        as: "image",
        href: firstPage.ThumbnailUrl
    }).appendTo('body');
    
    var newNavigationPanel = that.generateNavigationPanel();
    navPanel.empty();
    navPanel.append(newNavigationPanel);
    var navWrapper = navPanel.find(that.options.proofingNavigationWrapper);
    navWrapper.find("img[data-page-number]").each(function(i) {
        var img = $(this);
        $(img).click(function (e) {
            var pageNumber = parseInt(img.attr("data-page-number"));
            that.updateSelectedProofingPage(pageNumber);
        });
    });
    var previous = navWrapper.find("i.fa-chevron-left").parent();
    var next = navWrapper.find("i.fa-chevron-right").parent();
    previous.click(function (e) {
        var currentPage = parseInt(navWrapper.find(that.options.proofingNavigationCurrentPage).html());
        that.updateSelectedProofingPage((currentPage - 1));
    });
    next.click(function (e) {
        var currentPage = parseInt(navWrapper.find(that.options.proofingNavigationCurrentPage).html());
        that.updateSelectedProofingPage((currentPage + 1));
    });
    var continuePanel = $(that.options.proofingContinueAndDownloadOptionsPlaceHolder);
    continuePanel.empty();
    if (!that.options.isPreview) {
        continuePanel.append(that.generateContinuePanel());
    } else {
        continuePanel.append(that.generateDownLoadPanelForPreview());
    }
    // adjust the layout based on the pages
    var wrapper = $(that.options.proofingMainWrapperPanel);
    var children = wrapper.children();
    var pages = that.proofingResult.Pages.length;
    $(children).each(function(i) {
        var element = $(this);
        if (i == 1) {
            if (element.hasClass("col-md-8") && pages <= 1) {
                element.removeClass("col-md-8").addClass("col-md-10");
            } else if (element.hasClass("col-md-10") && pages > 1) {
                element.removeClass("col-md-10").addClass("col-md-8");
            }
        } else if (i > 1) {
            if (element.hasClass("col-md-2") && pages <= 1) {
                element.addClass("hide");
            } else if (element.hasClass("hide") && pages > 1) {
                element.removeClass("hide").addClass("show");
            }
        }
    });
}
Proofing.prototype.generateDownLoadPanelForPreview = function() {
    var that = this;
    var html = $(that.options.proofingDownloadOptionsForPreview).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.proofingResult);
    return result;
};

Proofing.prototype.generateContinuePanel = function () {
    var that = this;
    var html = $(that.options.proofingContinueAndDownloadOptions).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.proofingResult);
    return result;
}

Proofing.prototype.generateNavigationPanel = function () {
    var that = this;
    var html = $(that.options.proofingRightNavigationPanelTemplate).html();
    var kendoTemplate = kendo.template(html);
    that.proofingResult["PersonalizedProofs"] = that.data.PersonalizedProofs;
    var result = kendoTemplate(that.proofingResult);
    return result;
}
Proofing.prototype.updateSelectedProofingPage = function (pageNumber) {
    var that = this;
    if (pageNumber == null || pageNumber > that.proofingResult.Pages.length) {
        pageNumber = 1;
    }
    if (pageNumber === 0) {
        pageNumber = that.proofingResult.Pages.length;
    }
    $(that.options.proofingNavigationCurrentPage).html(pageNumber);
    var pageData = that.proofingResult.Pages[(pageNumber - 1)];
    $(that.options.proofingCurrentPagePreviewImage).parent().show();
    $(that.options.proofingCurrentPagePreviewImage).attr("src", pageData.PreviewImageUrl);
}

Proofing.prototype.CheckValidUpload = function (data, input) {
    var that = this;
    if (data != null) {
        if (data.Extension != null) {

            var previewExtensions = [".jpg", ".jpeg", ".png", ".jpg", ".tiff", ".tif", ".gif", ".pdf", ".eps"],
                extension = data.Extension,
                previewFileUrl = data.PreviewFileUrl;
            if ($.inArray(extension, previewExtensions) > -1) {
                var inputControl = that.getVariables(true, $("#" + input)[0].parentNode)[0];
                if (inputControl.Required && (inputControl.Value.trim().length == 0 && data.FileName.length == 0)) {
                    valid = false;
                    if ($.isKendo(input.Element)) {
                        $.getKendoControl(inputControl.Element).wrapper.addClass("input-validation-error");
                    } else {
                        inputControl.Element.addClass("input-validation-error");
                    }
                } else {
                    if ($.isKendo(inputControl.Element)) {
                        $.getKendoControl(inputControl.Element).wrapper.removeClass("input-validation-error");
                    } else {
                        inputControl.Element.removeClass("input-validation-error");
                    }
                }
            }
        };
    };
}