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

import {utils} from "./utils.js";
import {Table, Field} from "./classes.js";
import {app} from "./app.js";
import {Logger} from "./js-log.js";
import {datetimepicker} from "./datepicker.js";



const logger = Logger.getClassLogger("TableDialog");

/**
* The TableDialog adds or edits Tables.
*/
class TableDialog {
	/**
	 * Shows the TableDialog as a modal form.
	 * @param tableId The id of the table. If an empty string was passed a new table is generated
	 * @param mode add or edit
	 */
	runTableDialog(tableId, mode) 
	{
		if (jQuery(dbdesigner.namespaceWrapper + "#tableDialog").length == 0) {
			jQuery(dbdesigner.namespaceWrapper + "#holder").load(dbdesigner.context + "assets/partials/tableDialog.html", (data, success, dataType) => {
				logger.log("LOADED THE tableDialog!");
				
				jQuery(dbdesigner.namespaceWrapper + "#tableDialog").on('shown.bs.modal', function(e) {
					//do this every time when the modal is shown
					jQuery(this).find("[autofocus]:first").focus();
				});
				
				jQuery(dbdesigner.namespaceWrapper + "#tableDialog").on('hidden.bs.modal', function (e) {
					//because the default type is Text, we hide and disable the datepicker
					//when the modal is closed
					datetimepicker.hide();
				});
				
				jQuery(dbdesigner.namespaceWrapper +  "#tableDialog").on('keyup',function(e) {
				    if(e.which == 13) {
				    	jQuery(dbdesigner.namespaceWrapper + "#tableDialog #addField").trigger("click");   
				    }
				});	
				
				datetimepicker.init(jQuery(dbdesigner.namespaceWrapper + "#datetimepicker1"), jQuery(dbdesigner.namespaceWrapper + "#datepickerButton"), jQuery(dbdesigner.namespaceWrapper + "#fieldDefault"));
				
				app.jsPlumbInstance.draggable(jQuery(dbdesigner.namespaceWrapper + "#tableDialog"));
				
				this.runTableDialog(tableId, mode); //recursive call if not loaded before
			});
			return;
	    };
	    
	    //table will be undefined if not existing
	    let table = dbdesigner.tables[tableId];
		
		jQuery(dbdesigner.namespaceWrapper + "#tableDialog #tableName").val((table ? table.name : ""));
		jQuery(dbdesigner.namespaceWrapper + "#tableDialog #tableId").val((table ? table.id : ""));
		jQuery(dbdesigner.namespaceWrapper + "#tableDialog #editMode").val(mode);
		jQuery(dbdesigner.namespaceWrapper + "#tableDialog .fieldRow").remove();
		
		if (mode=='edit') {
			jQuery(dbdesigner.namespaceWrapper + "#tableDialog").find(".modal-title").text("Edit Table '" + table.name + "'");
			
			jQuery.each(table.fields, (key, val) =>{
				
				// Load the field values into the dialog
				jQuery(dbdesigner.namespaceWrapper + "#fieldName").val(val.name);
				jQuery(dbdesigner.namespaceWrapper + "#fieldId").val(val.id);
				jQuery(dbdesigner.namespaceWrapper + "#fieldType").val(val.type);
				jQuery(dbdesigner.namespaceWrapper + "#fieldSize").val(val.size);
				jQuery(dbdesigner.namespaceWrapper + "#fieldDefault").val(val.defaultValue);
				jQuery(dbdesigner.namespaceWrapper + "#fieldPrimary").prop("checked", val.primaryKey);
				jQuery(dbdesigner.namespaceWrapper + "#fieldUnique").prop("checked", val.unique);
				jQuery(dbdesigner.namespaceWrapper + "#fieldNotNull").prop("checked", val.notNull);

				// Add row to the table inside the tableDialog.html. No validation needed.
				this.addField(true);
			});
		}else{
			jQuery(dbdesigner.namespaceWrapper + "#tableDialog").find(".modal-title").text("Add Table");
		};
		
		jQuery(dbdesigner.namespaceWrapper + "#tableDialog").modal({
			  keyboard: false,
			  backdrop: "static",
		});
	}; //runTableDialog

	
	/**
	* Creates a new field and adds it to the tableDialog.
	* Either called from the input boxes of the Dialog ("Add Field" Button) or when a table  is loaded from the canvas.
	* @param isLoading If true no validation is performed. This only happens if we load the table data from the canvas.
	* If the "Add Field" button of the dialog is clicked, Validation will be done.
	* @see runTableDialog()
	*/
	addField(isLoading){
		const logger = Logger.getFunctionLogger("TableDialog", "addField");
		
		const $fieldName = jQuery(dbdesigner.namespaceWrapper + "#fieldName");
		const $fieldId = jQuery(dbdesigner.namespaceWrapper + "#fieldId");
		const $fieldSize = jQuery(dbdesigner.namespaceWrapper + "#fieldSize");
		const $fieldDefault = jQuery(dbdesigner.namespaceWrapper + "#fieldDefault");
		const $fieldType = jQuery(dbdesigner.namespaceWrapper + "#fieldType");
		const $fieldPrimary = jQuery(dbdesigner.namespaceWrapper + "#fieldPrimary");
		const $fieldUnique = jQuery(dbdesigner.namespaceWrapper + "#fieldUnique");
		const $fieldNotNull = jQuery(dbdesigner.namespaceWrapper + "#fieldNotNull");
		
		const isPrimary = $fieldPrimary.is(':checked');
		const isUnique = $fieldUnique.is(':checked');
		const isNotNull = $fieldNotNull.is(':checked');
		const fieldDefault = $fieldDefault.val();
		
		logger.log("Adding field: " + $fieldName.val().trim());

		if(!isLoading){
			let sizeValid = true;
			if ($fieldType.val() == "Text"){
				const fieldSize = parseInt($fieldSize.val());
				sizeValid = (fieldSize > 0 && fieldSize <= 65535);
				$fieldSize.val(Math.round(fieldSize));
			}else{
				$fieldSize.val(0);
			};
			
			if ($fieldName.val().trim() == "") {
				utils.bsalert({text:"Field name cannot be blank.",type:"danger", delay: 0});
				return;
			}else if ($fieldName.val().indexOf(" ")>=0) {
				utils.bsalert({text:"Field name cannot contain a special character or space.", type:"danger", delay: 0});
				return;
			}else if (!sizeValid) {
				utils.bsalert({text:"Not a valid size Must be (1 - 65535).", type:'danger', delay: 0});
				return;
			}else if (jQuery("#" + $fieldName.val() +".fieldRow" ).length > 0) {
				utils.bsalert({text:"A field with this name already exists.", type:"danger", delay: 0});
				return;
			}else if($fieldDefault.val() !=""){
				//check if types are matching
				if(!this.checkType($fieldType.val(), $fieldDefault.val())){
					utils.bsalert({text:"The default value doesn't match with the fields type.", type:"danger", delay: 0});
					return;
				};
			}else if(isPrimary){
				//only one primary key is allowed
				const $fields = jQuery(dbdesigner.namespaceWrapper + "#tableDialog #tableDialogTable");
				let hasPrimaryKey = false;
				jQuery.each($fields.find(".hfieldPrimary"), function(index) {
					logger.log("primary: " + jQuery(this).text());
					if (jQuery(this).text() == "true") {
						utils.bsalert({text:"A Table can have only one primary key.", type:"danger", delay: 0});
						hasPrimaryKey = true;
						return false;
					};
				});
				if (hasPrimaryKey) return;
			};
		}; //isLoading?
		
		//build a new fieldRow
		//if the field was not saved before, the id is not existing. Use the name instead.
		const fieldId = ($fieldId.val() != "" ? $fieldId.val() : $fieldName.val());
		
		let html =	"<tr class='fieldRow' id='" + fieldId + "'>" +
					"<th scope='row' class='fieldName'>" + $fieldName.val() + "</th>" +
					"<td class='fieldType'>" + $fieldType.val() + "</td>";
					
		const size = $fieldSize.val();
		html += "<td class='fieldSize'>" + (size==0 ? "-" : size)  + "</td>";
		
		// Set details column value
		let details  = (isPrimary ? "primary" : "");
		if (isUnique) details = this.joinWithSep(details,"unique",",");
		if (isNotNull) details = this.joinWithSep(details,"not null",",");
		if (fieldDefault != "") {
			details = this.joinWithSep(details, fieldDefault, ',');
		}
		
		html += "<td class='fieldDetails'>" + details  + "</td>";
		html += "<td style='display:none;' class='hfieldId'>" + fieldId  + "</td>";
		html += "<td style='display:none;' class='hfieldSize'>" + size  + "</td>";
		html += "<td style='display:none;' class='hfieldDefaultValue'>" + $fieldDefault.val()  + "</td>";
		html += "<td style='display:none;' class='hfieldPrimary'>" + (isPrimary ? 'true' : '')  + "</td>";
		html += "<td style='display:none;' class='hfieldUnique'>" + (isUnique ? 'true' : '')  + "</td>";
		html += "<td style='display:none;' class='hfieldNotNull'>" + (isNotNull ? 'true' : '')  + "</td>";
		html += "<td class='fieldAction'><button type='button' onclick='dbdesigner.deleteField(\"" + fieldId + "\")' title='Delete Field' style='font-size: 0.75em;' class='btn btn-sm btn-danger'><span class='fas fa-trash-alt'></span></button>";
		html += "<button type='button' onclick='dbdesigner.editField(\"" + fieldId + "\")' title='Edit Field'  style='font-size: 0.75em;' class='btn btn-sm btn-success'><span class='fas fa-edit'></span></button></td>";
		html += "</tr>";
		
		jQuery(dbdesigner.namespaceWrapper + "#tableDialogTable tbody").append(html);
		
		if(!isLoading){
			$fieldName.focus();
			utils.bsalert({text:"The Field '" + $fieldName.val() + "' was successfully added.", type:"success"});			
		};
		
		this.resetNewFieldBoxes();
	}; //addField
	
	
	/**
	 * Saves the fields of a table generated or edited by the tableDialog HTML
	 * When done the table / field is created  / updated in the canvas and the storage
	 */
	saveData() {
		const tableName = jQuery(dbdesigner.namespaceWrapper + "#tableName").val();
		const tableId = jQuery(dbdesigner.namespaceWrapper + "#tableId").val();
		const editMode = jQuery(dbdesigner.namespaceWrapper + "#editMode").val()
		
		//let hasTableNameChanged = false;
		if (jQuery(dbdesigner.namespaceWrapper + ".fieldRow").length==0) {
			utils.bsalert({text:"You must add at least one field.", type:"danger", delay: 0});
			return;
		};
		
		if (!this.validateTableName(tableId, tableName)) {
			return;
		};

		let table;
		
		if (editMode == "add") {
			table = new Table(tableName);
		}else{
			table = dbdesigner.tables[tableId];
			table.name = tableName;
		};
		
		const fieldIds = {};
		const storageActions = [];
		let referencers;
			
		// 1. Loop: check every field that is in the list of fields of the tableDialog
		// This updates or creates fields that are in the fieldRow.
		// If a field is still (not deleted) in the fieldRow, it is marked with true in the fieldId's object.
		jQuery(dbdesigner.namespaceWrapper + ".fieldRow").each(function(index){
			const fieldName = jQuery(this).find(".fieldName").text();
			const fieldId = jQuery(this).find(".hfieldId").text();
			fieldIds[fieldId] = true;
			
			const fieldData = {
				name: fieldName,
				id: fieldId,
				type: jQuery(this).find(".fieldType").text(),
				primaryKey: Boolean(jQuery(this).find(".hfieldPrimary").text()),
				unique: Boolean(jQuery(this).find(".hfieldUnique").text()),
				notNull: Boolean(jQuery(this).find(".hfieldNotNull").text()),
				defaultValue: jQuery(this).find(".hfieldDefaultValue").text(),
				size: parseInt(jQuery(this).find(".hfieldSize").text())
			};
			if (fieldData.defaultValue == "") fieldData.defaultValue = null;
			if (fieldData.id == "") fieldData.id = null;
			
			if (editMode == "edit") {
				if (fieldId in table.fields) {
					//the field already exists and needs to be updated
					logger.info("Field '" + fieldName + "' already exists. Updating field");
					
					if(fieldData.type != table.fields[fieldId].type){
						logger.info("Field '" + fieldName + "' has changed the type!");
						let isTypeChangeIgnored = false;
						
						if(fieldData.primaryKey){
							referencers = table.fields[fieldId].getReferencers(table.id);
							if (referencers.length > 0){
								isTypeChangeIgnored = true;
							};
						};
						
						if(table.fields[fieldId].pkRef != null){
							isTypeChangeIgnored = true;
						};
						
						if(isTypeChangeIgnored){
							fieldData.type = table.fields[fieldId].type;
							utils.bsalert({text:"Type change was ignored because of existing relations!", type:'warning'});
						};
					};
					
					table.fields[fieldId].updateFromObject(fieldData);
					storageActions.push (app.updateField(table, table.fields[fieldId]));
				} else {
					//mode = edit. Create a new instance of Field and add it to an existing table
					table.fields[fieldName] = new Field(fieldData);
					storageActions.push(app.createField(table, table.fields[fieldName]));
				};
			}else{
				//mode = add. Create a new field for a new table. It will be saved with the table later
				table.fields[fieldName] = new Field(fieldData);
			};
		}); //each field in fieldRow
		
		if (editMode == "edit") {
			//2. Loop: Remove any exiting fields that have been deleted (and therefore aren't in fieldIds)
			jQuery.each(table.fields, (fieldId, field) => {
				if (field.id && !(field.id in fieldIds)) {
					if (field.pkEndpoint != null) {
						app.jsPlumbInstance.deleteEndpoint(field.pkEndpoint);
						referencers = field.getReferencers(table.id);
						let referencedTable;
						let referencedField;
						
						for (let i = 0; i < referencers.length; i++) {
							referencedTable = dbdesigner.tables[referencers[i].tableId];
							referencedField = referencedTable.fields[referencers[i].fieldId];
							referencedField.pkRef = null;
							storageActions.push(app.updateField(referencedTable, referencedField));
						};			
					};
					
					app.jsPlumbInstance.deleteEndpoint(field.fkEndpoint);
					delete table.fields[fieldId];
					storageActions.push(app.deleteField(table, field));
				};
			});
		};
		
		jQuery(dbdesigner.namespaceWrapper + "#tableDialog").modal('hide');
		
		
		if (editMode == "add") {
			// a new Table is created and stored together with it's fields
			app.createTable(table)
			.then( () => {
				dbdesigner.tables[table.id] = table;
				
				//table, mode, isLoading
				app.createThePanel(table, editMode, false);
			});
		}else{
			//add the final table update and run all additional promises that have been created during loop 1 and 2.  
			storageActions.push(app.updateTable(table, false));
			
			Promise.all(storageActions)
			.then( () => {
				//When all id's are set, manipulate the data model and create the panal
				dbdesigner.tables[table.id] = table;
				
				//table, mode, isLoading
				app.createThePanel(table, editMode, false);
			});
		};
	}; //saveData
	
