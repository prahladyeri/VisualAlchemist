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
var stringTypes = ["Text"];

if (window.location.href.indexOf('127.0.0.1:') >=0 ) {
	window.DEBUG = true;
}
else {
	window.DEBUG  = false;
}

$(window).load(function() {
	//if (!window.DEBUG) {
		//$("#lnkHelp").click();
		//if (readCookie(".mainAlert.closed") != null) {
		console.log("readCookie::", readCookie(".mainAlert.closed"));
		if (readCookie(".mainAlert.closed") != "true") 
		{
			bshelp();
			console.log("CALLED");
			createCookie(".mainAlert.closed", "true");
		}
	
	//Objects Initialization
	tables = {}; //dict of String:Table objects
	
	//EndpointHoverStyle: {color: "blue"},
	jsPlumb.importDefaults({
		Endpoint: ["Rectangle", {width:14, height:14}] ,
		Endpoints : [ [ "Rectangle" ], [ "Rectangle" ] ],
		Connector: "Bezier",//Flowchart, Straight, Bezier
		MaxConnections : 5,
		PaintStyle: {strokeStyle: "rgba(50,50,50,1)", lineWidth:2.5},
		HoverPaintStyle: { lineWidth:4,
			//strokeStyle: 'rgba(255,255,255,1)'
		},
            EndpointHoverStyle: { fillStyle:"red" }, 
    });
	
	jsPlumb.setContainer("theCanvas");
	console.log('jsPlumb.getContainer():', jsPlumb.getContainer());
	
	
	//check local storage, if any build the tables.
	$("#holder").load("assets/partials/addTableDialog.html?time=" + (new Date()).getTime(), function(){
		//runAddTableDialog(tableName, "add");
	});
	
	loadCanvasState(null);
	
	$(".footer #theyear").text((new Date()).getFullYear());
});

/* jsPlumb events */
jsPlumb.bind("beforeDrop", function(info) {
	console.log("jsPlumb.beforeDrop");
	//check if a connection already exists between these two points
	console.log(info.sourceId, info.targetId);
	var con=jsPlumb.getConnections({source:info.sourceId, target:info.targetId});
	//console.log(con);
	if (con.length>0) {
		console.log("This Connection already exists, detaching old one.");
		jsPlumb.detach(con[0]);
		//return false;
	}
	//
	var pkey = $(info.connection.source).attr('fpname').split(".");
	var fkey = $(info.connection.target).attr('ffname').split(".");
	console.log('BEFORE_DROP', pkey, fkey);
	if (pkey[0] == fkey[0]) {
		alert("Source and Target table cannot be the same");
		return false;
	}
	//console.log(pkey, fkey);
	tables[pkey[0]].fields[pkey[1]].foreign = fkey[0] + '.' + fkey[1];
	tables[fkey[0]].fields[fkey[1]].ref = pkey[0] + '.' + pkey[1];
	bsalert({text: pkey[1] + '->' + fkey[1], title:"Established: "});
	//window.tobj = info;
	console.log("repainted");
	saveCanvasState();
	
	return true; //return false or just quit to drop the new connection.
});

/*jsPlumb.bind("connection", function(info) {
	//console.log(info);
	//window.tobj = info;
});*/

jsPlumb.bind("connectionDetached", function(info, originalEvent) {
	console.log(info.source, info.target);
	//return;
	if ($(info.source).attr('fpname') == undefined || $(info.target).attr('ffname')==undefined)
		return;
	var pkey = $(info.source).attr('fpname').split(".");
	var fkey = $(info.target).attr('ffname').split(".");
	console.log('DETACHED', pkey, fkey);
	tables[pkey[0]].fields[pkey[1]].foreign = null;
	tables[fkey[0]].fields[fkey[1]].ref = null;
	bsalert({text: pkey[1] + '->' + fkey[1], title:"Detached: "});
	//bspopup({type:"text", text: pkey[1] + '><' + fkey[1], title:"Detached: "});
	saveCanvasState();
	//window.tobj = info;
})

//Other misc functions

/**
* Creates a new panel from scratch for a table
* @param mode Should be 'add' or 'edit'
*/
function createThePanel(table, mode, func) {
	if (mode == "add") {
		$.get("assets/partials/table.html?time=" + (new Date()).getTime(), function(data) {
			//console.log("DATA::",data);
			$('.canvas').append(data.format({table: table.name}));
			setThePanel(table, mode);
			if (func) func();
		});
	}
	else {
		setThePanel(table, mode);
		if (func) func();
	}
}

