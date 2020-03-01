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

import {Logger} from "./js-log.js";
import {Table, Field} from './classes.js';

const logger = Logger.getClassLogger("LocalStorage");

/**
 * Uses the local storage to store the application data.
 * The data is stored as JSON string.
 */
class Storage{
    constructor() {
    	this.storageKey = "dbdesigner";
	 	this.asyncLocalStorage = {
 		    setItem: (key, value) => {
 		        return Promise.resolve().then( () => {
 		            return localStorage.setItem(key, value);
 		        });
 		    },
 		    removeItem: (key) => {
 		        return Promise.resolve().then( () => {
 		        	return localStorage.removeItem(key);
 		        });
 		    },
 		    getItem: (key) =>{
 		        return Promise.resolve().then( () => {
 		        	return localStorage.getItem(key);
 		        });
 		    },
 		};
    };
    
    /**
     * Checks if the local storage is available.
     * If yes, the application data is initialized if necessary.
     * @return A Promise that is resolved with true if the storage is available.
     */
    isReady(){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((json) =>{
    		if(json == null){
		    	logger.log("Initializing dbdesigner storage with {zoom: 1, strTables: {}}");
		    	return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify({zoom: 1, strTables: {}}));
     		}else{
     			return true;
     		};
    	}).then(() =>{
    		return true;
    	}).catch((err) =>{
    		  logger.error(err);
    		  return false;
    	}); 
    };
    
    /**
     * Stores a value in the local storage
     * @param appData An object of the form {zoom: currentZoom, strTables: dbdesigner.tables}
     * @return A Promise that is resolved when the value was actually set
     */
    set(appData){
    	return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData));    	
    };
    
    /**
     * Gets a value from the local storage.
     * @return A Promise that is resolved with the application data object when the value was retrieved
     */
    get(){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) =>{
    		return JSON.parse(jsonString);
    	});
    };
    
    /**
     * Removes all data from the local storage
     * @param completely If true the whole key is removed from the local storage
     * @return A Promise that is resolved when the data was removed.
     */
    remove(completely){
    	if(completely){
        	return this.asyncLocalStorage.removeItem(this.storageKey);
    	}else{
        	return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify({zoom: 1, strTables: {}}));
    	};
    };
    
    /**
     * Adds a new table to the storage including the fields of the table. 
     * IMPORTANT: New tables and field are instantiated with their name. But for renaming them it is necessary
     * to have an Id for the object. Therefore all objects are replaced, enhanced and stored with unique id's.
     * @param table The table that must be created
     * @return A Promise that is resolved when the table was created.
     */
    createTable(table){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) => {
    		let appData =  JSON.parse(jsonString);
    		//get a unique id for the table
    		const tableId = this.idGenerator(appData.strTables, table);
    		table.id = tableId;
    		appData.strTables[tableId] = new Table(table.name);
    		appData.strTables[tableId].id = table.id;
    		appData.strTables[tableId].name = table.name;
    		appData.strTables[tableId].position = table.position;
    		appData.strTables[tableId].fields = {};
    		
    		let fieldId;
    		Object.keys(table.fields).forEach( (field) => {
    			table.fields[field].tableId = tableId;
    			//get a unique id for the field
    			fieldId = this.idGenerator(appData.strTables, table.fields[field]);
    			
    			table.fields[fieldId] = new Field(table.fields[field]);
    			table.fields[fieldId].id = fieldId;
    			table.fields[fieldId].tableId = table.id;
    			delete table.fields[field];
    			
    			appData.strTables[tableId].fields[fieldId] = table.fields[fieldId];
     		});
     		
    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
    	});
    };
    
    /**
     * Updates an existing table in storage
     * @param table The table that must be updated
     * @param updateFields Is ignored by this kind of storage
     */
    updateTable(table, updateFields){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) =>{
    		let appData =  JSON.parse(jsonString);
    		appData.strTables[table.id] = table;
    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
    	});
    	
    };
    
    /**
     * Deletes an existing table from storage
     * @param table The table that must be deleted
     * @return A Promise that is resolved when the table was deleted.
     */
    deleteTable(table){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) =>{
    		let appData =  JSON.parse(jsonString);
    		delete appData.strTables[table.id];
    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
    	});
     };
    
     /**
      * Creates a new field for an existing table in the storage
      * IMPORTANT: New fields are instantiated with their name. But for renaming them it is necessary
      * to have an Id for the field. Therefore the field is replaced, enhanced and stored with a unique id.
      * @param table The table that contains the field
      * @param field The field that will be created
      * @return A Promise that is resolved when the field was created.
      */
    createField(table, field){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) => {
    		let appData =  JSON.parse(jsonString);
    		field.tableId = table.id;
    		const fieldId = this.idGenerator(appData.strTables, field)
 
		    table.fields[fieldId] = new Field(field);
			table.fields[fieldId].id = fieldId;
			table.fields[fieldId].tableId = table.id;
			delete table.fields[field.name];
    			
			appData.strTables[table.id].fields[fieldId] = table.fields[fieldId];

    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
     	});
    };
    
    /**
     * Updates an existing field in the storage
     * @param table The table that contains the field
     * @param field The field that will be updated
     * @return A Promise that is resolved when the field was updated.
     */
    updateField(table, field){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) =>{
    		let appData =  JSON.parse(jsonString);
    		appData.strTables[table.id].fields[field.id] = field;
    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
    	});
    };
    
    /**
     * Deletes an existing field from the storage
     * @param table The table that contains the field
     * @param field The field that will be deleted
     * @return A Promise that is resolved when the field was deleted.
     */
    deleteField(table, field){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) =>{
    		let appData =  JSON.parse(jsonString);
    		delete appData.strTables[table.id].fields[field.id];
    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
    	});
    };
    
    /**
     * Updates the current zoom factor in the storage
     * @param zoom The current zoom factor
     * @return A Promise that is resolved when the zoom factor was updated.
     */
    updateZoom(zoom){
    	return this.asyncLocalStorage.getItem(this.storageKey)
    	.then((jsonString) =>{
    		let appData =  JSON.parse(jsonString);
    		appData.zoom = zoom;
    		return this.asyncLocalStorage.setItem(this.storageKey, JSON.stringify(appData)); 
    	});
    	
    };
    
    /**
     * Generates a unique Id for a table or a field.
     * @param tables The existing tables
     * @param object A table or a field that needs a unique id.
     * @return A unique Id for a table or a field.
     */
    idGenerator(tables, object){
		let count = 0;
   		let objectId = object.name +"_" + count;
    	let collection;
   		if(object instanceof Table){
    		collection = tables;
    	}else{
    		collection = tables[object.tableId].fields
     	};
     	
		while(collection[objectId]){
			count += 1;
			objectId = object.name +"_" + count;
		};
		
		return objectId
    };
};

const storage = new Storage();
export {storage};