/**
* @brief Custom Javascript functions
* @author Prahlad Yeri
* @copyright MIT License
*/

if (window.location.href.indexOf('127.0.0.1:') >=0 ) {
	window.DEBUG = true;
}
else {
	window.DEBUG  = false;
}

$(window).load(function() {
	//if (!window.DEBUG) {
		//$("#lnkHelp").click();
		if (readCookie(".mainAlert.closed") != null) {
			/*console.log("alert cookie already exists!");
			$(".mainAlert").hide();*/
		}
		else {
				bsalert({title:'How to:',text:'Just click the New Table link above to start creating tables. Once done, simply click the Build button to get the python code for the sqlalchemy models!<br><br>To create relationships, drag the red dots (primary-keys) and connect them to green dots (candidate foreign-keys).<br><br>To detach/remove the relationships, click the green area on the foreign-keys and drag it outside the table panel.', type:'success', delay:0});
			console.log("CALLED");
			createCookie(".mainAlert.closed","true");
			/*$('.mainAlert').on('closed.bs.alert',  function(){
				createCookie(".mainAlert.closed", "true", 365);
				console.log('alert cookie created');
			})
			console.log('alert event added');*/
		}
	//}
	
	//Objects Initialization
	tables = {}; //dict of String:Table objects
	
	//EndpointHoverStyle: {color: "blue"},
	jsPlumb.importDefaults({
		Endpoint: ["Rectangle", {width:14, height:14}] ,
		Endpoints : [ [ "Rectangle" ], [ "Rectangle" ] ],
		Connector: "Bezier",//Flowchart, Straight, Bezier
		MaxConnections : 5,
		PaintStyle: {strokeStyle: "rgba(0,0,0,100)", lineWidth:4},
		/*HoverPaintStyle: { lineWidth:4,
			strokeStyle: 'rgba(200,0,0,100)'
		}*/
	});
	
	jsPlumb.setContainer("theCanvas");
	console.log('jsPlumb.getContainer():', jsPlumb.getContainer());
	
	
	//check local storage, if any build the tables.
	$("#holder").load("assets/partials/addTableDialog.html?time=" + (new Date()).getTime(), function(){
		//runAddTableDialog(tableName, "add");
	});
	
	
	loadCanvasState(null);
	

	
	//if (localStorage.tables) {
		//console.log("LOCAL_STORAGE found!");
		//tables = localStorage.tables;
	//}

	
/*	if (Object.keys(tables).length==0 && window.DEBUG) {
		//create a dummy table for testing
		for (i=1;i<=2;i++) {
			table = new Table("product" + i);
			table.fields['id'] = new Field({name: 'id', type: 'Integer', size: 0, primaryKey: true, defaultValue: 1});
			table.fields['name'] = new Field({name: 'name', type: 'Text', size: 255, unique: true, defaultValue: 'foo'});
			tables['product' + i] = table;
			createThePanel(table, 'add');
		}
	}*/
	
});

/* jsPlumb events */
jsPlumb.bind("beforeDrop", function(info) {
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
	bsalert({text: pkey[1] + '><' + fkey[1], title:"Detached: "});
	saveCanvasState();
	//window.tobj = info;
})


//Other misc functions

