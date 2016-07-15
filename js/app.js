// Copyright (C) 2016  Prahlad Yeri
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
/**
* Custom Javascript functions.
* 
* @author Prahlad Yeri
* @date 2015/06/16
*/
var version = "1.0.6"; //TODO: Remember to automate this.

if (window.location.href.indexOf('127.0.0.1:') >=0 ) {
	window.DEBUG = true;
}
else {
	window.DEBUG  = false;
}

var tableTemplate = "";

$(window).load(function() {
	
	//Objects Initialization
	tables = {}; //dict of String:Table objects
	
	jsPlumb.importDefaults({
		Endpoint: ["Rectangle", {width:14, height:14}] ,
		Endpoints : [ [ "Rectangle" ], [ "Rectangle" ] ],
		Connector: "Bezier",//Flowchart, Straight, Bezier
		MaxConnections : -1,
		PaintStyle: {strokeStyle: "rgba(50,50,50,1)", lineWidth:2.5},
		HoverPaintStyle: { lineWidth:4},
        EndpointHoverStyle: { fillStyle:"red" }, 
    });
	
	var testField = new Field();
	testField.name = "MyNameIs";
	testField.updateFromObject("dsfs");
	
	jsPlumb.setContainer("theCanvas");
	
	//check local storage, if any build the tables.
	$("#holder").load("assets/partials/addTableDialog.html", function(){
	});
	
	// Load table template
	$.get("assets/partials/table.html", function(data) {
		tableTemplate = data;
		
		// Finish loading canvas - this step is important!
		loadCanvasFromLocalStorage();
	});
	
	// Write the year in the footer (for copyright)
	$(".footer #theyear").text((new Date()).getFullYear());
	
	// Display an initial popup with helpful information the first time the user loads this page
	if (readCookie(".mainAlert.closed") != "true") 
	{
		bshelp();;
		createCookie(".mainAlert.closed", "true");
	}
});

function loadCanvasFromLocalStorage() {
	// Use local storage (if it exists) to load the canvas from the user's last session
	if (window.localStorage) {
		if (localStorage.getItem("strTables") != null) {
			json = localStorage.getItem("strTables");
			loadCanvasState(json);
		}
	}
}

/* jsPlumb events */
jsPlumb.bind("beforeDrop", function(info) {

	//check if a connection already exists between these two points
	var con=jsPlumb.getConnections({source:info.sourceId, target:info.targetId});

	if (con.length>0) {
		console.log("This Connection already exists, detaching old one.");
		jsPlumb.detach(con[0]);
	}

	var pkey = $(info.connection.source).attr('fpname').split(".");
	var fkey = $(info.connection.target).attr('ffname').split(".");
	console.log('BEFORE_DROP', pkey, fkey);
	if (pkey[0] == fkey[0] && pkey[1] == fkey[1]) {
		bspopup("A field cannot have a reference to itself.");
		return false;
	}

	tables[pkey[0]].fields[pkey[1]].foreign = fkey[0] + '.' + fkey[1];
	tables[fkey[0]].fields[fkey[1]].ref = pkey[0] + '.' + pkey[1];
	bsalert({text: pkey[1] + '->' + fkey[1], title:"Established: "});

	saveCanvasState();
	
	return true; //return false or just quit to drop the new connection.
});

jsPlumb.bind("connectionDetached", function(info, originalEvent) {
	console.log(info.source, info.target);

	if ($(info.source).attr('fpname') == undefined || $(info.target).attr('ffname')==undefined)
		return;
	var pkey = $(info.source).attr('fpname').split(".");
	var fkey = $(info.target).attr('ffname').split(".");

	tables[pkey[0]].fields[pkey[1]].foreign = null;
	tables[fkey[0]].fields[fkey[1]].ref = null;
	bsalert({text: pkey[1] + '->' + fkey[1], title:"Detached: "});

	saveCanvasState();
})

/**
* Creates a new panel from scratch for a table
* @param mode Should be 'add' or 'edit'
*/
function createThePanel(table, mode, func) {
	if (mode == "add") {
		$('.canvas').append(tableTemplate.format({table: table.name}));
	}

	setThePanel(table, mode);
	if (func) func();
}

