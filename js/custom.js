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
	//alert("foo");
	/*$("#dragme").css({
		"left": "500px",
		"top" : "50px",
	});*/
	
	if (!window.DEBUG) {
		if (readCookie(".mainAlert.closed") != null) {
			console.log("alert cookie already exists!");
			$(".mainAlert").hide();
		}
		else {
			$('.mainAlert').on('closed.bs.alert',  function(){
				//alert('closed');
				createCookie(".mainAlert.closed", "true", 365);
				console.log('alert cookie created');
			})
			console.log('alert event added');
		}
	}
	
	//Objects Initialization
	tables = {}; //dict of String:Table objects
	
	jsPlumb.setContainer("theCanvas");
	console.log('jsPlumb.getContainer():', jsPlumb.getContainer());
	
	if (window.DEBUG) {
		//create a dummy table for testing
		table = new Table("product");
		table.addField({
			name: 'id',
			type: 'Integer',
			size: 0,
			primaryKey: true,
			defaultValue: 1
		});
		table.addField({
			name: 'name',
			type: 'Text',
			size: 255,
			unique: true,
			defaultValue: 'foo'
		});
		tables['product'] = table;
		createThePanel(table, 'add');
	}
});


/**
* @brief: Creates a new panel from scratch for a table
* @param mode Should be 'add' or 'edit'
*/
function createThePanel(table, mode) {
	if (mode == "add") {
		$.get("assets/partials/table.html?time=" + (new Date()).getTime(), function(data){
			$('.canvas').append(data.format(table.name));
			setThePanel(table, mode);
		});
	}
	else {
		setThePanel(table, mode);
	}
}

function setThePanel(table, mode) {
		html = '';
		if (mode=='edit') {
			//$('#tbl' + table.name + " .table tr").remove();
			jsPlumb.remove($('#tbl' + table.name + " .table tr"));
			jsPlumb.repaintEverything();
		}
		
		$.each(table.fields, function(key, field) {
			var sprim = "";
			if (field.primaryKey) {
				//sprim+= " style='cursor:move' ";
			}
			html += "<tr" +  ">";
			html += "<td>" + (field.primaryKey ? '' : "<div class='field'></div>") + "</td>"; //virtual
			html += "<td>" + field.name + "</td>";
			html += "<td>" + field.type + (field.size>0 ? '(' + field.size + ')' : '') + "</td>";
			html += "<td>" + (field.primaryKey ? 'primary' : '') + (field.unique ? 'unique' : '') + "</td>";
			html += "<td>" + (field.primaryKey ? "<div class='prima'></div>" : '') + "</td>"; //virtual
			html += "</tr>";
		});
		$('#tbl' + table.name + " .table").append(html);
		//jsPlumb.draggable($('#tbl' + table.name + " tr.prima"),{}); //containment:true
		console.log('#tbl' + table.name + " td.prima",'#tbl' + table.name + " td:not(.prima)");
		jsPlumb.addEndpoint($('#tbl' + table.name + " div.prima"), {isSource: true});
		jsPlumb.addEndpoint($('#tbl' + table.name + " div.field"), {isTarget: true});
		/*$("#tbl" + table.name + " tr").on('mouseover', function(){
			if ($(this).text().indexOf('primary') >=0) {
				console.log('im primary');
				$(this).css({'cursor': 'pointer'});
			}
		});*/
		console.log('added event listener');
		jsPlumb.draggable('tbl' + table.name, {
		   containment:true
		});
		
		if (mode=='add') {
			if (window.lastPos == undefined) {
				window.lastPos = {'x':0, 'y':0};
			}
			else {
				window.lastPos.x += 40;
				window.lastPos.y += 40;
			}

			$('#tbl' + table.name).css({
				'left': window.lastPos.x + "px",
				'top': window.lastPos.y + "px"
			});
			
			jsPlumb.repaintEverything();
			bsalert("Table added!", 'success');
		}
		else {
			jsPlumb.repaintEverything();
			bsalert("Table updated!", 'success');
		}
		
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

function generateCode(dbname) {
	var code = 
"import sqlalchemy\n\
from sqlalchemy import create_engine\n\
from sqlalchemy.ext.declarative import declarative_base\n\
from sqlalchemy import Column, Integer, Date, String, Text, Float, ForeignKey\n\
from sqlalchemy.orm import sessionmaker, relationship, backref\n\n\
Base = declarative_base()\n\n";
	$.each(tables, function(key, val) {
		//console.log(val.name);
		code += "class " + val.name + "(Base):\n";
		code += "\t" + "__tablename__ = \"" + val.name + "\"\n";
		$.each(val.fields, function(fkey, fval){
			code += "\t" + fval.name + " = Column(" + fval.type + (fval.size==0 ? '' : '(' + fval.size + ')')   
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
	//TODO: This routine should be written each time before showing a bootstrap modal:
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
	if (confirm("Sure you want to delete this table?")) {
		delete tables[tableName];
		//$("#tbl" + tableName).remove();
		jsPlumb.remove("tbl" + tableName);
	}
}

/* START UTILITY/CORE FUNCTIONS */

//depends on bootstrap
function bsalert(text, type, title) {
	//config:
	cont = $('.header'); //container
	delay = 2000; //millis
	
	if (type==undefined) type='info';
	if ($('#bsalertPlugin').length==0) 
	{
		html = '<div id="bsalertPlugin" style="z-index:2000;position:absolute;right:0;top:0;width:200px;" class="alert alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong class="bsaTitle"></strong>&nbsp;<span class="bsaBody"></span></div>';
		$('body').append(html);
		//$('#bsalertPlugin').css( {'top': $('.header').css('height'), "left": $('.header').offset().left + $('.header').width() } );
		//} );
	}
	else {
	
	}

	tval = cont.height();
	lval = cont.offset().left + parseInt(cont.css('width')); //cont.width();
	lval -= parseInt($('#bsalertPlugin').css('width'));
	
	$('#bsalertPlugin').css( {'top': tval, 'left': lval} );
		
	$('#bsalertPlugin').addClass('alert-' + type);
	$('#bsalertPlugin .bsaBody').text(text);
	$('#bsalertPlugin .bsaTitle').text(title);
	//$('#bsalertPlugin').removeClass('hidden');
	//$('#bsalertPlugin').addClass('in');
	//var ba = $('#bsalertPlugin').alert();
	//window.setTimeout(function() { ba.alert('close') }, delay);
	$('#bsalertPlugin').alert().hide().fadeIn(1000).delay(2000).fadeOut(1000, function() {
		$(this).alert('close');
	});
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
	
    if (days>=0) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";


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

/*END UTILITY FUNCTIONS*/