function setThePanel(table, mode) {
    if (mode=='edit') {
            /*jsPlumb.detachAllConnections($('#tbl' + table.name + " .table"));
            $.each(window.oldTable.fields, function(k,v) {
                    console.log(v.ep);
                    jsPlumb.deleteEndpoint(v.ep);
                    console.log('deleted ep for',v.name);
            });*/

            //jsPlumb.deleteEveryEndpoint();
            //jsPlumb.removeAllEndpoints($('#tbl' + table.name + " .table"));
            //jsPlumb.remove($('#tbl' + table.name + " .table tr"));
            //jsPlumb.removeAL

            //jsPlumb.empty($('#tbl' + table.name + " .table tbody"));
            /*while ($('#tbl' + table.name +  ' .table tr').length>0) 
            {
                    jsPlumb.deleteEndpoint($('#tbl' + table.name +  ' .table tr'));
            }*/
            $('#tbl' + table.name + " .table tr").remove();

            //jsPlumb.repaintEverything();
    }

    //Now lets build the new panel
    $.each(table.fields, function(key, field) {
            var html = '';
            var sprim = "";
            if (field.primaryKey) {
                    //sprim+= " style='cursor:move' ";
            }
            html += "<tr>";
            //if (mode=='add') 
            /*html += "<td>" + (field.primaryKey ? '' : "<div ffname='" + table.name + "." + field.name +  "' class='field'></div>") + "</td>"; //virtual*/
            html += "<td><div ffname='" + table.name + "." + field.name +  "' class='field'></div></td>"; //virtual
            html += "<td>" + field.name + "</td>";
            html += "<td>" + field.type.replace("=True","") + (field.size>0 ? '(' + field.size + ')' : '') + "</td>";
            var tattr = (field.primaryKey ? 'primary' : '') + (field.unique ? 'unique' : '');
            html += "<td>" + (tattr == "" ? "---" : tattr)  + "</td>";
            //if (mode=='add') 

            html += "<td>" + (field.primaryKey ? "<div fpname='"  + table.name + "." + field.name +   "' class='prima'></div>" : '') + "</td>"; //virtual
            //html += "<td><div " + (field.primaryKey ? "fpname='"  + table.name + "." + field.name +   "' class='prima'" : '') + "></div></td>"; //virtual
            html += "</tr>";
            //bspopup(html);
            console.log("HTML__", html);
            //
            $("#tbl" + table.name + " .table").append(html);
            //
            var ep;
            console.log("The anchor will be LEFT");
            if (field.primaryKey) {
                    //jsPlumb.addEndpoint($('#tbl' + table.name + " div.prima"), {
                    ep = jsPlumb.addEndpoint($('#tbl' + table.name + " [fpname='" + table.name + "." +  field.name + "']"), {
                            isSource: true,
                            //anchor:["Left"],
                            maxConnections:1,
                            anchor: "Right",
                            endpoint: ["Rectangle",{width:15, height:15}], //Dot
                            paintStyle: {fillStyle:"orange", outlineColor:"black", outlineWidth:1 },
                            //connectorPaintStyle:{ strokeStyle:"blue", lineWidth:10 },
                            connectorOverlays: [ 
                                    [ "Arrow", { width:10, height:10, location:1, id:"arrow",
                                            events:{
                                                click: function(){
                                                    //bspopup("Don't click on the connecting arrows. Click on the dots (endpoints) instead to drag.");
                                                },
                                            }
                                } ],
                                    //[ "Label", { label:"Relationship", id:"lblPrimary_" + table.name } ]
                                    ],
                    });
            }
            //else {
                    //jsPlumb.addEndpoint($('#tbl' + table.name + " div.field"), {isTarget: true,
                    ep = jsPlumb.addEndpoint($('#tbl' + table.name + " [ffname='" + table.name + "." +  field.name + "']"), {
                                    isTarget: true,
                                    anchor: "Left",
                                    endpoint: ["Rectangle", {width:15, height:15}], //Rectangle
                                    paintStyle: {  fillStyle:"blue", outlineColor:"black", outlineWidth:1},
                            });
            //}
            jsPlumb.draggable('tbl' + table.name, {
               containment:true,
                step: function () {
                    jsPlumb.repaintEverything();
                },
                drag:function(){
                    jsPlumb.repaintEverything();
                },
               stop: function(event, ui) {
                            console.log(event.pos[0], event.pos[1]);
                            tables[table.name].position.x = event.pos[0] + 'px';
                            tables[table.name].position.y = event.pos[1] + 'px';
                            saveCanvasState();
                            jsPlumb.repaintEverything();
               }
            });
            //field.ep  = ep; //TODO: [inprogress]This may no longer be required since we are not using ep anywhere.
            //
            //console.log('added field', field.name);
    });

    //jsPlumb.draggable($('#tbl' + table.name + " tr.prima"),{}); //containment:true
    console.log('#tbl' + table.name + " td.prima",'#tbl' + table.name + " td:not(.prima)");
     //if (mode=='add') 
    //if (mode=='add') 

    //TODO: [STABLE]Rebuild connections to/from this table by looping thru tables collection.
    if (mode=='edit') {
            $.each(window.oldrefs, function(key, val) {
                    console.log('rebuilding ',key,val);
                    if (val.foreign != null) {
                            //check outgoing
                            console.log('primary key found:',key, val.foreign);
                            table.fields[key].foreign = val.foreign; //restore the lost foreign
                            tsa = val.foreign.split('.');
                            tables[tsa[0]].fields[tsa[1]].ref = table.name + '.' + key; //restore the lost ref
                            elist1 = jsPlumb.selectEndpoints({target:$("#tbl" + tsa[0] +  " div[ffname='" + tsa[0] + "." + tsa[1] +  "']")});
                            elist2 = jsPlumb.selectEndpoints({source:$("#tbl" + table.name +  " [fpname='" + table.name + "." + key +  "']")});
                            //console.log(elist1.length, elist2.length);
                            var el1 = null;
                            var el2 = null;
                            elist1.each(function(key){el1=key});
                            elist2.each(function(key){el2=key});
                            jsPlumb.connect({target:el1, source:el2});
                    }
                    else if (val.ref != null) {
                            //check incoming
                            console.log('foreign key found:',key, val.ref);
                            table.fields[key].ref = val.ref; //restore the lost ref
                            tsa = val.ref.split('.');
                            tables[tsa[0]].fields[tsa[1]].foreign = table.name + '.' + key; //restore the lost foreign
                            console.log("#tbl" + tsa[0] +  " [fpname='" + tsa[0] + "." + tsa[1] +  "']");
                            elist1 = jsPlumb.selectEndpoints({source:$("#tbl" + tsa[0] +  " [fpname='" + tsa[0] + "." + tsa[1] +  "']")});
                            elist2 = jsPlumb.selectEndpoints({target:$("#tbl" + table.name +  " div[ffname='" + table.name + "." + key +  "']")});
                            //console.log(elist1.length, elist2.length);
                            var el1 = null;
                            var el2 = null;
                            elist1.each(function(key){el1=key});
                            elist2.each(function(key){el2=key});
                            jsPlumb.connect({source:el1, target:el2});
                    }
            });
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
                    //'left': window.lastPos.x + "px",
                    //'top': window.lastPos.y + "px"
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

            jsPlumb.repaintEverything();
            console.log("repaintedEverything");
            bsalert({text:"Table added!", type:'success'});
    }
    else 
    {
            //EDIT
            $.each(tables, function(k,v) {
                    //jsPlumb.repaint(['tbl' + k]);
                    //jsPlumb.draggable('tbl' + k);
                    //console.log('repainted div ' + 'tbl' + k);
            });
            jsPlumb.repaintEverything(); //all connections TODO: test this is required or not.
            console.log("repaintedEverything");
            //console.log('repainted all connections');
            bsalert({text:"Table updated!", type:'success'});
    }

    saveCanvasState(); 
    //jsPlumb.addEndpoint($('#tbl' + table.name), {  });
    //jsPlumb.setContainer('theCanvas');
    //console.log(
    //);
    //jsPlumb.repaint('#theCanvas');
    //console.log('repaint done');
    //console.log('made draggable ;' + 'tbl' + table.name);
    //jsPlumb.addEndpoint('tbl' + table.name, {  });
}


