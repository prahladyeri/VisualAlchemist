// Copyright 2016 by Prahlad Yeri
// Copyright 2020 by André Kreienbring
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 3 as published by
// the Free Software Foundation.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


import jsplumb from "jsplumb";

import {Table, Field} from "./classes.js";
import {utils} from "./utils.js";
import {Logger} from "./js-log.js";
import {zoomit} from "./zoomit.js";
import {storage} from "./localStorage.js";


//window.jQuery = $; window.$ = $;
//jQuery.noConflict();

const logger = Logger.getClassLogger("App");
//Logger.disableAll();

/**
 * The main application that represents the single page App.
 * In particular it creates the canvas and the tables with their connection
 * by using jsPlump for this purpose.
 * It also maintains the storage by providing several functions that access the storage
 */
class App {
	constructor(){
		this.tableTemplate = "";
		this.jsPlumbInstance = null;
		this.isStorageReady = false;
	};
	
	/**
	 * Reads all settings from the tableDialog and positions a new table in the canvas
	 * jsPlumb is used to make the table draggable and show the endpoints to create relations
	 * @param table The table that must be inserted to the canvas
	 * @param mode Should be 'add' or 'edit'
	 * @parem isLoading If true the created table will not be zoomed
	 * @see loadCanvasState, tableDialog.saveData()
	 */
	createThePanel(table, mode, isLoading){
		const logger = Logger.getFunctionLogger("App", "createThePanel");

		if (mode == 'edit') {
			//this will remove the div, the connections and the endpoints
	    	this.jsPlumbInstance.remove("tblDiv" + table.id);
	    };

    	let tableHtml = this.tableTemplate.format({tableId: table.id});
    	tableHtml = tableHtml.format({tableName: table.name});
	    jQuery(dbdesigner.namespaceWrapper + "#theCanvas").append(tableHtml); 
	    
    	//get a zoom instance and store it with the table
		table.panzoom = zoomit.makeTableZoomable(jQuery(dbdesigner.namespaceWrapper + "#tblDiv" + table.id)[0]);
		
		
		const tableDiv = dbdesigner.namespaceWrapper +  "#tblDiv" + table.id;  //this is the surrounding DIV

    	//position the table on the canvas
		//new tables will be positioned at (0,0)
		jQuery(tableDiv).css({
			left: table.position.x,
			top: table.position.y
		});
    	
	    //Now lets build the new panel
	    jQuery.each(table.fields, (fieldId, field) =>{
	    	
	    	logger.log("Processing: " + field.name);
	    	logger.log("Row length: ", tableDiv, "::", jQuery(tableDiv + " .table tbody tr").length);

			// Setup details field for this row
	    	const details = [];
			if (field.primaryKey) details.push('primary');
			if (field.unique) details.push('unique');
			if (field.notNull) details.push('not null');
			const tattr = details.join(',');

			const html = jQuery("<tr style='vertical-align: middle;'>" +
					"<td>" +
					"<div ffname='" + table.id + "." + field.id +  "' class='field invisible'>fk</div>" + //jsPlumb anchor
				"</td>" + 
				"<th scope='row'>" + field.name + "</th>" +
				"<td>" + field.type.replace("=True","") + (field.size>0 ? '(' + field.size + ')' : '') + "</td>" +
				"<td>" + (tattr == "" ? "---" : tattr) + "</td>" +
				"<td style='vertical-align: middle;'>" + 
					(field.primaryKey ? "<div fpname='"  + table.id + "." + field.id +   "' class='prima invisible'>pk</div>" : '') +  //jsPlumb anchor
				"</td>" +
			"</tr>");
			
			jQuery(tableDiv + " tbody").append(html);

			if (field.primaryKey == true) {
						
				if (field.pkEndpoint != null) {
					// Delete the old primary endpoint attached to the field
					this.jsPlumbInstance.deleteEndpoint(field.pkEndpoint);
					field.pkEndpoint = null;
				};
				
				// Create an endpoint for PK connections
				//Important: Add a class to the endpoint! That is necessary for identifying the endpoint when zooming!
				const pkAnchor = jQuery(tableDiv + " div[fpname='" + table.id + "." +  field.id + "']");
				field.pkEndpoint = this.jsPlumbInstance.addEndpoint(pkAnchor, {
					endpoint: ["Rectangle", {cssClass: 'zoomablePk' + table.id + "_" + field.id, width:zoomit.initialEndpointSize, height:zoomit.initialEndpointSize}] ,
			        isSource: true, //don't put this in the endpoint type!
					type:"primary",
					anchor:[ 1, 0.5, 1, 0.5 ], //right anchor curve from left
					//scope: field.type,
					connectorOverlays: [ 
						[ "Arrow", { width:10, height:10, location:1, id:"arrow"}],
					],
				});
			}; //if primary key
			
			if (field.fkEndpoint != null) {
				// Delete the old foreign endpoint attached to the field
				this.jsPlumbInstance.deleteEndpoint(field.fkEndpoint);
				field.fkEndpoint = null;
			};
			
			// Create an endpoint for FK connections
			const fkAnchor = jQuery(tableDiv + " div[ffname='" + table.id + "." +  field.id + "']");
			field.fkEndpoint = this.jsPlumbInstance.addEndpoint(fkAnchor, {
				endpoint: ["Rectangle", {cssClass: 'zoomableFk' + table.id + "_" + field.id, width:zoomit.initialEndpointSize, height:zoomit.initialEndpointSize}] ,
		        isTarget: true,
				type:"foreign",
				//scope: field.type,
				anchor:[ 0, 0.5, 0, 0.5 ], //left anchor curve from left
			});
			
	    }); //JQuery.each field
	    
		
		// Make table draggable
		//this.jsPlumbInstance.draggable("tblDiv" + table.name, {
		this.jsPlumbInstance.draggable(jQuery(tableDiv), {
		   //containment: true,
		   containment: "parent", 
		   stop: (event, ui) => {
			   //as this seems to be triggered on a button click => only react when position has changed
			   if(dbdesigner.tables[table.id].position.x != event.pos[0] + 'px' || dbdesigner.tables[table.id].position.y != event.pos[1] + 'px'){
				   dbdesigner.tables[table.id].position.x = event.pos[0] + 'px';
				   dbdesigner.tables[table.id].position.y = event.pos[1] + 'px';
				   this.updateTable(dbdesigner.tables[table.id], false);
			   };
		   }
		});
		
		// If editing, ensure all connections get re-created
	    if (mode=='edit') {
			this.createAllConnections();
	    };
	    
	    if (mode=='add') {
			if(zoomit.currentZoom != 1 && !isLoading){
				//the timeout solves the problem of not firing the "transitionend" event after zooming!
				setTimeout(function() {
					zoomit.zoomTable(table);
				}, 0);			
			};
	    	
	    	if(!isLoading){
	    		//don't show alerts when loading the canvas
	    		utils.bsalert({text:table.name+" added!", type:'success'});
	    	};
	    }else{
	    	utils.bsalert({text:"Table updated!", type:'success'});
	    };
	}; //createThePanel
	
