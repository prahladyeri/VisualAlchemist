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


const loggers = []; //stores all created loggers
const loggerProxies = []; //stores all created logger proxies

let lastClassLogger = -1; //stores the last ClassLogger that was called
let lastFunctionLogger = -1; //stores the last FunctionLogger that was called
let defaultEnabled = true; // used by the disableAll and enableAll methods. Used as default for new loggers

/**
 * A handler that intercepts calls to the Logger class and is responsible for the grouping of the output.
 */
const handler = {
			
  	get: function(target, propKey, receiver) {
  		//target is the Proxy. Get the wrapped logger object from the target.
  		const logger = target.logger;
  		
  		//log, info... intercept the call to a function of the logger
  		if(typeof target.logger[propKey] == "function"){
			if(!logger.isEnabled){
				//if the logger is disabled: return an empty function.
				return function(){};
			};
			
			//Consolegrouping: based on the index values of the loggers.
			if(logger.parentLoggerIndex == -1){
				//a ClassLogger wants to output something
				//Control the grouping of the classLogger
				if(lastClassLogger == -1){
					console.group(logger.loggerName);
					lastClassLogger = logger.index;
					//alert("classlogger is adding group because non exists " + logger.loggerName);
				}else{
					if(lastClassLogger != logger.index){
						console.groupEnd();
						//alert("classlogger is ending the previous group and adding a group because classlogger changed " + logger.loggerName);
						if(lastFunctionLogger != -1){
							console.groupEnd();
							lastFunctionLogger = -1;
							//alert("classlogger is ending a group because the last log came from a functionLogger of a diffrent class.");
						};
						console.group(logger.loggerName);
						lastClassLogger = logger.index;
					}else{
						if(lastFunctionLogger != -1){
							if (lastFunctionLogger != logger.index){
								console.groupEnd();
								lastFunctionLogger = -1;
								//alert("classlogger is ending the previous group because this is no function logger " + logger.loggerName);
							};
						};
					};
				};
			}else{
				//a FunctionLogger wants to output something
				//Control the grouping of the functionLogger
				if(lastFunctionLogger == -1){
					console.group(logger.loggerName);
					lastFunctionLogger = logger.index;
					//alert("functionlogger is adding group because non exists " + logger.loggerName);
				}else{
					if(lastFunctionLogger != logger.index){
						console.groupEnd();
						console.group(logger.loggerName);
						lastFunctionLogger = logger.index;
						//alert("functionlogger is ending the previous group and adding group because functionlogger changed " + logger.loggerName);
					}else{
/*						 if(lastClassLogger != logger.parentLoggerIndex){
								console.groupEnd();
								//alert("functionlogger is ending group because parent classlogger changed. RESETTING lastFunctionLogger " + logger.loggerName);
								lastFunctionLogger = -1;
						 };
*/					};
				};
			};
			
			//(re-)binding is not neccesary, because we did on when we created the logger!
			//var binding = "console." + propKey + ".bind(window.console, '" + prefix + "')";
			//return eval(binding);
			//return target.logger[propKey];	
  		};
  		
		return target.logger[propKey];	
  	}, //get handler
};

/**
 * A Javascript Logging class that intercepts calls to the console with the purpose of grouping the output.
 * @param loggerName The Name of the logger when constructed. Should be the name of a class or a function. 
 */
class Logger{
	constructor(loggerName){
		this.loggerName = loggerName;
		
		this.index; //the index of the logger in loggers[]
		
		this.isEnabled = defaultEnabled;
		
		this.parentLoggerIndex = -1; //indicates that this is a function logger if >= 0. Important for the grouping.
	};
	
	/**
	 * Disables the given logger.
	 * @param loggerName The Name of the logger that will be disabled. 
	 */
	static disable(loggerName){
		loggers.find( logger => logger.loggerName === loggerName ).isEnabled = false;
	};
	
	/**
	 * Enables the given logger.
	 * @param loggerName The Name of the logger that will be enabled. 
	 */
	static enable(loggerName){
		loggers.find( logger => logger.loggerName === loggerName).isEnabled = true;
	};
	
	/**
	 * Disables all existing loggers. AND sets the default for the 'isEnabled' property of new loggers to false
	 */
	static disableAll(){
		loggers.forEach(logger => logger.isEnabled = false);
		defaultEnabled = false;
	};
	
	/**
	 * Enables all existing loggers. AND sets the default for the 'isEnabled' property of new loggers to true
	 */
	static enableAll(){
		loggers.forEach(logger => logger.isEnabled = true);	
		defaultEnabled = true;
	};
	
	/**
	 * Creates a new ClassLogger.
	 * @param classLoggerName The Name of the logger
	 * @return An instance of Logger 
	 */
	static getClassLogger(classLoggerName){
		const classLogger = new Logger(classLoggerName);
		
		//bind the returned function to the console. IMPORTANT: This preserves the context of the caller!
		classLogger.log = console.log.bind(console, classLoggerName + ": ");
		classLogger.debug = console.log.bind(console, classLoggerName + ": ");
		classLogger.info = console.log.bind(console, classLoggerName + ": ");
		classLogger.warn = console.log.bind(console, classLoggerName + ": ");
		classLogger.error = console.log.bind(console, classLoggerName + ": ");
		
		classLogger.index = loggers.length;
		loggers.push (classLogger);
		
		//create and return a Proxy. This is necessary to intercept calls to the logger.
		const classLoggerProxy = new Proxy({logger:classLogger}, handler);
		loggerProxies.push(classLoggerProxy);
		
		return classLoggerProxy;
	};
	
	/**
	 * Creates a new FunctionLogger or returns an existing one. Outputs of a FunctionLogger are grouped underneath the outputs of a parent ClassLogger
	 * @param classLoggerName The Name of the parent ClassLogger
	 * @param functionLoggerName The Name of the FunctionLogger
	 * @return An instance of Logger 
	 */
	static getFunctionLogger(classLoggerName, functionLoggerName){
		
		let functionLogger = loggers.find( functionLogger => functionLogger.loggerName === functionLoggerName);
		
		if (!functionLogger){
			functionLogger = new Logger(functionLoggerName);
			
			const classLogger = loggers.find( classLogger => classLogger.loggerName === classLoggerName);
			
			//bind the returned function to the console. IMPORTANT: This preserves the context of the caller!
			functionLogger.log = console.log.bind(console, classLoggerName + "->" + functionLoggerName + ": ");
			functionLogger.debug = console.log.bind(console, classLoggerName + "->"  + functionLoggerName + ": ");
			functionLogger.info = console.log.bind(console, classLoggerName + "->"  + functionLoggerName + ": ");
			functionLogger.warn = console.log.bind(console, classLoggerName + "->"  + functionLoggerName + ": ");
			functionLogger.error = console.log.bind(console, classLoggerName + "->"  + functionLoggerName + ": ");

			functionLogger.index = loggers.length;
			functionLogger.parentLoggerIndex = classLogger.index;
			
			loggers.push(functionLogger);
			
			const functionLoggerProxy = new Proxy({logger:functionLogger}, handler);
			loggerProxies.push(functionLoggerProxy);
			
			return functionLoggerProxy;
		}else{
			return loggerProxies[functionLogger.index];
		};
		
	};
	
}; //Class Logger

export {Logger};