/*function drag(ev){
	var ss  = (parseInt($(ev.target.parentNode).position().left,10) - ev.clientX) + ',' + (parseInt($(ev.target.parentNode).position().top,10) - ev.clientY);
	ev.dataTransfer.setData("text/plain", ss + ',' + $(ev.target.parentNode).attr('id'));
	//ev.dataTransfer.setDragImage(document.getElementById("draggit"), 10, 10); //NOT WORKING
}

function drop(ev) {
	var offset = ev.dataTransfer.getData("text/plain");
	var npos = offset.split(",");
	var ctrl = npos[2];
	document.getElementById(ctrl).style.left = (ev.clientX + parseInt(npos[0])) + "px";
	document.getElementById(ctrl).style.top = (ev.clientY + parseInt(npos[1])) + "px";
	console.log(ctrl);
	ev.preventDefault();
	return false;
}

function dragOver(ev) {
	ev.preventDefault();
	return false;
}*/

/**
* @brief Save current canvas state to local store
*/

function saveCanvasState() {
	console.log('saveCanvasState()');
	var json = null;
	if (window.localStorage) {
		json = JSON.stringify(tables);
		window.localStorage.setItem("strTables", json);
	}
	console.log('~saveCanvasState()');
	return json;
}

function loadCanvasState(json) {
	console.log('loadCanvasState()');
	tables  = new Object();
	if (!window.localStorage) return;
	console.log("Loading tables");
	if (localStorage.getItem("strTables") == null) return;
	
	if (!json) {
		json = localStorage.getItem("strTables");
	}
	else {
		/*$.each(tables, function(k,v){
			deleteTable(k);	
		});*/
		//jsPlumb.empty(".canvas");
		console.log('json arg:',json);
		jsPlumb.detachEveryConnection();
		jsPlumb.empty($(".canvas"));
	}
	ttables = JSON.parse(json);
	console.log(ttables);
	//import the table structures
	$.each(ttables, function(k,v) {
		console.log('PROCESSING: ' + k);
		tables[k] = new Table(v.name);
		tables[k].fields = {};
		tables[k].position = v.position;
		//tables[k].position.x = v.position.x;
		//tables[k].position.y = v.position.y;
		console.log('round1',tables[k].position,tables[k].position.x, tables[k].position.y);
		$.each(v.fields, function(kk,vv) {
			tables[k].fields[kk] = new Field(vv);
			tables[k].fields[kk].foreign = (vv.foreign ? vv.foreign : null);
			tables[k].fields[kk].ref = (vv.ref ? vv.ref : null);
			//TODO: Remember to add any new attributes here, so canvas loads properly.
		});
	});
			
	//set the panels
	console.log('tlen:',Object.keys(tables).length);
	$.each(tables, function(k,v) {
		createThePanel(v, 'add', function() {
			if ($("[id^='tbl']").length < Object.keys(tables).length) return;
			//now create the relations after all panels are done.
			$.each(tables, function(k,v) {
				console.log('Setting relations:',k);
				console.log('round2',v.position.x, v.position.y);
				//$('#tbl' + k).css({left:v.position.x,top:v.position.y});
				window.oldrefs = {};
				$.each(v.fields, function(kk,vv) {
					if (vv.ref != null) {
						//check incoming
						console.log('foreign key found:',vv.name, vv.ref);
						//k.fields[key].ref = val.ref; //restore the lost ref
						tsa = vv.ref.split('.');
						//tables[tsa[0]].fields[tsa[1]].foreign = table.name + '.' + key; //restore the lost foreign
						//console.log("#tbl" + tsa[0] +  " div[ffname='" + tsa[0] + "." + tsa[1] +  "']");
						elist1 = jsPlumb.selectEndpoints({source:$("#tbl" + tsa[0] +  " [fpname='" + tsa[0] + "." + tsa[1] +  "']")});
						elist2 = jsPlumb.selectEndpoints({target:$("#tbl" + v.name +  " div[ffname='" + v.name + "." + vv.name +  "']")});
						//console.log(elist1.length, elist2.length);
						var el1 = null;
						var el2 = null;
						elist1.each(function(key){el1=key});
						elist2.each(function(key){el2=key});
						jsPlumb.connect({source:el1, target:el2});
					}
				});
			});
		});
	});
}