	/**
	 * Creates jsPlumb Connections between primary keys end foreign keys. 
	 * @see loadCanvasState
	 * @see createThePanel
	 */
	createAllConnections() {
		logger.log("Creating the connections");
		// now create the relations after all panels are done.
		jQuery.each(dbdesigner.tables, (tableId, table) =>{
			jQuery.each(table.fields, (fieldId, field) =>{
				logger.log("Checking incoming connections for table *'" + table.name + "' and field '" + field.name + "'")
				if (field.pkRef != null) {
					const tsa = field.pkRef.split('.');
					logger.log("source: " + tsa[0] + "." + tsa[1]);
					logger.log("destination: " , field.fkEndpoint);
					this.jsPlumbInstance.connect({source: dbdesigner.tables[tsa[0]].fields[tsa[1]].pkEndpoint, target: field.fkEndpoint});
				};
			});
		});
	};

	/**
	 * A JSON is converted to valid tables which are shown on the canvas. Used by 'ImportCanvas´
	 * and called when exiting tables are stored in the local storage on application start
	 * @param appData An object that represents the canvas state.
	 * @param isImport If true a json was imported and the canvas must be cleared and saved after loading
	 * @see start(), dbdesigner.importCanvas()
	 */
	loadCanvasState(appData, isImport){
		try {
			logger.log("Loading the canvas");
			
			if(isImport){
				// Clear canvas and create new table to start from a blank state
				this.clearCanvas();
			};
			
			zoomit.currentZoom = appData.zoom;
			
			// Temporarily suspend drawing to speed up load time
			this.jsPlumbInstance.setSuspendDrawing(true);
		
			//import the table structures
			jQuery.each(appData.strTables, (tableId, tableData) => {
				dbdesigner.tables[tableId] = new Table(tableData.name);
				
				const table = dbdesigner.tables[tableId];
				table.fields = {};
				table.position = tableData.position;
				table.id = (tableData.id? tableData.id : 0);
				jQuery.each(tableData.fields, function(fieldId,field) {
					table.fields[fieldId] = new Field(field);
					table.fields[fieldId].pkRef = (field.pkRef ? field.pkRef : null);
				});
				
				//table, add, isLoading
				this.createThePanel(table, 'add', true);
			});
				
			// Create the connections
			this.createAllConnections();
			
		} finally {
			this.jsPlumbInstance.setSuspendDrawing(false, true);
			
			//ONLY AFTER things have been drawn we can zoom!
			if(zoomit.currentZoom != 1){
				zoomit.zoomAll();
				jQuery(dbdesigner.namespaceWrapper + "#zoomSlider").val(zoomit.currentZoom);
			};
			
			if(isImport) this.saveCanvasState();
		};
	};
	
