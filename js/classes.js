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
* Classes to hold sqlalchemy Tables and Columns data.
* 
* @author Prahlad Yeri <prahladyeri@yahoo.com>
* @date 2015/06/16
*/

/**
 * Table object to hold the structure of fields and relations.
 * 
 * @param name string Name of the table.
 * @return The created table object.
 * */
var Table = function(name) 
{
	if (name != undefined) {
		this.name = name;
		console.log('name set');
	}
	else {
		throw 'Table name undefined';
	}
	this.fields = {};
	this.position = {};
	return this;
};

Table.prototype.name = "Unnamed";
Table.prototype.position = {x:0,y:0}; //x,y coordinates on the canvas
Table.prototype.fields = {}; //dict of String:Field objects

/**
* Field object constructor.
* 
* @param name Name of the field.
* @param type Data Type of the field.
* @param unique Boolean Indicates whether field is unique.
* @param primary Boolean Indicates whether this is a primary key
*/
var Field = function(obj) {
	
	if (obj != undefined) {
		this.updateFromObject(obj);
	}

	return this;
};

Field.prototype.name = "Unnamed";
Field.prototype.type = "";
Field.prototype.size = 0;
Field.prototype.unique = false;
Field.prototype.primaryKey = false;
Field.prototype.notNull = false;
Field.prototype.defaultValue = null;
Field.prototype.foreign = null; //for primary only: the name[s] of fields that refer to this primary key.
Field.prototype.ref = null; //for non-primary only: the name[s] of primary key field in another table that this refers to.

Field.prototype.updateFromObject = function(obj) {

	if (obj.name) this.name = obj.name;
	if (obj.type) this.type = obj.type;
	if (obj.size) this.size = obj.size;
	if (obj.unique) this.unique = obj.unique;
	if (obj.primaryKey) this.primaryKey = obj.primaryKey;
	if (obj.notNull) this.notNull = obj.notNull;
	if (obj.defaultValue) this.defaultValue = obj.defaultValue;
	if (obj.foreign) this.foreign = obj.foreign;
	if (obj.ref) this.ref = obj.ref;
	//TODO: Remember to add any new attributes here, so canvas loads properly.
};