var ORMSQLAlchemy = function(templateDir) {

	 this.template = templateDir+"sqlalchemy.py";
	 
	 this.generateCode = function(tables) {
		var code = '';
		
		 $.each(tables, function(key, val) {
			code += "class " + val.name + "(Base):\n";
			code += "\t" + "__tablename__ = \"" + val.name + "\"\n";
			$.each(val.fields, function(fkey, fval){
				//embed quotes if they don't already exist
				if (fval.type=='Text' || fval.type=='String') {
					if (fval.defaultValue!=null) {
						var sdef = fval.defaultValue;
						if (sdef.indexOf('"') !=0) fval.defaultValue = '"' + sdef;
						if (sdef.lastIndexOf('"') != sdef.length-1 || sdef.lastIndexOf('"')==-1) fval.defaultValue += '"';
					}
					// Default text size is 255 if user didn't specify a size
					if (fval.size==0) {
						fval.size = 255;
					}
				}
				
				code += "\t" + fval.name + " = Column(" 
				+ fval.type + (fval.size==0 ? '' : '(' + fval.size + ')')
				+ (fval.ref != null ? ", ForeignKey('" + fval.ref + "')" : "")
				+ (fval.primaryKey ? ", primary_key=True" : "")
				+ (fval.unique ? ", unique=True" : "")
				+ (fval.defaultValue!=null ? ", default=" + fval.defaultValue : "")
				+ ")\n";
			});
			code += "\n";
		});

		return code;
	}
}

