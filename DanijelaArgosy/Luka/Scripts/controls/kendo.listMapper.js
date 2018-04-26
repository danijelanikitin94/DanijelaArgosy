(function ($) {
	// shorten references to variables. this is better for uglification
	var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var ListMapper = Widget.extend({
        init: function (element, options) {
	        var that = this;
            // base call to initialize widget
	        Widget.fn.init.call(this, element, options);
            // this is a hack because the array wasn't replacing all the items in the defaults.
            // if you passed 10 items than Country would still be in the list.
            if (options.sourceColumns != null) {
                that.options.sourceColumns = options.sourceColumns;
            }
            var controlLoader = new ControlLoader();
        	controlLoader.loadTemplate("ListMapper", function (template) {
        		$(document.body).append(template);
        		that._initialize();
        	});
        },
        options: {
            name: "ListMapper",
            sourceColumns: [
				"First Name",
				"Last Name",
				"Address",
				"City",
				"State",
				"ZIP Code",
				"Middle Initial",
				"Company",
				"Email",
				"Hobbies",
				"Country"
            ],
            ignoreColumns: ["_____UID_____", "Updated_Address", "IsValid", "MD5", "Count", "Duplicate"],
            destinationColumns: [
                {
                    Name: "Full Name",
                    ColumnName: "Full Name",
                    Description: "(First, M. Last Name)",
                    Required: true,
                    Hint: [
						"First Name",
						"Last Name",
						"Middle Name",
						"Middle Initial",
						"Middle",
                        "first_name",
                        "last_name",
                        "st_contact",
                        "Fullname"
                    ],
                },
                {
                    Name: "Company",
                    ColumnName: "Company",
                    Description: "",
                    Required: false,
                    Hint: [
                        "st_company",
                        "Company"
                    ]
                },
                {
                    Name: "Email",
                    ColumnName: "Email",
                    Description: "",
                    Required: false,
                    Hint: [
						"email",
                        "st_email"
                    ],
                },
                {
                    Name: "Address 1",
                    ColumnName: "Address 1",
                    Description: "",
                    Required: true,
                    Hint: [
						"Address",
						"st_Address1",
						"st_Address",
                        "Street_Number",
                        "Street_Name",
                        "street",
                        "Address1",
                        "Address_1"
                    ],
                },
                {
                    Name: "Address 2",
                    ColumnName: "Address 2",
                    Description: "",
                    Required: false,
                    Hint: [
						"Address2",
						"st_Address2",
                        "Street_Number2",
                        "Street_Name2",
                        "street2",
                        "Address_2"
                    ],
                },
                {
                    Name: "Address 3",
                    ColumnName: "Address 3",
                    Description: "",
                    Required: false,
                    Hint: [
						"Address3",
						"st_Address3",
                        "Street_Number3",
                        "Street_Name3",
                        "street3",
                        "Address_3"
                    ],
                },
                {
                    Name: "City",
                    ColumnName: "City",
                    Description: "",
                    Required: true,
                    Hint: [
						"City",
                        "st_city"
                    ]
                },
                {
                    Name: "State",
                    ColumnName: "State",
                    Description: "",
                    Required: true,
                    Hint: [
						"State",
						"St",
                        "st_state"
                    ],
                },
                {
                    Name: "ZIP Code",
                    ColumnName: "ZIP Code",
                    Description: "",
                    Required: true,
                    Hint: [
						"Zip",
						"Postal Code",
						"Postal",
                        "st_zip",
                        "st_zipcode",
                        "Zip_Code"
                    ],
                },
            ],
			templates: {
				placeholder: "<li class='list-item' id='placeholder'>~{DropHere}~</li>",
				contentHref: "#_ListMapperTemplate"
			}
        },
        value: function (data) {
            var that = this;
            if (data == null) {
                return that.options.destinationColumns;
            } else {
                that.options.destinationColumns = data;
            }
        },
        isValid: function () {
            var that = this;
            var isValid = true;
            $(that.options.destinationColumns).each(function(e) {
                if (this.Required && (this.SourceColumns == null || this.SourceColumns.length <= 0)) {
                    isValid = false;
                }
            });
            if (!isValid) {
                prompt.alert({
                    question: "~{AllRequiredColumnsMustBeMapped}~",
                    type: "warning"
                });
            }
            return isValid;
        },
        getUnmappedColumns: function (updateMappings) {
        	var that = this;
        	var unmappedColumns = [];
            updateMappings = (updateMappings == null ? true : false);
            $(that.options.sourceColumns).each(function (i) {
            	var sourceColumn = that.options.sourceColumns[i];
                var mapped = false;
            	$(that.options.destinationColumns).each(function (i) {
            		var destinationColumn = this;
            		if (destinationColumn.SourceColumns == null && updateMappings) {
		                destinationColumn.SourceColumns = [];
            		}
					if (destinationColumn.Id == null) {
						destinationColumn.Id = kendo.guid().replace(/[-]/g, '');
					}
					if (that.isAutoMapped(destinationColumn.Name, sourceColumn, destinationColumn.Hint)) {
					    mapped = true;
					    if (updateMappings) {
					        destinationColumn.SourceColumns.push(sourceColumn);
					    }
					}
            	});
            	var isIgnoredColumn = $.grep(that.options.ignoreColumns, function (columnName) {
            	    return columnName.toLowerCase() === sourceColumn.toLowerCase();
            	});
            	if (!mapped && isIgnoredColumn.length === 0) {
				    unmappedColumns.push(sourceColumn);
				}
            });
            return unmappedColumns;
        },
        isAutoMapped: function (destinationColumn, sourceColumn, hints) {
            var mapped = destinationColumn.Name === sourceColumn;
            if (hints != null && !mapped) {
                $(hints).each(function (i, col) {
                    if (sourceColumn.toLowerCase() == col.toLowerCase()) {
                        mapped = true;
                    } 
                });
            }
            return mapped;
        },
        addColumn: function (destination, source, index) {
        	var that = this;
        	$(that.options.destinationColumns).each(function (i) {
				if (this.Name === destination) {
				    this.SourceColumns.splice(index, 0, source);
				}
	        });
        },
        removeColumn: function (destination, source) {
        	var that = this;
        	$(that.options.destinationColumns).each(function (i) {
        		if (this.Name === destination) {
        			var index = $.inArray(source, this.SourceColumns);
        			this.SourceColumns.splice(index, 1);
        		}
        	});
        },
	    updateDestinationColumns: function(e) {
	        var that = this,
	            destination = e.sender.element.attr("data-value"),
				source = e.item.text(),
				newIndex = e.newIndex,
				oldIndex = e.oldIndex;
	        switch (e.action) {
	        	case "receive":
	        		that.addColumn(destination, source, newIndex);
	        		break;
				case "remove":
					that.removeColumn(destination, source);
					break;
	        }
	    },
        _initialize: function () {
        	var that = this;
        	that.element.append(that._buildContent());
        	that._configureSortable();
        },
        _buildContent: function () {
        	var that = this;
        	var html = $(that.options.templates.contentHref).html();
            var data = {
                destinationColumns: that.options.destinationColumns,
                unmappedColumns: that.getUnmappedColumns(),
            }
            return kendo.Template.compile(html)(data);
        },
        _configureSortable: function () {
        	var that = this;
        	var connectWith = that._generateConnectWith();
        	$(that.options.destinationColumns).each(function (e) {
        		$("#sortable-list_" + this.Id).kendoSortable({
        			connectWith: connectWith,
        			placeholder: that.options.templates.placeholder,
					change: function(e) {
					    that.updateDestinationColumns(e);
					}
        		});
        	});
        	$("#sortable-list_Unmapped").kendoSortable({
        		connectWith: connectWith,
        		placeholder: that.options.templates.placeholder,
        		change: function (e) {
        			that.updateDestinationColumns(e);
        		}
        	});
        },
        _generateConnectWith: function () {
        	var that = this;
        	var connectWith = "";
        	$(that.options.destinationColumns).each(function (i) {
        		connectWith += "#sortable-list_" + this.Id + ", ";
        	});
        	connectWith += "#sortable-list_Unmapped";
            return connectWith;
        },

        _createHiddenInput: function() {
            var that = this;
            var input = $("<input />",
            {
                type: "hidden",
                id: that.options.inputId,
                name: that.options.inputId.replace('_', '.')
            });
            return input;
        },
    });
	ui.plugin(ListMapper);
})(jQuery);