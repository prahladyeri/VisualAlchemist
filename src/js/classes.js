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


/**
 * Table class to hold the structure of fields and relations.
 * 
 * @param name string Name of the table.
 * @export The created table object.
 * */
class Table{
    constructor(name) {
    	if (name != undefined) {
    		this.name = name;
    	}
    	else {
    		throw 'Table name undefined';
    	};
    	
    	this.fields = {};
    	this.position = {x:'0px',y:'0px'}; //x,y coordinates on the canvas;
    	this.id = null;
    	this.panzoom = null;
    }
	
    toJSON () {
		return {
			id: this.id,
			name: this.name,
			fields: this.fields,
			position: this.position,
		};
	};
};

/**
* Field class.
* 
* @param field Object of type field. If passed then the field is copied from this object
*/
class Field{
	constructor(field){
		this.tableId = null;
		this.name = "Unnamed";
		this.id = null;
		this.type = "";
		this.size = 0;
		this.unique = false;
		this.primaryKey = false;
		this.notNull = false;
		this.defaultValue = null;
		this.pkRef = null; //for non-primary only: the name[s] of primary key field[s] in another table that this refers to.
		this.fkEndpoint = null;
		this.pkEndpoint = null;
		
		if (field != undefined) {
			this.updateFromObject(field);
		};
	}
	
	/**
	 * Takes an object with the properties of an existing field and copies the properties to the instance
	 * @param field A object of the type field
	 */
	updateFromObject(field){
		if (field.tableId) this.tableId = field.tableId;
		if (field.name) this.name = field.name;
		if (field.id) this.id = field.id;
		if (field.type) this.type = field.type;
		if (field.size) this.size = field.size;
		if (field.unique) this.unique = field.unique;
		if (field.primaryKey) this.primaryKey = field.primaryKey;
		if (field.notNull) this.notNull = field.notNull;
		if (field.defaultValue) this.defaultValue = field.defaultValue;
		if (field.pkRef) this.pkRef = field.pkRef; // this one is currently unused
		//TODO: Remember to add any new attributes here, so canvas loads properly.
	};
	
    /** Get a list of all fields that reference this (primary) field. Note: this should only work for primary keys.
     * @param tableName The name of the table this field belongs to.
     * @return An array with all of the fields that reference to a private key. Every entry has the form "{tableName: tableName, fieldName: fieldName"}
     */
	getReferencers(tableId) {
		const result = [];
		const thisField = tableId + "." + this.id;

		jQuery.each(dbdesigner.tables, function(tableId,table) {
			jQuery.each(table.fields, function(fieldId,field) {
				if (field.pkRef == thisField) {
					result.push({tableId: table.id, fieldId: field.id});
				};
			}.bind(this));
		}.bind(this));
		
		return result;
	};
	
	/**
	 * Override toJSON so that the endpoints aren't included (which would lead to circular reference error and larger JSON)
	 */
	toJSON () {
		return {
			tableId: this.tableId,
			id: this.id,
			name: this.name,
			type: this.type,
			size: this.size,
			unique: this.unique,
			primaryKey: this.primaryKey,
			notNull: this.notNull,
			defaultValue: this.defaultValue,
			pkRef: this.pkRef,
		};
	};
}; //class Field


/**
 * UNUSED!
 */
/*
String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
 };
*/

//Created by Prahlad Yeri after getting inspired by above two
String.prototype.format = function(placeholders) {
	if (jQuery.isArray(placeholders)) {
		const args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
		  return typeof args[number] != 'undefined'
			? args[number]
			: match
		  ;
		});
	}
	else { //Object
		let s = this;
		for(let propertyName in placeholders) {
			const re = new RegExp('{' + propertyName + '}', 'gm');
			s = s.replace(re, placeholders[propertyName]);
		}    
		return s;
	}
};


/**
 * UNUSED!
 */
/*if (!String.prototype.capitalize) {
	String.prototype.capitalize =  function() { 
		return this.replace(/^./, function(match){return match.toUpperCase()} );
	}
}
*/
/**
 * jQuery extension function to center screen
 * UNUSED!
 */
/*jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, ((jQuery(window).height() - jQuery(this).outerHeight()) / 2) + 
                                                jQuery(window).scrollTop()) + "px");
    this.css("left", Math.max(0, ((jQuery(window).width() - jQuery(this).outerWidth()) / 2) + 
                                                jQuery(window).scrollLeft()) + "px");
    return this;
}*/
export {Table, Field};