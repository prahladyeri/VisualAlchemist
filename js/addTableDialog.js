function validateTableName(tableName,originalTableName) {
	if (tableName==null || tableName.trim() == '') {
		bspopup("You must enter a table name.");
		return false;
	}
	else if (tableName.indexOf(" ")>=0) {
		bspopup("Spaces are not allowed in the table name.");
		return false;
	}
	else if (originalTableName != tableName && tables[tableName] != undefined) {
		bspopup('This table already exists.');
		return false;
	} else {
		return true;
	}
}

function renameTable(tableName,originalName) {
	table = tables[originalName];
	
	// Remove the table under its original name and add it under new name
	delete tables[originalName];
	table.name = tableName;
	tables[tableName] = table;
	
	// Rename the jsplumb table and re-label it
	var tablePanel = $('#tbl' + originalName)
	tablePanel.prop('id', '#tbl'+table.name);
	var labelSpan = $('[data-table-label="'+originalName+'"]')
	labelSpan.html(tableName);
	labelSpan.prop('data-table-label',tableName);
	
	// Replace the edit and delete button events to use the new table name
	var deleteBtn = tablePanel.find('[title="Delete"]');
	deleteBtn.attr('onclick','editTable("'+tableName+'")');
	var editBtn = tablePanel.find('[title="Edit"]');
	editBtn.attr('onclick','editTable("'+tableName+'")');
}

function saveData() {
	var tableName = $('#tableName').val();
	var originalName = $('#originalTableName').val();
	var editMode = $('#editMode').val()
	
	if (!validateTableName(tableName,originalName)) {
		return;
	}

	if ($('.fieldRow').length==0) {
		bspopup('You must add at least one field.');
		return;
	}
	
	var table;
	if (editMode == "add") {
		if (tables[tableName] != undefined){
			bspopup('This table already exists.');
			return;
		}
		table = new Table(tableName);
	}
	else if (editMode == "edit") {
		if (tableName != originalName) {
			if (tables[tableName] != undefined) {
				bspopup('This table already exists.');
				return;
			} else {
				renameTable(tableName,originalName);
				table = tables[tableName];
			}
		} else {
			// No change to the table name, keep using same object in same location
			table = tables[tableName];
		}
	}
	else {
		alert("Unexpected value!");
		return;
	}
	
	var fieldNames = {};
	
	// Update the data model
	$('.fieldRow').each(function(index) {
		
		var fieldName = $(this).find(".fieldName").text();
		fieldNames[fieldName] = true;
		
		var fieldData = {
			primaryKey: Boolean($(this).find(".hfieldPrimary").text()),
			unique: Boolean($(this).find(".hfieldUnique").text()),
			notNull: Boolean($(this).find(".hfieldNotNull").text()),
			defaultValue: $(this).find(".hfieldDefaultValue").text(),
			type: $(this).find(".fieldType").text(),
			name: fieldName,
			size: $(this).find(".hfieldSize").text()
		}
		
		if (fieldData.defaultValue == "") fieldData.defaultValue = null;
		
		// Get existing field if it already exists
		var field;
		if (fieldName in table.fields) {
			field = table.fields[fieldName];
			field.updateFromObject(fieldData);
			
		// else create new instance of Field
		} else {
			table.fields[fieldName] = new Field(fieldData);
		}
	});
	
	// Remove any fields that have been deleted (and therefore aren't in fieldNames)
	$.each(table.fields, function(fieldName, field) {
		if (!(fieldName in fieldNames)) {
			if (field.pkEndpoint != null) jsPlumb.deleteEndpoint(field.pkEndpoint);
			if (field.fkEndpoint != null) jsPlumb.deleteEndpoint(field.fkEndpoint);
			delete table.fields[fieldName];
		}
	});
	
	if (originalName.length > 0) 
		delete tables[originalName];
	
	tables[table.name] = table;
	$("#addTableDialog").modal('hide');
	
	//Now Build the new panel!
	createThePanel(table, editMode, saveCanvasState);
}

