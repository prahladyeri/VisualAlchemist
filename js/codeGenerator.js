var ORMSQLAlchemy = function(templateDir) {

	 this.template = templateDir+"sqlalchemy.py";
	 
	 this.generateCode = function(tables) {
		var code = '';
		
		 $.each(tables, function(tableName, table) {
			code += "class " + table.name + "(Base):\n";
			code += "\t" + "__tablename__ = \"" + table.name + "\"\n";
			$.each(table.fields, function(fieldName, field){
				//embed quotes if they don't already exist
				if (field.type=='Text' || field.type=='String') {
					if (field.defaultValue!=null) {
						var sdef = field.defaultValue;
						if (sdef.indexOf('"') !=0) field.defaultValue = '"' + sdef;
						if (sdef.lastIndexOf('"') != sdef.length-1 || sdef.lastIndexOf('"')==-1) field.defaultValue += '"';
					}
					// Default text size is 255 if user didn't specify a size
					if (field.size==0) {
						field.size = 255;
					}
				}
				
				code += "\t" + field.name + " = Column(" 
				+ field.type + (field.size==0 ? '' : '(' + field.size + ')')
				+ (field.ref != null ? ", ForeignKey('" + field.ref + "')" : "")
				+ (field.primaryKey ? ", primary_key=True" : "")
				+ (field.unique ? ", unique=True" : "")
				+ (field.notNull ? ", nullable=False" : "")
				+ (field.defaultValue!=null ? ", default=" + field.defaultValue : "")
				+ ")\n";
			});
			code += "\n";
		});

		return code;
	}
}

var MySQL = function(templateDir) {
	var rawTypes = 
	{'Text': 'varchar',
	 'Integer': 'int',
	 'Float': 'float'};
	this.template = templateDir+"mysql.sql";
	
	// Add foreign key constraint after running CREATE TABLE statement?
	this.deferForeignKeys = true;
	
	this.generateCode = function(tables) {
	
		var code = '';
		var constraints = [];
		$.each(tables, function(tableName, table) {
			code += "create table " + table.name + "\n(\n";
			
			var primaryFields = [];
			var primaryCount = 0;
			
			// Collect number and names of primary key fields
			$.each(table.fields, function(fieldName, field) {
				if (field.primaryKey) {
					primaryFields.push(field.name);
					primaryCount += 1;
				}
			});
			
			var fieldCode = [];
			
			$.each(table.fields, function(fieldName, field)
			{
				if (field.type=='Text' || field.type=='String') {
					//embed quotes if they don't already exist
					if (field.defaultValue!=null) {
						var sdef = field.defaultValue;
						if (sdef.indexOf('"') !=0) field.defaultValue = '"' + sdef;
						if (sdef.lastIndexOf('"') != sdef.length-1 || sdef.lastIndexOf('"')==-1) field.defaultValue += '"';
					}
					
					// Default text size is 255 if user didn't specify a size
					if (field.size==0) {
						field.size = 255;
					}
				}
				
				fieldCode.push("\t" + field.name + " " + rawTypes[field.type] + (field.size==0 ? '' : '(' + field.size + ')')
				+ (field.notNull ? " not null" : "")
				+ (field.primaryKey && primaryCount == 1 ? " primary key" : "")
				+ (field.unique ? " unique" : "")
				+ (field.defaultValue!=null ? " default " + field.defaultValue  : ""));
				
				// If this field has any references to other fields 
				if (field.ref!=null) 
				{
					// add any constraints placed by raw formats like mysql and postgres.
					// save constraints in an array (they are added after all tables have been created)
					constraints.push(this.generateFKConstraint(table.name, field.name, field.ref.split(".")[0], field.ref.split(".")[1]));
				}
			}.bind(this));
			
			
			// Add multi-field primary key if needed
			if (primaryCount > 1) {
				fieldCode.push("\tprimary key (" + primaryFields.join(', ') + ")");
			}
			
			// Add foreign key lines now if needed
			if (!this.deferForeignKeys) {
				fieldCode = fieldCode.concat(constraints);
				constraints = [];
			}
			
			// Add all the lines for declaring fields, primary keys, and FKs (if needed)
			code += fieldCode.join(",\n")+"\n);\n";
			
		}.bind(this));

		// If foreign keys have to come after everything else, add them here
		if (this.deferForeignKeys) {
			code += constraints.join("\n");
		}
	
		return code;
	}
}

MySQL.prototype.generateFKConstraint = function(firstTableName, firstTableFields, secondTableName, secondTableFields) {
	return "alter table " + firstTableName + " add constraint fk_" + firstTableName +  "_" + firstTableFields 
			+  " foreign key (" + firstTableFields +  ") references " + secondTableName +  "(" + secondTableFields  + ");"
}

// SQLite inherits from MySQL. It's mostly the same syntax, the only difference is that
// MySQL doesn't support ALTER TABLE ADD CONSTRAINT FOREIGN KEY, so FKs have to be added
// as part of the CREATE TABLE statement.
var SQLite = function(templateDir) {
	MySQL.call(this, templateDir);
	
	this.template = templateDir+"sqlite.sql";
	
	// Add foreign key constraint after running CREATE TABLE statement?
	this.deferForeignKeys = false;
}

SQLite.prototype = Object.create(MySQL.prototype);
SQLite.prototype.constructor = SQLite;

SQLite.prototype.generateFKConstraint = function(firstTableName, firstTableFields, secondTableName, secondTableFields) {
	return "\tforeign key (" + firstTableFields +  ") references " + secondTableName +  "(" + secondTableFields  + ")"
}

var codeGenerators = {"ORM/SQLAlchemy": ORMSQLAlchemy, "mysql": MySQL, "sqlite": SQLite};
function generateCode(outputType) {

	var codeGenerator;
	var templateDir = "/assets/templates/";
	
	// Pick code generator based on desired output format
	var codeGenerator = new codeGenerators[outputType](templateDir);
	
	// Combine template with generated code then show the output
	$.get(codeGenerator.template, function(data) {
		var code = codeGenerator.generateCode(tables);
		code = data.format({body: code, version: version});
		showResults(code);
	});
}