function setThePanel(table, mode) {
	
	var tableID = '#tbl' + table.name;
	
	// If editing an existing table, delete all existing rows from the table
    if (mode=='edit') {
        $(tableID + " .table tr").remove();
    }

    //Now lets build the new panel
    $.each(table.fields, function(fieldName, field) {
		var html = '';
		
		// Setup details field for this row
		var details = [];
		if (field.primaryKey) details.push('primary');
		if (field.unique) details.push('unique');
		if (field.notNull) details.push('not null');
		var tattr = details.join(',');

		html =	"<tr>" +
				"<td style='vertical-align: middle;'>" +
					"<div ffname='" + table.name + "." + field.name +  "' class='field'></div>" + 
				"</td>" + //virtual
				"<td>" + field.name + "</td>" +
				"<td>" + field.type.replace("=True","") + (field.size>0 ? '(' + field.size + ')' : '') + "</td>" +
				"<td>" + (tattr == "" ? "---" : tattr) + "</td>" +
				"<td style='vertical-align: middle;'>" + 
					(field.primaryKey ? "<div fpname='"  + table.name + "." + field.name +   "' class='prima'></div>" : '') +  //virtual
				"</td>" +
				"</tr>";

		$(tableID + " .table").append(html);

		var ep;
		if (field.primaryKey) {
			ep = jsPlumb.addEndpoint($('#tbl' + table.name + " [fpname='" + table.name + "." +  field.name + "']"), {
				isSource: true,
				anchor: "Right",
				endpoint: ["Rectangle",{width:15, height:15}], //Dot
				paintStyle: {fillStyle:"orange", outlineColor:"black", outlineWidth:1 },
				connectorOverlays: [ 
					[ "Arrow", { width:10, height:10, location:1, id:"arrow",
								events:{
									click: function(){
										//bspopup("Don't click on the connecting arrows. Click on the dots (endpoints) instead to drag.");
									},
								}
					}],
				],
			});
		}
		
		ep = jsPlumb.addEndpoint($(tableID + " [ffname='" + table.name + "." +  field.name + "']"), {
			isTarget: true,
			anchor: "Left",
			endpoint: ["Rectangle", {width:15, height:15}], //Rectangle
			paintStyle: {  fillStyle:"blue", outlineColor:"black", outlineWidth:1},
		});
				
		jsPlumb.draggable('tbl' + table.name, {
		   containment:true,
		   stop: function(event, ui) {
				console.log(event.pos[0], event.pos[1]);
				tables[table.name].position.x = event.pos[0] + 'px';
				tables[table.name].position.y = event.pos[1] + 'px';
				saveCanvasState();
		   }
		});
    });


	// If editing, ensure all connections get re-created
    if (mode=='edit') {
		createAllConnections(tables);
    }

    if (mode=='add') {
		if (window.lastPos == undefined) {
			window.lastPos = {'x':0, 'y':0};
		}

		var maxX = $(".canvas").width() - $('#tbl' + table.name).width() ;
		var maxY = $(".canvas").height() - $('#tbl' + table.name).height();
		if (table.position.x==0 && table.position.y==0) {
				table.position.x = (Math.random() * maxX) + 'px';
				table.position.y = (Math.random() * maxY) + 'px';
		}
		$('#tbl' + table.name).css({
			left: table.position.x,
			top: table.position.y
		});

		if (window.lastPos.x >= $('.container').offset().left + $('.container').offset().width) {
			window.lastPos.x = 0;
		}
		else {
			window.lastPos.x += $('#tbl' + table.name).width() + 20;
		}
		window.lastPos.y += $('#tbl' + table.name).position().top;

		bsalert({text:table.name+"added!", type:'success'});
    }
    else 
    {
		bsalert({text:"Table updated!", type:'success'});
    }
}

/**
* @brief Save current canvas state to local store
*/
function saveCanvasState() {

	console.log("Saving canvas state...")

	var json = null;
	if (window.localStorage) {
		json = JSON.stringify(tables);
		window.localStorage.setItem("strTables", json);
	}

	return json;
}

function loadCanvasState(json) {
	try {
		// Clear canvas and create new table to start from a blank slate
		clearCanvas();
		tables  = new Object();
		
		// Temporarily suspend drawing to speed up load time
		jsPlumb.setSuspendDrawing(true);
	
		// Parse input JSON to restore tables that were saved previously
		var ttables = JSON.parse(json);

		//import the table structures
		$.each(ttables, function(k,v) {
			console.log('PROCESSING: ' + k);
			tables[k] = new Table(v.name);
			tables[k].fields = {};
			tables[k].position = v.position;
			$.each(v.fields, function(kk,vv) {
				tables[k].fields[kk] = new Field(vv);
				tables[k].fields[kk].foreign = (vv.foreign ? vv.foreign : null);
				tables[k].fields[kk].ref = (vv.ref ? vv.ref : null);
			});
		});
			
		// Create the panels
		$.each(tables, function(tableName,table) {
			createThePanel(table, 'add', function() {});
		});
		
		// Create the connections
		createAllConnections(tables);
	
	} finally {
		jsPlumb.setSuspendDrawing(false, true);
	}
}

function createAllConnections(tables) {
	//now create the relations after all panels are done.
	$.each(tables, function(tableName,table) {
		window.oldrefs = {};
		$.each(table.fields, function(fieldName,field) {
			// check incoming
			if (field.ref != null) {
				tsa = field.ref.split('.');
				connectEndpoints(tsa[0],tsa[1],tableName,fieldName);
			}
		});
	});
}

