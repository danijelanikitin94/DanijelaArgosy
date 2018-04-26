function UpdatePrices(opts) {
	var that = this;
	$.extend(true, that.options, that.baseOptions, opts);
	var controlLoader = new ControlLoader();
	controlLoader.loadTemplate("UpdatePrices", function (template) {
		$(document.body).append(template);
	});
}

UpdatePrices.prototype.options = {};
UpdatePrices.prototype.baseOptions = {
	
};
UpdatePrices.prototype.searchCriteria = {
};

UpdatePrices.prototype.viewModel = null;
UpdatePrices.prototype.showFancyBox = function () {
	$.fancybox($("#_UpdatePricesContainer"), {
		openEffect: "none"
	});
};

UpdatePrices.prototype.PriceBreaksData = [];

UpdatePrices.prototype.ShowUpdatePrices = function () {
	var that = this;
	if(that.viewModel == null){
		that.viewModel = kendo.observable({		
			priceSource: new kendo.data.DataSource({
				transport: {
					read: function (options) {
						$.ajax({
							url: "/Admin/Parts/GetPrices",
							dataType: "json",
							type: "POST",
							data: that.options,
							success: function (e) {
								e.forEach(function (element) {
									element.PriceBreaks.forEach(function (inner){
										that.PriceBreaksData.push(inner);
									});
								});
								options.success(e);
								that.showFancyBox();
							}
						});
					},
					update: function (options) {
						$.ajax({
							url: "/Admin/Parts/UpdatePrice",
							dataType: "json",
							type: "POST",
							data: { priceList: JSON.stringify(options.data) }
						});
						options.success();
					}
				},
				schema: {
					model: {
						id: "CompanyPriceListId",
						fields: {
							CompanyPriceListId: {
								editable: false
							},
							CompanyPriceListName: {
								editable: false
							},
							DefaultPriceListName: {editable: false},
							IsDefault: { editable: false },
							CostPerEach: {type: "number"}
						}
					}
				}
			}),
			dataBound: function (e) {
				var grid = e.sender;
				var gridData = grid.dataSource.view();
				for (var i = 0; i < gridData.length; i++) {
					var currentUid = gridData[i].uid;
					var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
					var edit = $(currentRow).find(".k-grid-edit");
					if (gridData[i].StandardPriceListId != null) {
						edit.hide();
					}
				}
			},
			edit: function (e) {
				var commandCell = e.container.find("td:last");
				commandCell.html('<div><a title="Save" class="btn k-grid-update fa fa-check"></a><a title="Cancel" class="btn k-grid-cancel fa fa-close"></a></div>');
			}
		});
		kendo.bind($("#_UpdatePricesTemplate"), that.viewModel);

	}
	else {
		that.showFancyBox();
	}
	$("#_UpdatePricesTemplate").kendoTooltip({
		filter: ".k-grid-edit",
		content: "Edit"
	});
};

UpdatePrices.prototype.getIndexById = function (id) {
	var that = this;
	var idx,
		l = that.PriceBreaksData.length;

	for (var j = 0; j < l; j++) {
		if (that.PriceBreaksData[j].Id == id) {
			return j;
		}
	}
	return null;
}