	/**Check if a given Tablename is valid
	 * @param ownTableId The id of the table that is checked. Empty string if this is a new table.
	 * @param tableName The (new) name of the table
	 * @return true if the tablename is valid else false
	 */
	validateTableName(ownTableId, tableName) {
		if (tableName == null || tableName.trim() == '') {
			utils.bsalert({text:"You must enter a table name.", type:"danger", delay: 0});
			return false;
		} else if (tableName.indexOf(" ") >= 0) {
			utils.bsalert({text:"Spaces are not allowed in the table name.", type:"danger", delay: 0});
			return false;
		} else{
			let isTableExisting = false;
			jQuery.each(dbdesigner.tables, (tableId, table) =>{
				if(tableName == table.name && tableId != ownTableId){
					isTableExisting = true;
					utils.bsalert({text:"This table name already exists.", type:"danger", delay: 0});
					return false;
				};
			});
			
			return !isTableExisting;
		};
	};


	/**
	 * Join two strings with a separator in between
	 */
	joinWithSep(a, b, separator) {
		if (a.length == 0) {
			return b;
		} else {
			return a + separator + b;
		};
	};

	/**
	 * Reset all elements after a field was added.
	 * @see addField()
	 */
	resetNewFieldBoxes() {
		jQuery(dbdesigner.namespaceWrapper + "#fieldName").val("");
		jQuery(dbdesigner.namespaceWrapper + "#fieldId").val("");
		jQuery(dbdesigner.namespaceWrapper + "#fieldSize").val("255");
		jQuery(dbdesigner.namespaceWrapper + "#fieldSize").removeAttr('disabled');
		jQuery(dbdesigner.namespaceWrapper + "#fieldType").val("Text");
		jQuery(dbdesigner.namespaceWrapper + "#fieldDefault").val('');
		jQuery(dbdesigner.namespaceWrapper + "#fieldPrimary").prop('checked',false);
		jQuery(dbdesigner.namespaceWrapper + "#fieldUnique").prop('checked',false);
		jQuery(dbdesigner.namespaceWrapper + "#fieldNotNull").prop('checked',false);
		datetimepicker.hide();
	};

	
	/**
	 * Edits a existing field. It is deleted first and then can be added again.
	 * @param fieldId The id of the field that will be edited.
	 */
	editField(fieldId){
		logger.log("Editing field: " + fieldId);
		const $fieldRow = jQuery(dbdesigner.namespaceWrapper + "#" + fieldId + ".fieldRow");


		logger.log("Found FieldName=" + $fieldRow.find(".fieldName").text());
		logger.log("fieldId=" + $fieldRow.find(".hfieldId").text());
		logger.log("fieldSize=" + $fieldRow.find(".fieldSize").text());
		logger.log("fieldType=" + $fieldRow.find(".fieldType").text());
		logger.log("fieldDefault=" + $fieldRow.find(".hfieldDefaultValue").text());
		logger.log("fieldPrimary=" + $fieldRow.find(".hfieldPrimary").text());
		logger.log("fieldUnique=" + $fieldRow.find(".hfieldUnique").text());
		logger.log("fieldNotNull=" + $fieldRow.find(".hfieldNotNull").text());
		
		
		if(this.deleteField(fieldId)){
			const oldFieldTypeValue = jQuery('#fieldType').val();
			const newFieldTypeValue = $fieldRow.find(".fieldType").text();
		
			jQuery(dbdesigner.namespaceWrapper + "#fieldName").val($fieldRow.find(".fieldName").text());
			jQuery(dbdesigner.namespaceWrapper + "#fieldType").val(newFieldTypeValue);
			jQuery(dbdesigner.namespaceWrapper + "#fieldSize").val($fieldRow.find(".fieldSize").text());
			jQuery(dbdesigner.namespaceWrapper + "#fieldDefault").val($fieldRow.find(".hfieldDefaultValue").text());
			jQuery(dbdesigner.namespaceWrapper + "#fieldPrimary").prop('checked',Boolean($fieldRow.find(".hfieldPrimary").text()));
			jQuery(dbdesigner.namespaceWrapper + "#fieldUnique").prop('checked',Boolean($fieldRow.find(".hfieldUnique").text()));
			jQuery(dbdesigner.namespaceWrapper + "#fieldNotNull").prop('checked',Boolean($fieldRow.find(".hfieldNotNull").text()));
			jQuery(dbdesigner.namespaceWrapper + "#fieldId").val($fieldRow.find(".hfieldId").text());
			
			if(newFieldTypeValue != oldFieldTypeValue){
				//if the type of the field has changed, we need to change and validate the fieldDefault.
				logger.log("Field Type has changed");
				this.typeHasChanged();
			}
		};
		
	};
	