var MySQL = function(templateDir) {
	var rawTypes = 
	{'Text': 'varchar',
	 'Integer': 'int',
	 'Float': 'float'};
	this.template = templateDir+"mysql.sql";
	
	this.generateCode = function(tables) {
		var code = '';
		var constraints = [];
		$.each(tables, function(key, val) {
			code += "create table " + val.name + "\n(";
		
			//TODO: Treat text/varchar with 0 size appropriately.
			$.each(val.fields, function(fkey, fval)
			{
				//embed quotes if they don't already exist
				console.log("processing::",val.name,fval.name,fval.ref);
				if (fval.type=='Text' || fval.type=='String') {
					if (fval.defaultValue!=null) {
						var sdef = fval.defaultValue;
						if (sdef.indexOf('"') !=0) fval.defaultValue = '"' + sdef;
						if (sdef.lastIndexOf('"') != sdef.length-1 || sdef.lastIndexOf('"')==-1) fval.defaultValue += '"';
					}
					
					// Default text size is 255 if user didn't specify a size
					if (fval.size==0) {
						fval.size = 255;
					}
				}
				
				code += "\t" + fval.name + " " + rawTypes[fval.type] + (fval.size==0 ? '' : '(' + fval.size + ')')
				+ (fval.primaryKey ? " primary key" : "")
				+ (fval.unique ? " unique" : "")
				+ (fval.defaultValue!=null ? " default " + fval.defaultValue  : "")
				+ ",\n";
				
				// If this field has any references to other fields 
				if (fval.ref!=null) 
				{
					// save constraints in an array (they are added after all tables have been created)
					constraints.push("\nalter table " + val.name + " add constraint fk_" + val.name +  "_" + fval.name 
					+  " foreign key (" + fval.name +  ") references " + fval.ref.split(".")[0] +  "(" + fval.ref.split(".")[1]  + ");");
				}
			});
			
			code = code.slice(0, -2) + "\n"; //trim off that last nagging comma.
			code += ");\n";
		});

		//add any constraints placed by raw formats like mysql and postgres.
		$.each(constraints, function(index, item) {
			console.log("constraint::", index, item);
			code += item;
		});
	
		return code;
	}
}

function generateCode(outputType) {

	var codeGenerator;
	var templateDir = "/assets/templates/";
	
	// Pick code generator based on desired output format
	if (outputType=="ORM/SQLAlchemy") {
		codeGenerator = new ORMSQLAlchemy(templateDir);
	}
	else if (outputType=="mysql") {
		codeGenerator = new MySQL(templateDir);
	}
	
	// Combine template with generated code then show the output
	$.get(codeGenerator.template, function(data) {
		var code = codeGenerator.generateCode(tables);
		code = data.format({body: code, version: version});
		showResults(code);
	});
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
		type:"radiolist", text:"Select output format", list:["ORM/SQLAlchemy", "mysql"],
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

	bspopup({type:'input', text:'Table name', success:function(data) {
	
		// Validate table name
		var tableName = data.value;
		if (tableName==null || tableName.trim() == '') {
			bspopup("You must enter a table name.");
			return;
		}
		else if (tableName.indexOf(" ")>=0) {
			bspopup("Spaces are not allowed in the table name.");
			return;
		}
		else if (tables[tableName] != undefined) {
			bspopup('This table already exists.');
			return;
		}
		else {
			tableName = escape(tableName);
		}
		
		if ($("#addTableDialog").length==0) {
			$("#holder").load("assets/partials/addTableDialog.html?time=" + (new Date()).getTime(), function(){
				runAddTableDialog(tableName, "add");
			});
		}
		else {
			runAddTableDialog(tableName, "add");
		}
	}});
}

function runAddTableDialog(tableName, mode) 
{
	$("#addTableDialog #tableName").text(tableName);
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
		saveCanvasState();
	}
}

function importCanvas() {
	console.log('IMPORT_CANVAS');
	var file = $('#inputCanvasFile')[0].files[0];
	//console.log(file);
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
	//console.log(fr.result);
};

function exportCanvas() {
	if (Object.keys(tables).length == 0) {
		bsalert({text:'No tables to export.'});
		return;
	}
	downloadSomeText(saveCanvasState(), 'canvas.json');
}

