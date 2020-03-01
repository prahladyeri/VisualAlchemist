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

import {app} from "./app.js";
import {tableDialog} from "./tableDialog.js";
import {CodeGenerator} from "./codeGenerator.js";
import {utils} from "./utils.js";
import {Logger} from "./js-log.js";

const logger = Logger.getClassLogger("DBDesigner");

/**
 * An interface to the App, used in the HTML Pages:
 * index, tableDialog, resultsDialog, table and bootui HTML
 * Also provides global properties that are needed by various modules
 */
class DBDesigner{
    constructor(context, namespaceWrapper) {
    	this.tables = {};
     	this.version = "2.0.0"; //TODO: Remember to automate this.
    	this.context = context;
    	this.namespaceWrapper = namespaceWrapper + " ";
    	this.codeGenerator = new CodeGenerator(this.context);
    	this.app = app;
    };

	/*
	 * Shows popUps called from the Main Page
	 */
	showBsPopup(options){
		utils.bspopup(options);
	};
	
	/*
	 * Shows the Help Popup. Called from the Main Page
	 */
	showBsHelp(){
		utils.bshelp(app.isStorageReady);
	};
	
	/*
	 * Shows the tableDialog. Called from the Main Page
	 */
	showTableDialog(){
		tableDialog.runTableDialog("", "add");
	};
	
	/*
	 * Shows the code generation Dialog. Called from the Main Page
	 */
	showResultsDialog(){
		this.codeGenerator.showResultsDialog();
	};
	
	/*
	 * Adds a field to a table. Called from the tableDialog HTML
	 */
	addField(){
		tableDialog.addField();
	};
	
	/**
	 * Deletes a field from a table in edit mode. Called from fields that are inserted by tableDialog
	 * @param fieldId the field that will be deleted
	 * @see tableDialog.addField()
	 * @see tableDialog.tryToDelete(fieldId)
	 */
	deleteField(fieldId){
		tableDialog.deleteField(fieldId);
	};
	
	/**
	 * Edits a field from a table in edit mode. Called from fields that are inserted by tableDialog
	 * @param fieldId the field that will be edited
	 * @see tableDialog.addField()
	 * @see tableDialog.editField(fieldId)
	 */
	editField(fieldId){
		tableDialog.editField(fieldId);
	};
	
	/**
	 * Called from the tableDialog if the type of the field has changed. Just a stub for tableDialog.typeHasChanged.
	 * @see tableDialog.typeHasChanged()
	 */
	typeHasChanged(){
		tableDialog.typeHasChanged();
	};
	
	/*
	 * Saves the date from the tableDialog HTML
	 */
	saveData(){
		tableDialog.saveData();
	};
	
	/*
	 * Select the code that was generated. Called from the resultsDialog HTML
	 */
	selectText(element){
		utils.selectText(element);
	};
	
	/*
	 * deletes a Table. Called from the table HTML
	 */
	deleteTable(tableId){
		utils.bspopup({
			title: "Delete Table",
	        text: "Sure you want to delete table '" + this.tables[tableId].name + "' along with all it's relations?",
	        button1: {text: "Yes", type: "btn-danger"},
	        button2: "No",
	        success: (event) =>{
	            if (event.button == "button1") {
	                app.deleteTable(this.tables[tableId]);
	            	delete this.tables[tableId];
	                app.jsPlumbInstance.empty("tblDiv" + tableId);
	                jQuery("#tblDiv" + tableId).remove();
	            };
	        }
	    });
	};
	
	/*
	 * edits a Table. Called from the table HTML
	 */
	editTable(tableId){
		tableDialog.runTableDialog(tableId, "edit");
	};
	
	/*
	 * Download the json of the current canvas (the tables). Called from the main page
	 */
	exportCanvas(){
		if (Object.keys(this.tables).length == 0) {
			utils.bspopup({text:'No tables to export.'});
			return;
		};
		utils.downloadSomeText(JSON.stringify(app.getAppData()), 'canvas.json');
	};
	
	/*
	 * import the json for the canvas. Called from the main page
	 */
	importCanvas(){
		logger.log('IMPORT_CANVAS');
		const file = jQuery('#inputCanvasFile')[0].files[0];
	
		const fr = new FileReader();
		fr.readAsText(file);
		fr.onload = (ev) => {
			//the result now is the imported JSON
			logger.log(ev.target.result);
			//load and save the canvas
			app.loadCanvasState(JSON.parse(ev.target.result), true);
		}
		fr.onerror = function (ev) {
	        logger.error("error reading file");
	    }
		jQuery("#inputCanvasFile").val("");
	};
	
	/*
	 * Delete all tables from the canvas.  Called from the main page
	 */
	eraseCanvasState(){
		utils.bspopup({
			title: "Delete all Tables",
	        text: "All your tables will be erased so you can start over. Is this OK?",
	        button1: {text: "Yes", type: "btn-danger"},
	        button2: "No",
	        success: (event) =>{
	            if (event.button == "button1") {
					// Erase tables from the canvas
					app.clearCanvas();
	            };
	        },
	    });
	};
}; //class DBDesigner

export {DBDesigner};