	/**
	 * Get an object that represents the current canvas state
	 * @see dbdesigner exportCanvas()
	 * @see saveCanvasState
	 * @return An object witch contains the current zoom and the tables
	 */
	getAppData(){
		return {zoom: zoomit.currentZoom, strTables: dbdesigner.tables};
	};
	
	/**
	* Save current canvas state to the storage.
	* This is only used when a JSON file was imported an all tables need to be saved
	* @see loadCanvasState
	*/
	saveCanvasState() {
		if (dbdesigner.tables != {} && this.isStorageReady) {
			//only save data if the storage is available
			logger.log("Saving canvas state...")
			storage.set(this.getAppData());
		};
	};
	
	/**
	 * Create a single new table in the storage
	 * @param table The table that needs to be created
	 * @return A Promise that is resolved with true if successful
	 */
	createTable(table){
		return storage.createTable(table);
	};
	
	/**
	 * Updates an existing table in the storage
	 * @param table The table that must be updated
	 * @param updateFields If true the fields must also be updated
	 * @return A Promise that is resolved with true if successful
	 */
	updateTable(table, updateFields){
		return storage.updateTable(table, updateFields);
	};
	
	/**
	 * Deletes a table from the storage
	 * @param table The table that will be deleted (including all fields)
	 * @return A Promise that is resolved with true if successful
	 */
	deleteTable(table){
		return storage.deleteTable(table);
	};
	
	/**UNUSED? 
	 * Create a new field in the storage
	 * @param table The table the field belongs to
	 * @param field The field that will be created
	 * @return A Promise that is resolved with true if successful
	 */
	createField(table, field){
		return storage.createField(table, field);
	};
	
	/** Updates a field in the storage
	 * @param table The table the field belongs to
	 * @param field The field that will be updated
	 * @return A Promise that is resolved with true if successful
	 */
	updateField(table, field){
		return storage.updateField(table, field);
	};
	
	/** Deletes a field in the storage
	 * @param table The table the field belongs to
	 * @param field The field that will be updated
	 * @return A Promise that is resolved with true if successful
	 */
	deleteField(table, field){
		return storage.deleteField(table, field);
	};
	
	/**
	 * Saves the current zoom factor
	 * @param zoom The current zoom factor
	 * @return A Promise that is resolved with true if successful
	 */
	updateZoom(zoom){
		return storage.updateZoom(zoom)
	};
	
	/**
	 * Deletes the jsPlumb connections. Removes all DOM elements with the tableDesign class and clears the canvas
	 * Also removes the dbdesigner data from the storage.
	 * @see dbdesigner.eraseCanvasState()
	 * @see loadCanvasState()
	 */
	clearCanvas() {
		this.jsPlumbInstance.deleteEveryConnection();
		this.jsPlumbInstance.remove(jQuery(dbdesigner.namespaceWrapper +  ".tableDesign"));
		this.jsPlumbInstance.empty(jQuery(dbdesigner.namespaceWrapper +  "#theCanvas"));
		
		dbdesigner.tables  = {};
		
		// Clear out the copy stored in storage
		//storage.remove(true)  ACTIVATE FOR Testing when an other storage then local storage is used.
		storage.remove();
	};
	
