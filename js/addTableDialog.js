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
	
	// Rename the jsplumb table and re-lable it
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
		table = new Table();
		table.name = tableName;
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
	
	//remove old endpoints
	window.oldrefs = {};
	if (editMode == 'edit') {
		jsPlumb.detachAllConnections($('#tbl' + table.name + " .table"));
		window.oldrefs = {};
		$.each(tables[table.name].fields, function(k,v) {
			//preserve existing relations
			window.oldrefs[v.name] = {};
			window.oldrefs[v.name]['foreign'] = v.foreign;
			window.oldrefs[v.name]['ref'] = v.ref;
			console.log('oldref backing up',v.name,v.foreign,v.ref);
			
			//console.log(v.ep);
			//elist1 = jsPlumb.selectEndpoints({target:$("#tbl" + tsa[0] +  " div[ffname='" + tsa[0] + "." + tsa[1] +  "']")});
			
			//jsPlumb.deleteEndpoint(v.ep);
			//console.log('deleted ep for',v.name);
		});
		jsPlumb.empty($('#tbl' + table.name + " .table"));
	}
	
	table.fields={};
	//First update the data model!
	$('.fieldRow').each(function(index) {
		var isPrimary = Boolean($(this).find(".hfieldPrimary").text());
		var isUnique  = Boolean($(this).find(".hfieldUnique").text());
		var isNotNull = Boolean($(this).find(".hfieldNotNull").text());
		var defaultValue = $(this).find(".hfieldDefaultValue").text();
		console.log($(this).find(".fieldName").text(), 'primary: ' + $(this).find(".hfieldPrimary").text());
		console.log($(this).find(".fieldName").text(), 'unique: ' + $(this).find(".hfieldUnique").text());
		console.log("DATA_TYPE",$(this).find(".fieldType").val());
		
		table.fields[$(this).find(".fieldName").text()] = new Field({ 
			name: $(this).find(".fieldName").text(),
			type: $(this).find(".fieldType").text(),
			size: $(this).find(".hfieldSize").text(),
			primaryKey: isPrimary,
			unique: isUnique,
			notNull: isNotNull,
			defaultValue:  (defaultValue=="" ? null : defaultValue)
			});
	});
	
	tables[table.name] = table;
	$("#addTableDialog").modal('hide');
	
	//Now Build the new panel!
	createThePanel(table, editMode, function() {saveCanvasState()});
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
	var html = "<tr class='fieldRow' id='" + $("#fieldName").val() + "'>";
	html += "<td class='fieldName'>" + $("#fieldName").val() + "</td>";
	html += "<td class='fieldType'>" + $("#fieldType").val() + "</td>";
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
	$("#fieldName").val("");
	$("#fieldSize").val("");
	$('#fieldSize').removeAttr('disabled');
	$('#fieldType').val("Text");
	$('#fieldDefault').val('');
	$('#fieldPrimary').removeAttr("checked");
	$('#fieldUnique').removeAttr("checked");
	$('#fieldNotNull').removeAttr("checked");

	$("#fieldName").focus();
}

function tryToDelete(fieldName) {

	var tname = $('#tableName').val();
	var existing = tables[tname].fields[fieldName];

	if (existing!=undefined && existing.foreign != null) {
		bspopup("This key is acting as a primary key in a relation. Please delete that relation first.");
		return;
	}
	else if (existing!=undefined && existing.ref != null) {
		bspopup("This key is acting as a foreign key in a relation. Please delete that relation first.");
		return;
	}

	$('#' + fieldName).remove();
}