/**
* @brief: Creates a new panel from scratch for a table
* @param mode Should be 'add' or 'edit'
*/
function createThePanel(table, mode, func) {
	if (mode == "add") {
		$.get("assets/partials/table.html?time=" + (new Date()).getTime(), function(data) {
			$('.canvas').append(data.format(table.name));
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
			html += "<td>" + (field.primaryKey ? 'primary' : '') + (field.unique ? 'unique' : '') + "</td>";
			//if (mode=='add') 
			
			html += "<td>" + (field.primaryKey ? "<div fpname='"  + table.name + "." + field.name +   "' class='prima'></div>" : '') + "</td>"; //virtual
			html += "</tr>";
			//
			$("#tbl" + table.name + " .table").append(html);
			//
			var ep;
			if (field.primaryKey) {
				//jsPlumb.addEndpoint($('#tbl' + table.name + " div.prima"), {
				ep = jsPlumb.addEndpoint($('#tbl' + table.name + " [fpname='" + table.name + "." +  field.name + "']"), {
					isSource: true,
					paintStyle: {fillStyle:"red", outlineColor:"black", outlineWidth:1 },
					//connectorPaintStyle:{ strokeStyle:"blue", lineWidth:10 },
					connectorOverlays: [ 
						[ "Arrow", { width:10, length:15, location:1, id:"arrow" } ],
						//[ "Label", { label:"Relationship", id:"lblPrimary_" + table.name } ]
						],
				});
			}
			//else {
				//jsPlumb.addEndpoint($('#tbl' + table.name + " div.field"), {isTarget: true,
				ep = jsPlumb.addEndpoint($('#tbl' + table.name + " [ffname='" + table.name + "." +  field.name + "']"), {
						isTarget: true,
						paintStyle: { fillStyle:"green", outlineColor:"black", outlineWidth:1 },
					});
			//}
			jsPlumb.draggable('tbl' + table.name, {
			   containment:true,
			   stop: function(event, ui) {
					console.log(event.pos[0], event.pos[1]);
					tables[table.name].position.x = event.pos[0] + 'px';
					tables[table.name].position.y = event.pos[1] + 'px';
					saveCanvasState();
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
					elist2 = jsPlumb.selectEndpoints({source:$("#tbl" + table.name +  " div[fpname='" + table.name + "." + key +  "']")});
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
					console.log("#tbl" + tsa[0] +  " div[fpname='" + tsa[0] + "." + tsa[1] +  "']");
					elist1 = jsPlumb.selectEndpoints({source:$("#tbl" + tsa[0] +  " div[fpname='" + tsa[0] + "." + tsa[1] +  "']")});
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
						elist1 = jsPlumb.selectEndpoints({source:$("#tbl" + tsa[0] +  " div[fpname='" + tsa[0] + "." + tsa[1] +  "']")});
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


function generateCode(dbname) {
	var code = 
"import sqlalchemy\n\
from sqlalchemy import create_engine\n\
from sqlalchemy.ext.declarative import declarative_base\n\
from sqlalchemy import Column, Integer, Date, String, Text, Float, ForeignKey\n\
from sqlalchemy.dialects.mysql import BIGINT\n\
from sqlalchemy.dialects.mysql import LONGTEXT\n\
from sqlalchemy.orm import sessionmaker, relationship, backref\n\n\
Base = declarative_base()\n\n";
	$.each(tables, function(key, val) {
		//console.log(val.name);
		code += "class " + val.name + "(Base):\n";
		code += "\t" + "__tablename__ = \"" + val.name + "\"\n";
		$.each(val.fields, function(fkey, fval){
			//embed quotes if they don't already exist
			if ((fval.type=='Text' || fval.type=='String') && fval.defaultValue!=null) {
				var sdef = fval.defaultValue;
				if (sdef.indexOf('"') !=0) fval.defaultValue = '"' + sdef;
				if (sdef.lastIndexOf('"') != sdef.length-1 || sdef.lastIndexOf('"')==-1) fval.defaultValue += '"';
			}
			code += "\t" + fval.name + " = Column(" 
			+ fval.type + (fval.size==0 ? '' : '(' + fval.size + ')')
			+ (fval.ref != null ? ", ForeignKey('" + fval.ref + "')" : "")
			+ (fval.primaryKey ? ", primary_key=True" : "")
			+ (fval.unique ? ", unique=True" : "")
			+ (fval.defaultValue!=null ? ", default=" + fval.defaultValue : "")
			+ ")\n";
		});
		code += "\n\n";
	});
	//alert(code);
	//console.log(code);
	
	code += 
"if __name__ == '__main__':\n\
\tprint('running sqlalchemy ' + sqlalchemy.__version__)\n\
\tengine = create_engine(r'sqlite:///" + dbname + ".db', echo=True) #connect to database\n\
\tBase.metadata.create_all(engine) #Lets create the actual sqlite database and schema!\n\
\tprint('database created: " + dbname  + ".db')";

/*\t\n\
\tSession = sessionmaker(bind=engine) #create a session class. (alternatively, Session.configure(bind=engine)\n\
\tsession = Session() #lets create an object of this Session() class\n\
\t#ed = Student(name='Ed Jones', email='edjones@yahoo.com') #lets add some data!\n\
\t#ed = Student(name='Harry Potter', email='harrypotter@yahoo.com') #lets add some data!\n\
\t#session.add(ed)\n\
\t#session.commit()"*/
	
	return code;
}

function showResultsDialog() {
	if (!window.DEBUG && Object.keys(tables).length==0) {
		alert("There should be at least one table");
		return;
	}
	
	if ($("#resultsDialog").length==0) {
		console.log('not found in cache');
		$("#holderResults").load("assets/partials/resultsDialog.html?time=" + (new Date()).getTime(), function(){
			$('#resultsDialog').on('shown.bs.modal', function(e) {
				//console.log('just highlighted');
				//SyntaxHighlighter.highlight();
				//SyntaxHighlighter.all('pre');
				prettyPrint();
			});
			//SyntaxHighlighter.highlight();

			runResultsDialog();
		});
	}
	else {
			console.log('found in cache');
			runResultsDialog();
	}
}

function runResultsDialog() {
	dbname = 'sql00' + parseInt(Math.random() * 4000 + 9999);
	var code = generateCode(dbname);
	//remove all child elements of #theCode
	$("#resultsDialog #theCode").empty();
	//add a pre tag
	//$("#resultsDialog #theCode").append('<pre class="brush:python"></pre>');
	$("#resultsDialog #theCode").append('<pre class="prettyprint"></pre>');
	//<script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
	//prettyPrint();

	//set code
	$("#resultsDialog #theCode pre").text(code);
  	  //
	//syntax highlight
	//SyntaxHighlighter.defaults['gutter'] = false;
	//SyntaxHighlighter.defaults['smart-tabs'] = false;	
	//SyntaxHighlighter.highlight('pre');
	//console.log('code' + code);
	//$("#resultsDialog #theCode").text("def index():\n\n    print 'foo'");
	$("#resultsDialog").modal();
}


function showAddTableDialog() {
	console.log("showAddTableDialog()");
	var tableName  = window.prompt("Enter table name:", tableName);
	if (tableName==null || tableName.trim() == '') {
		alert("Not a valid table name.");
		return;
	}
	else if (tableName.indexOf(" ")>=0) {
		alert("Special chars are not allowed in the table name.");
		return;
	}
	else if (tables[tableName] != undefined) {
		alert('This table already exists.');
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
}

function runAddTableDialog(tableName, mode) 
{
	$("#addTableDialog #tableName").text(tableName);
	$("#addTableDialog #editMode").val(mode);
	$("#addTableDialog .fieldRow").remove();
	if (mode=='edit') {
		$.each(tables[tableName].fields, function(key, val){
			console.log(tableName);
			console.log(val.name);
			$("#fieldName").val(val.name);
			$("#fieldType").val(val.type);
			$("#fieldSize").val(val.size);
			$("#fieldDefault").val(val.defaultValue);
			if (val.primaryKey) {
				console.log(val.name, 'primary');
				//$("#fieldPrimary").attr("checked", "checked"); //MAGIC: Somehow prop() is working but attr() is not: Chrome 41.0 windows.
				$("#fieldPrimary").prop("checked", true);
			}
			else {
				$("#fieldPrimary").prop("checked", false);
			}
			if (val.unique) {
				console.log(val.name, 'unique');
				//$("#fieldUnique").attr("checked", "checked");
				$("#fieldUnique").prop("checked", true);
			}
			else {
				//$("#fieldUnique").removeAttr("checked");
				$("#fieldUnique").prop("checked", false);
			}
			
			addField(); //inside the addTableDialog.html
		});
	}
	//TODO: [LATER]This routine should be written each time before showing a bootstrap modal:
	$(".modal").on('shown.bs.modal', function() {
		//console.log('.modal:shown');
		$(this).find("[autofocus]:first").focus();
	});
	
	$("#addTableDialog").modal();
}


function editTable(tableName) {
	runAddTableDialog(tableName, "edit");
}

function deleteTable(tableName) {
	if (confirm("Sure you want to delete this table along with all it's relations?")) {
		//TODO: [NOT-REQUIRED]Check relations of this table
		delete tables[tableName];
		//$("#tbl" + tableName).remove();
		jsPlumb.empty("tbl" + tableName);
		saveCanvasState();
		//jsPlumb.repaintEverything();
	}
}

//console.log('DEFINED_ImportCanvas');
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

/****************************/
/* START UTILITY/CORE FUNCTIONS */
/********************************/

function downloadSomeText(text, filename) {
	console.log("downloadSomeText");
	var content = text;
	var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
	var a = document.createElement('a');
	
	if (a.click != undefined) {
		console.log(a.click);
		//method-3
		a.href = uriContent;
		a.download  = filename;
		var myEvt = document.createEvent('MouseEvents');
		myEvt.initEvent(
		   'click'      // event type
		   ,true      // can bubble?
		   ,true      // cancelable?
		);		
		a.dispatchEvent(myEvt);
	}
	else {
		console.log("a.click is undefined");
		//method-2
		location.href= uriContent;
	}
	
	//method-1
	//window.open(uriContent, "somefile.txt");
}

//depends on bootstrap
function bsalert(obj) {
	//initial config:
	cont = $('.header'); //container
	delay = 2000; //millis
	theWidth = "300px";
	
	//text, type, title
	text = obj.text; //.replace("\n","<br>");
	type = obj.type;
	title = obj.title;
	if (obj.delay!=undefined) delay = obj.delay;
	
	if (type==undefined) type='info';
	
	/*if ($('#bsalertPlugin').length>0){
		$('#bsalertPlugin').remove();
	}*/
	
	var nid = $('.bsalert-plugin').length + 1;
	
	//if ($('#bsalertPlugin').length==0) 
	//{
		html = '<div id="bsalertPlugin' + nid + '" style="z-index:2000;position:absolute;right:0;top:0;width:' + theWidth + ';" class="bsalert-plugin alert alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong class="bsaTitle"></strong>&nbsp;<span class="bsaBody"></span></div>';
		$('body').append(html);
	//}

	tval = cont.height();
	lval = cont.offset().left + parseInt(cont.css('width')); //cont.width();
	lval -= parseInt($('#bsalertPlugin' + nid).css('width'));
	
	$('#bsalertPlugin' + nid).css( {'top': tval, 'left': lval} );
		
	$('#bsalertPlugin' + nid).addClass('alert-' + type);
	$('#bsalertPlugin'  + nid + ' .bsaBody').html(text);
	$('#bsalertPlugin' + nid + ' .bsaTitle').text(title);
	//window.setTimeout(function() { ba.alert('close') }, delay);
	if (delay==0) {
		$('#bsalertPlugin'  + nid).alert();
	}
	else {
		$('#bsalertPlugin' + nid).alert().hide().fadeIn(500).delay(delay).fadeOut(1000, function() {
			$(this).alert('close');
		});
	}
}


// source: http://stackoverflow.com/a/18405800/849365
// example: "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

if (!String.prototype.capitalize) {
	String.prototype.capitalize =  function() { 
		return this.replace(/^./, function(match){return match.toUpperCase()} );
	}
}

COOKIE_ENCODER = '{|}~';
function createCookie(name, value, days) 
{
	value = value.replace(';', COOKIE_ENCODER);
	
    //if (days>=0) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    //}
    //else var expires = "";


    document.cookie = name + "=" + value + expires; // + "; path=/";
}

function readCookie(name) 
{
	//name = name.replace(';',COOKIE_ENCODER);
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
        {
        	s = c.substring(nameEQ.length, c.length);
        	s = s.replace(COOKIE_ENCODER,';');
        	return s;
        }
    }
    return null;
}

function eraseCookie(name) 
{
    createCookie(name, "", -1);
}

//http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
function selectText(element) {
    var doc = document
        , text = doc.getElementById(element)
        , range, selection
    ;    
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();        
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

/*END UTILITY FUNCTIONS*/