	/**
	 * This starts the Application. 
	 * The dbdesigner object must be globally available and the DOM must be loaded
	 */
	start(){
		logger.log("Application is starting");
		logger.log("Detected Bootstrap Version: " + jQuery.fn.tooltip.Constructor.VERSION);
		logger.log("Detected Jquery Version: " + jQuery.fn.jquery);
		
		logger.log("AJAX Error handler activated");
		jQuery(document).ajaxError(function( event, jqxhr, settings, thrownError ) {
			logger.error("URL: " + settings.url + " result: " + thrownError);
		});
		
		//set the jsplumb endpoint size. used for anchors.
		zoomit.initialEndpointSize = 18;
		
		const $zoomSlider = jQuery(dbdesigner.namespaceWrapper + "#zoomSlider");
		$zoomSlider.attr("min", zoomit.minScale);
		$zoomSlider.attr("max", zoomit.maxScale);
		$zoomSlider.attr("step", zoomit.step);
		
		$zoomSlider[0].addEventListener("input", () =>{
			//the user has moved the slider!
		    zoomit.currentZoom = parseFloat($zoomSlider.val()); 
			if(dbdesigner.tables != {} && zoomit.currentZoom != zoomit.lastZoom){
				zoomit.zoomAll();
				this.updateZoom(zoomit.currentZoom);
			};
		}, false);
		
    	jQuery.get(dbdesigner.context + "assets/partials/table.html", (tableTemplate) => {
			//store the loaded template, so we don't need to load it again.
			this.tableTemplate = tableTemplate;
			
			//check if storage is available
			storage.isReady().then( (isReady) =>{
				this.isStorageReady = isReady;
				logger.log("isStorageReady? " + isReady);
				if(isReady){
					storage.get().then( (appData) => {
					    if(appData){
							if(jQuery.isEmptyObject(appData.strTables)){
						    	utils.bshelp(true);
						    }else{
							    //load existing tables to the Canvas. Save is not necessary
								this.loadCanvasState(appData, false);
						    };
					    }else{
					    	//this is an error. isReady but get failed!
					    	utils.bsalert({text:"Storage is not ready!.", type:"danger", delay: 0});
					    };
					});
				}else{
					utils.bshelp(false);
				};
			});
		});
	}; //start()
}; //class App

const app = new App();

jQuery(window).on('load', function () {
	logger.log("window is loaded");
});

jQuery(document).ready(function () {
	logger.log("document is ready");
}); //document.ready