// Join two strings with a separator in between
function joinWithSep(a, b, separator) {
	if (a.length == 0) {
		return b;
	} else {
		return a + separator + b;
	}
}

/**
* Creates a new field from the input boxes and adds to the display.
*/
function addField()
{
	if ($("#fieldSize").val() =="" || $("#fieldSize").attr('disabled')) $("#fieldSize").val(0);
	var sizeValid = parseInt($("#fieldSize").val()) >= 0;
	if ($("#fieldName").val().trim() == "") {
		bspopup("Field name cannot be blank.");
		return;
	}
	else if ($('#fieldName').val().indexOf(" ")>=0) {
		bspopup("Field name cannot contain a special character or space.");
		return;
	}
	else if (!sizeValid) {
		bspopup("Not a valid size.");
		return;
	}
	else if ($("#" + $("#fieldName").val()).length >0) {
		bspopup("A field with this name already exists.");
		return;
	}
	var html =	"<tr class='fieldRow' id='" + $("#fieldName").val() + "'>" +
				"<td class='fieldName'>" + $("#fieldName").val() + "</td>" +
				"<td class='fieldType'>" + $("#fieldType").val() + "</td>";
				
	var size = $("#fieldSize").val();
	html += "<td class='fieldSize'>" + (size==0 ? "-" : size)  + "</td>";
	
	var isPrimary = $("#fieldPrimary").is(':checked');
	var isUnique = $("#fieldUnique").is(':checked');
	var isNotNull = $("#fieldNotNull").is(':checked');
	var fieldDefault = $("#fieldDefault").val();
	
	// Set details column value
	var details  = (isPrimary ? "primary" : "");
	if (isUnique) details = joinWithSep(details,"unique",",");
	if (isNotNull) details = joinWithSep(details,"not null",",");
	if (fieldDefault != "") {
		details = joinWithSep(details, fieldDefault, ',');
	}
	
	html += "<td class='fieldDetails'>" + details  + "</td>";
	html += "<td class='hidden hfieldSize'>" + size  + "</td>";
	html += "<td class='hidden hfieldDefaultValue'>" + $("#fieldDefault").val()  + "</td>";
	html += "<td class='hidden hfieldPrimary'>" + (isPrimary ? 'true' : '')  + "</td>";
	html += "<td class='hidden hfieldUnique'>" + (isUnique ? 'true' : '')  + "</td>";
	html += "<td class='hidden hfieldNotNull'>" + (isNotNull ? 'true' : '')  + "</td>";
	html += "<td class='delete'><button onclick='tryToDelete(\"" + $("#fieldName").val() + "\")' title='Delete Field' class='btn btn-xs btn-danger'><span class='glyphicon glyphicon-remove'></span></button></td>";
	html += "</tr>";
	
	$("#fields").append(html);
	resetNewFieldBoxes();
	$("#fieldName").focus();
}

function resetNewFieldBoxes() {
	$("#fieldName").val("");
	$("#fieldSize").val("");
	$('#fieldSize').removeAttr('disabled');
	$('#fieldType').val("Text");
	$('#fieldDefault').val('');
	$('#fieldPrimary').removeAttr("checked");
	$('#fieldUnique').removeAttr("checked");
	$('#fieldNotNull').removeAttr("checked");
}

function tryToDelete(fieldName) {

	// Look at original table name.
	var tname = $('#originalTableName').val();
	
	// If this table isn't new, check for referencers
	if (tables[tname] != undefined) {
	
		var field = tables[tname].fields[fieldName];
		if (field != undefined) {
			if (field.referencers(tname).length > 0) {
				bspopup("This key is acting as a primary key in a relation. Please delete the relation(s) first.");
				return;
			}
			else if (field.ref != null) {
				bspopup("This key is acting as a foreign key in a relation. Please delete that relation first.");
				return;
			}
		}
	}
	
	$('#' + fieldName).remove();
}