UpdatePrices.prototype.showPriceBreaks = function (id) {
	var that = this;
	if (!$("#priceBreakDiv" + id).length){
		$("#divPriceBreaks" + id).parents("tr").after('<tr role="row" class="k-detail-row" id="priceBreakCell' + id + '"><td>&nbsp;</td><td colspan="4" role="gridcell"><input type="hidden" name="priceListId" value="' + id + '"/><div class="priceBreakGrid" id="priceBreakDiv' + id + '"></div></td></tr>');
	}
	if ($("#priceBreakDiv" + id).getKendoGrid() == null)
	{
	$("#priceBreakDiv" + id).kendoGrid({
		dataSource: {
			transport: {
				read: function (e) {
					e.success(UpdatePrices.prototype.PriceBreaksData);
				},
				create: function (e) {
					if (e.data.Id == "") {
						e.data.Id = 0;
						$.ajax({
							url: "/Admin/Parts/SavePriceBreaks",
							type: "POST",
							dataType: "json",
							data: {
								priceListId: id,
								priceBreaks: JSON.stringify(e.data)
							},
							success: function (response) {
								if (response.success) {
									UpdatePrices.prototype.PriceBreaksData = [];
									response.priceLists.forEach(function (element) {
										element.PriceBreaks.forEach(function (inner) {
											UpdatePrices.prototype.PriceBreaksData.push(inner);
										});
									});
								}
								$("#priceBreakDiv" + id).data("kendoGrid").refresh();
							}
						});
					}
				},
				update: function (e) {
					$.ajax({
						url: "/Admin/Parts/SavePriceBreaks",
						type: "POST",
						dataType: "json",
						data: {
							priceListId: id,
							priceBreaks: JSON.stringify(e.data)
						},
						success: function (response) {
							if (response.success) {
								UpdatePrices.prototype.PriceBreaksData = [];
								response.priceLists.forEach(function (element) {
									element.PriceBreaks.forEach(function (inner) {
										UpdatePrices.prototype.PriceBreaksData.push(inner);
									});
								});
							}
							$("#priceBreakDiv" + id).data("kendoGrid").refresh();
						}
					});
				},
				destroy: function (e) {
					$.ajax({
						url: "/Admin/Parts/DeletePriceBreak",
						type: "POST",
						dataType: "json",
						data: {
							priceListId: id,
							priceBreakId: e.data.Id
						},
						success: function (response) {
							UpdatePrices.prototype.PriceBreaksData = [];
							response.forEach(function (element) {
								element.PriceBreaks.forEach(function (inner) {
									UpdatePrices.prototype.PriceBreaksData.push(inner);
								});
							});
							$("#priceBreakDiv" + id).data("kendoGrid").refresh();
						}
					});
				}
			},
			error: function (e) {
			},			
			schema: {
				model: {
					id: "Id",
					fields: {
						Id: { editable: false},
						PriceListId: { editable: false, defaultValue: id},
						Quantity: { type: "number", validation: { min: 1, required: true } },
						TypeString: { validation: { required: true }, defaultValue: "$"},
						Discount: { type: "number", validation: { min: 0.01, required: true } }
					}
				}
			},
			filter: { field: "PriceListId", operator: "eq", value: id },
		},
		editable: "inline",
        toolbar: [{ name: "create", text:"" }],
        columns: [
            { field: "Id", hidden: true },
            { field: "PriceListId", hidden: true },
            { field: "Quantity", title: "Volume", width: "10px", headerAttributes: { style: "text-align:right" }, attributes: { style: "padding:0 5px; text-align:right;" }, editor: UpdatePrices.prototype.NumericEditor },
            { field: "TypeString", editor: that.typeDropDownEditor, title: "Type", width: "10px", headerAttributes: { style: "text-align:right;" }, attributes: { style: "padding:0 5px;" } },
            { field: "Discount", title: "Discount", width: "10px", headerAttributes: { style: "text-align:right" }, attributes: { style: "padding:0 5px;" }, editor: UpdatePrices.prototype.NumericEditor },
			{ command: [{ name: "destroy", text: "", width: "25px", iconClass: "fa fa-times", htmlAttributes: { title: "Delete" } }, { name: "edit", text: "", width: "25px", iconClass: "fa fa-edit", attributes: { title: "Edit" } }], width: "10px", attributes: { style: "padding:0" }}
		],
		edit: function (e) {
			var commandCell = e.container.find("td:last");
			commandCell.html('<div><a title="Save" class="btn k-grid-update fa fa-check"></a><a title="Cancel" class="btn k-grid-cancel fa fa-close"></a></div>');
		},
		dataBound: function (e) {
			var grid = e.sender;
			var gridData = grid.dataSource.view();
			for (var i = 0; i < gridData.length; i++) {
				var currentUid = gridData[i].uid;
				var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
				//$(currentRow).find(".k-grid-edit").attr("title", "Edit");
				//$(currentRow).find(".k-grid-delete").attr("title", "Delete");
				
			}
		},
	});
	
	that.showFancyBox();

	
	} else {
		$("#priceBreakCell" + id).toggle();
	}
	$("#priceBreakDiv" + id).kendoTooltip({
		filter: ".k-grid-edit",
		content: "Edit"
	});
	$("#priceBreakDiv" + id).kendoTooltip({
		filter: ".k-grid-delete",
		content: "Delete"
	});
};

UpdatePrices.prototype.typeDropDownEditor = function (container, options) {
	$('<input required name="' + options.field + '"/>')
		.appendTo(container)
		.kendoDropDownList({
			autoBind: false,
			dataTextField: "text",
			dataValueField: "value",
			dataSource: [{ value: "$", text: "$" }, { value: "%", text: "%" }],
		}).data("kendoDropDownList").value(options.model.TypeString);
}

UpdatePrices.prototype.NumericEditor = function (container, options) {
	var min = "0.0001";
	var step = "0.0001";
	if (options.field == "Quantity"){
		min = "1";
		step = "1";
	}
	$(container).append('<input required type="number" min="' + min + '" style="width:75%" step="' + step + '" class="numericText textr" name="' + options.field + '"></input>');
}