	/**
	 * Deletes a field from a table or loads it into the dialog to be edited
	 * @param fieldId the id of the field that will be deleted
	 * @see editField()
	 * @see dbdesigner.deleteField()
	 */
	deleteField(fieldId) {
		// Look at original table name.
		const tableId = jQuery(dbdesigner.namespaceWrapper + "#tableId").val();
		
		// If this table isn't new, check for referencers
		if (dbdesigner.tables[tableId] != undefined) {
			const field = dbdesigner.tables[tableId].fields[fieldId];
			if (field != undefined) {
				const referencers = field.getReferencers(tableId);
				if (referencers.length > 0 || field.pkRef != null) {
					utils.bsalert({text:"If you save this changes existing relations will be deleted!", type:'danger'});
				};
			};
		};
		
		jQuery(dbdesigner.namespaceWrapper + "#" + fieldId).remove();
		return true;
	}	
	
	/**
	 * As valid default values for fields depend on the type of the field, this function determines which default values 
	 * can be entered each time the type changes. It toggles the datepicker to accept appropriate values and checks if they are valid.
	 * @see editField()
	 */
	typeHasChanged(){
		const fieldTypeValue = jQuery(dbdesigner.namespaceWrapper + "#fieldType").val();
		const $fieldDefault = jQuery(dbdesigner.namespaceWrapper + "#fieldDefault");
		let fieldDefaultValue = $fieldDefault.val();
		
		//disable the size if not type = Text
		if (fieldTypeValue !='Text'){
			jQuery(dbdesigner.namespaceWrapper + "#fieldSize").val("");
			jQuery(dbdesigner.namespaceWrapper + "#fieldSize").attr('disabled',true);
		} else {
			jQuery(dbdesigner.namespaceWrapper + "#fieldSize").removeAttr('disabled');
		};
		
		//Only Date and DataTime require the datepicker to be used
		if(fieldTypeValue != "Date" && fieldTypeValue != "DateTime" ){
			datetimepicker.hide();
		}else{
			//if Date or DateTime enable the datepicker and select the right format for the datepicker
			datetimepicker.show()
			
			let format;
			if(fieldTypeValue == "Date"){
				format = "L"; //date only
			}else{
				format = "L LT"; //local date & time
			};
			
			datetimepicker.set('format', format);
		};
		
		if(!this.checkType(fieldTypeValue, fieldDefaultValue)){
			//the value of the default value is not valid. Don't set it
			fieldDefaultValue = undefined;
			$fieldDefault.val("");
		};
		
		//set the type of the input dependent on the type
		switch(fieldTypeValue){
		case "Text": 
			$fieldDefault.prop('type','text');
			if(fieldDefaultValue) $fieldDefault.val(fieldDefaultValue);
			break;
		case "Integer": 
			$fieldDefault.prop('type','number');
			if(fieldDefaultValue) $fieldDefault.val(fieldDefaultValue);
			break;
		case "Float": 
			$fieldDefault.prop('type','number');
			if(fieldDefaultValue) $fieldDefault.val(fieldDefaultValue);
			break;
		case "Date":
		case "DateTime": 
			$fieldDefault.prop('type','text');
			if(fieldDefaultValue) datetimepicker.set('date', fieldDefaultValue); 
			break;
		}
	};
	
	/**
	 * Checks if entered values are of a valid type.
	 * @param type the type as String (Text, Integer, Float, Date, DateTime)
	 * @param value the value (passed as a String) to check against the type
	 * @see tableDialog.typeHasChanged()
	 * @return true if value if of the given type, false otherwise.
	 */
	checkType(type, value){
		switch(type){
		case "Text":
			//this should always return true because values of input are string by default
			return (typeof value === 'string' || value instanceof String)
			break;
		case "Integer": 
			if (isNaN(value)) return false;
			var number =  Number(value);
			return  number % 1 === 0;; 
			break;
		case "Float": 
			if (isNaN(value)) return false;
			var number =  Number(value);
			return  number % 1 !== 0;; 
			break;
		case "Date":
		case "DateTime":
			//a Date or DateTime should be of the same format the datepicker uses!
			const datepickerFormat = datetimepicker.get('format'); 
			logger.log ("datepickerFormat is " + datepickerFormat);
			
			const date = moment(value, datepickerFormat).toDate(); //converts the string into a javascript date
			return typeof date.getMonth === 'function'; //only if the conversion was successful we have a real Date Object
			break;
		};
	};
}; //class tableDialog

const tableDialog = new TableDialog;
export {tableDialog};