jsPlumb.ready(function(){
	logger.log("jsPlumb is ready");
	
	app.jsPlumbInstance = jsPlumb.getInstance({
		Connector: "Straight",//Flowchart, Straight, Bezier
		MaxConnections : -1,
		PaintStyle: {stroke: "rgba(50,50,50,1)", strokeWidth:2.5},
		HoverPaintStyle: {strokeWidth:4},
    });
	
	//app.jsPlumbInstance.setContainer("theCanvas");
	app.jsPlumbInstance.setContainer(document.querySelector("div.vialch div.canvas"));

	app.jsPlumbInstance.registerEndpointTypes({
	  "foreign":{         
			paintStyle: {fill:"blue", outlineStroke:"black", outlineWidth:1},
	        endpointHoverStyle: {fill:"red"},
	  },
	  "primary":{          
			paintStyle: {fill:"orange", outlineStroke:"black", outlineWidth:1 },
	        endpointHoverStyle: {fill:"green"}, 
	  },
	});
		
	/* jsPlumbInstance events */
	app.jsPlumbInstance.bind("beforeDrop", function(info) {

		//check if a connection already exists between these two points
		let con=app.jsPlumbInstance.getConnections({source:info.sourceId, target:info.targetId});

		if (con.length>0) {
			logger.log("This Connection already exists, do nothing.");
			//app.jsPlumbInstance.deleteConnection(con[0]);
			utils.bspopup("This connection already exists.");
			return false
		};

		const pkey = jQuery(info.connection.source).attr('fpname').split(".");
		const fkey = jQuery(info.connection.target).attr('ffname').split(".");
		
		//pkey[0] is the table name of the source table
		//pkey[1] is the field name of the source table
		//fkey[0] is the table name of the target table
		//fkey[1] is the field name of the tarbet table
		logger.log('BEFORE_DROP', pkey, fkey);
		
		const sourceTableWithPrimary = dbdesigner.tables[pkey[0]];
		const sourceFieldWithPrimary = dbdesigner.tables[pkey[0]].fields[pkey[1]];
		const targetTableWithForeign = dbdesigner.tables[fkey[0]];
		const targetFieldWithForeign = dbdesigner.tables[fkey[0]].fields[fkey[1]];
		
		if(targetFieldWithForeign.pkRef != null){
			utils.bspopup("The foreign key " + targetTableWithForeign.name + "." + targetFieldWithForeign.name + " is allready referenced by " + sourceTableWithPrimary.name + "." + sourceFieldWithPrimary.name);
			return false;
		};
		
		//do some checks if the connection is valid
		if (sourceTableWithPrimary.name == targetTableWithForeign.name && sourceFieldWithPrimary.name == targetFieldWithForeign.name) {
			utils.bspopup("A field cannot have a reference to itself.");
			return false;
		};
		
		if(sourceTableWithPrimary.name == targetTableWithForeign.name){
			utils.bspopup("Primary key and Foreign key must be in different tables");
			return false;
		};
		
		if(sourceFieldWithPrimary.type != targetFieldWithForeign.type){
			utils.bspopup(sourceTableWithPrimary.name + "." + sourceFieldWithPrimary.name + " and " + targetTableWithForeign.name + "." + targetFieldWithForeign.name + " must have the same type!");
			return false;
		};
		
		
		let isValidConnection = true;
		jQuery.each(targetTableWithForeign.fields, function(fieldId, field) {
			if (targetFieldWithForeign.name !=  field.name && field.pkRef == sourceTableWithPrimary.name + "." + sourceFieldWithPrimary.name){
				//another field of the same table already has a connection to the same primary key in the source table
				utils.bspopup("Redundancy detected! " + sourceTableWithPrimary.name + "." + sourceFieldWithPrimary.name + " already references " + targetTableWithForeign.name + "." + field.name);
				isValidConnection = false;
				return false; // breaks the each loop
			};
		});
		if(!isValidConnection) return false;
		
		//set the reference to the primary field in the foreign field
		targetFieldWithForeign.pkRef = sourceTableWithPrimary.id + "." + sourceFieldWithPrimary.id;
		utils.bsalert({text: sourceTableWithPrimary.name + "." + sourceFieldWithPrimary.name + '->' + targetTableWithForeign.name + "." + targetFieldWithForeign.name, title:"Connection established: "});

		app.updateField(targetTableWithForeign, targetFieldWithForeign);
		
		return true; //return false or just quit to drop the new connection.
	});

	app.jsPlumbInstance.bind("connectionDetached", function(info, originalEvent) {
		
		// Don't do connection detached event if it wasn't caused by a user action
		if (originalEvent == undefined)
			return;
		
		logger.log('Detaching ', info.source, info.target);

		if (jQuery(info.source).attr('fpname') == undefined || jQuery(info.target).attr('ffname')==undefined){
			return;
		};
		
		const pkey = jQuery(info.source).attr('fpname').split(".");
		const fkey = jQuery(info.target).attr('ffname').split(".");
		
		const sourceTableWithPrimary = dbdesigner.tables[pkey[0]];
		const sourceFieldWithPrimary = dbdesigner.tables[pkey[0]].fields[pkey[1]];
		const targetTableWithForeign = dbdesigner.tables[fkey[0]];
		const targetFieldWithForeign = dbdesigner.tables[fkey[0]].fields[fkey[1]];
		
		//delete the reference to the primary field in the foreign field
		targetFieldWithForeign.pkRef = null;
		utils.bsalert({text: sourceTableWithPrimary.name + "." + sourceFieldWithPrimary.name + '->' + targetTableWithForeign.name + "." + targetFieldWithForeign.name, title:"Detached connection: "});

		app.updateField(targetTableWithForeign, targetFieldWithForeign);
	});
}); //jsPlumb.ready

export {app};


