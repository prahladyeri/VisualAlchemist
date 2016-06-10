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
		this.name='Unnamed';
		console.log('name undefined');
	}
	this.fields=new Object();
	this.position = new Object();
	return this;
};

/**
* Field object constructor.
* 
* @param name Name of the field.
* @param type Data Type of the field.
* @param unique Boolean Indicates whether field is unique.
* @param primary Boolean Indicates whether this is a primary key
*/
var Field = function(obj) {
	if (obj.unique==undefined) obj.unique=false;
	if (obj.primaryKey==undefined) obj.primaryKey=false;
	//if (obj.references==undefined) obj.references=null;
	if (obj.defaultValue==undefined) obj.defaultValue=null;
	//c = new Field();
	this.name = obj.name;
	this.type = obj.type;
	this.size = obj.size;
	this.unique = obj.unique;
	this.primaryKey = obj.primaryKey;
	//c.references = obj.references;
	this.defaultValue = obj.defaultValue;
	//console.log(name);
	//this.fields[c.name] = c;
	return this;
};

Table.prototype.name = "Unnamed";
Table.prototype.position = {x:0,y:0}; //x,y coordinates on the canvas
Table.prototype.fields = {}; //dict of String:Field objects

Field.prototype.name = "Unnamed";
Field.prototype.type = "";
Field.prototype.size = 0;
Field.prototype.unique = false;
Field.prototype.primaryKey = false;
//Field.prototype.references = "";
Field.prototype.defaultValue = null;
Field.prototype.foreign = null; //for primary only: the name[s] of fields that refer to this primary key.
Field.prototype.ref = null; //for non-primary only: the name[s] of primary key field in another table that this refers to.


/*Table.prototype.addField = function(obj) {
}*/
