/**
* @brief Classes to hold sqlalchemy Tables and Columns data
* @author Prahlad Yeri
* @copyright MIT License
* @date 2015/06/16
*/
var Table = function(name) {
	if (name != undefined) {
		this.name = name;
		console.log('name set');
	}
	else {
		this.name='Unnamed';
		console.log('name undefined');
	}
	
};
var Field = function(){
};

Table.prototype.name = "Unnamed";
Table.prototype.fields = {}; //dict of String:Field objects

Field.prototype.name = "Unnamed";
Field.prototype.type = "";
Field.prototype.size = 0;
Field.prototype.unique = false;
Field.prototype.primaryKey = false;
Field.prototype.references = "";
Field.prototype.defaultValue = null;
Field.prototype.foreign = null; //for primary only: the name[s] of fields that refer to this primary key.
Field.prototype.ref = null; //for non-primary only: the name[s] of primary key field in another table that this refers to.


/**
* @brief Add new Field object to this table.
* @param name Name of the field.
* @param type Data Type of the field.
* @param unique Boolean, Indicates whether field is unique.
* @param primary Boolean, Indicates whether this is a primary key
* @param references Name of the tablename.field which this key references, blank otherwise.
*/
Table.prototype.addField = function(obj) {
	if (obj.unique==undefined) obj.unique=false;
	if (obj.primaryKey==undefined) obj.primaryKey=false;
	if (obj.references==undefined) obj.references=null;
	if (obj.defaultValue==undefined) obj.defaultValue=null;
	c = new Field();
	c.name = obj.name;
	c.type = obj.type;
	c.size = obj.size;
	c.unique = obj.unique;
	c.primaryKey = obj.primaryKey;
	c.references = obj.references;
	c.defaultValue = obj.defaultValue;
	//console.log(name);
	this.fields[c.name] = c;
}