// Connect two fields on the canvas with arrows 
function connectEndpoints(primaryTableName, primaryFieldName, foreignTableName, foreignKeyName) {
	// Get the primary key field endpoint
	var el1 = null;
	elist1 = jsPlumb.selectEndpoints({source:$("#tbl" + primaryTableName +  " div[fpname='" + primaryTableName + "." + primaryFieldName +  "']")});
	elist1.each(function(key){el1=key});
	
	// Get the foreign key field enpoint
	var el2 = null;
	elist2 = jsPlumb.selectEndpoints({target:$("#tbl" + foreignTableName +  " div[ffname='" + foreignTableName + "." + foreignKeyName +  "']")});
	elist2.each(function(key){el2=key});
	
	// Connect primary to foreign key
	jsPlumb.connect({source:el1, target:el2});
}

function clearCanvas() {
	jsPlumb.detachEveryConnection();
	jsPlumb.remove($(".tableDesign"));
	jsPlumb.empty($(".canvas"));
}

function eraseCanvasState() {
	
	if (confirm("All your tables will be erased so you can start over. Is this OK?")) {

		// Clear out the copy stored in local storage
		if (window.localStorage) {
			window.localStorage.removeItem("strTables");
		}
		
		// Erase tables from the canvas
		clearCanvas();
		
		// Clear local tables object
		tables={}; 
	}
}


function showResultsDialog() {
	if (!window.DEBUG && Object.keys(tables).length==0) {
		bspopup("There should be at least one table");
		return;
	}
	
	if ($("#resultsDialog").length==0) {
		console.log('not found in cache');
		$("#holderResults").load("assets/partials/resultsDialog.html?time=" + (new Date()).getTime(), function(){
			$('#resultsDialog').on('shown.bs.modal', function(e) {
				prettyPrint();
			});
		});
	}
	
	runResultsDialog();
}

function runResultsDialog() {
	bspopup({
		type:"radiolist", text:"Select output format", list: Object.keys(codeGenerators),
		success: function(ev){
			var outputType = ev.value;
			generateCode(outputType);
		}
	});
}

function showResults(code) {
	$("#resultsDialog #theCode").empty();
	$("#resultsDialog #theCode").append('<pre class="prettyprint"></pre>');
	$("#resultsDialog #theCode pre").text(code);
	$("#resultsDialog").modal();
}

function showAddTableDialog() {

	if ($("#addTableDialog").length==0) {
		$("#holder").load("assets/partials/addTableDialog.html?time=" + (new Date()).getTime(), function(){
			runAddTableDialog("", "add");
		});
	}
	else {
		runAddTableDialog("", "add");
	}
}

function runAddTableDialog(tableName, mode) 
{
	$("#addTableDialog #tableName").val(tableName);
	$("#addTableDialog #originalTableName").val(tableName);
	$("#addTableDialog #editMode").val(mode);
	$("#addTableDialog .fieldRow").remove();
	if (mode=='edit') {
		$.each(tables[tableName].fields, function(key, val){
			
			// Load the field values into the dialog
			$("#fieldName").val(val.name);
			$("#fieldType").val(val.type);
			$("#fieldSize").val(val.size);
			$("#fieldDefault").val(val.defaultValue);
			$("#fieldPrimary").prop("checked", val.primaryKey);
			$("#fieldUnique").prop("checked", val.unique);
			$("#fieldNotNull").prop("checked", val.notNull);

			// Add row to the table inside the addTableDialog.html
			addField();
		});
	}
	//TODO: [LATER]This routine should be written each time before showing a bootstrap modal:
	$(".modal").on('shown.bs.modal', function() {
		$(this).find("[autofocus]:first").focus();
	});
	
	$("#addTableDialog").modal();
}

function editTable(tableName) {
	runAddTableDialog(tableName, "edit");
}

function deleteTable(tableName) {
	if (confirm("Sure you want to delete this table along with all it's relations?")) {
		delete tables[tableName];
		jsPlumb.empty("tbl" + tableName);
		$("#tbl" + tableName).remove();
		saveCanvasState();
	}
}

function importCanvas() {
	console.log('IMPORT_CANVAS');
	var file = $('#inputCanvasFile')[0].files[0];

	fr = new FileReader();
	fr.readAsText(file);
	fr.onload = function(ev) {
		console.log(ev.target.result);
		json = ev.target.result;
		loadCanvasState(json);
	}
	fr.onerror = function (ev) {
        console.log("error reading file");
    }
	$("#inputCanvasFile").val("");
};

function exportCanvas() {
	if (Object.keys(tables).length == 0) {
		bsalert({text:'No tables to export.'});
		return;
	}
	downloadSomeText(saveCanvasState(), 'canvas.json');
}

