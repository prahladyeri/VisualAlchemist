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

//import moment from 'moment';  => provided by webpack
import {Logger} from "./js-log.js";


const logger = Logger.getClassLogger("Utils");
const COOKIE_ENCODER = '{|}~';

class Utils{
	/**
	 * Whatever options where passed to bspopup. Here we make sure that these are a valid object for bspopup
	 * 
	 */
	bsoptions(options){
		if (typeof(options)=='string'){
	        options = {type: "text",text: options};
		};
	    if (options==undefined) options={};
		if (options.type==undefined) options.type='text';
		if (options.text==undefined) options.text='';
		if (options.title==undefined) options.title='Visual Alchemist';
		return options;
		
	};
	
	/**
	 * Shows a bootstrap modal popup dialog on the center of screen.
	 * @param options An object or simple text. @see function bsoptions. 
	 * 
	 * The option object can contain up to two custom buttons named "button1" and "button2".
	 * IMPORTANT: If button2 is given, this has to be the close button!
	 * button1 fires an event that can be evaluated by the caller.
	 * @see dbdesigner.eraseCanvasState, dbdesigner.deleteTable, showResultsDialog in codeGenerator
	 */
	bspopup(options){
		logger.log("BsPopup is starting");
		if (jQuery(dbdesigner.namespaceWrapper + "#popupBox").length == 0) {
			jQuery(dbdesigner.namespaceWrapper + "#popupHolder").load(dbdesigner.context + "assets/partials/bootui.html", (data, success, dataType) => {
				logger.log("LOADED THE popup Dialog!");
				
	            this.bspopup(options); //recursive call if not loaded before
	        });
	        return; 
	    };
	    
		// Make sure options is a valid object with text, type, and title properties
		options = this.bsoptions(options);
	    
		//define which kind of content will be shown
		const text = options.text;
		const type = options.type;
		const title = options.title;
		let ev = {};
		
	    let proto = "";
	    if (type=="text") {
	        proto = "Generic";
	    }
	    else if (type=="input" || type=="radiolist") {
	        proto = "Input";
	    }
	    else if (type=="about") {
			proto = "About";
		}
	    else if (type=="stack") {
	        proto = "Stack"
	    };
	        
	    
	    const $theBox = jQuery(dbdesigner.namespaceWrapper + "#popupBox");
	    $theBox.find(".modal-title").text(title);
	    
		const $contentDiv = $theBox.find("#popupBox" + proto);
		$contentDiv.removeClass("d-none");
		
		logger.log("Showing PopUpBox with content #popupBox" +proto);
	    
		// Insert HTML in to the box based on popup box type
	    if (type=='radiolist') {
	    	$contentDiv.find(".messageText").text(text);
	    	$contentDiv.find("#txtInput").remove();
	        let html = "<select id='select1' class='form-control form-control-sm'>";
	        for(let i=0;i<options.list.length;i++) {
	            html += "<option value='" + options.list[i] + "'>" + options.list[i] +  "</option>";
	        }
	        html += "</select>";
	        $contentDiv.find("form").append(html);
	    }
	    else if (type=="input") {
	    	$contentDiv.find('#txtInput').get(0).placeholder = text;
	    	$contentDiv.find(".messageText").text(text);
		}
	    else if (type=='text') 
	    {
	    	$contentDiv.find(".messageText").html(text.replace(/\n/g,'<br/>'));
	    }
	    else if (type=='about') {
	    	$contentDiv.find(".version").text(dbdesigner.version);
	    	$contentDiv.find(".year").text((new Date()).getFullYear());
		};
	    
	    //if button1 was provided by the caller the user input is returned with an event 
	    if (options.success != undefined && options.button1 != undefined) {
            $theBox.find(".modal-footer").prepend("<button id='button1' class='btn " + options.button1.type + " btn-sm'  data-dismiss='modal'>" + options.button1.text + "</button>")
	        $theBox.find("#button1").click(function() {
	            ev = {};
	            if (type=='input') {
	                ev.value = $contentDiv.find("#txtInput").val(); 
	            }else if (type=='radiolist') {
	                ev.value = $contentDiv.find("#select1").val(); 
	            }else{
	            	ev.button = "button1";	
	            };
	            options.success(ev);
	        });
	    };
        
	    if (options.button2 != undefined) {
		    //this is the close (without action) button. Just change the text 
        	$theBox.find("#btnClose").text(options.button2);
        };
		
		if (type=='text' || type=='input') {
			// Focus the text box when it is first shown
			$theBox.on('shown.bs.modal', function () {
				$contentDiv.find('#txtInput').focus();
			});
		};

	    $theBox.on("hidden.bs.modal", function(ev) {
	    	//reset the content of the modal
	    	$theBox.find("#btnClose").text("Close");
	    	if($theBox.find("#button1").length != 0) $theBox.find("#button1").remove();
	    	if($contentDiv.find("#select1").length != 0) $contentDiv.find("#select1").remove();
	    	$contentDiv.addClass("d-none");
	    });
	    
	    $theBox.modal();
	}; //bspopup
	
	/**
	 * Shows a bootstrap alert that is closed after some time.
	 * @param obj an object like {text: "text to display, type: ["primary"|"secondary"|"success"|"danger"|"warning"|"info"|"light"|"dark"], title: "title text", delay: [time to fade out in millis]}
	 * If a delay of 0 is passed, the alert will stay open. In this case there may be more then one alerts on the DOM
	 */
	bsalert(obj) {
		
		const text = obj.text.replace(/\n/g,'<br/>');
		const type = (obj.type == undefined ? "info" : obj.type);
		const title = obj.title;
		const delay = (obj.delay == undefined ? 2000 : obj.delay);//millis
		
		//because there may be more then one alert, we need to assign a unique number.
		const nid = jQuery(dbdesigner.namespaceWrapper + ".bsalert-plugin").length + 1;
		const theWidth = "310px";
		const html = '<div id="bsalertPlugin' + nid + '" style="z-index:2000;position:absolute;right:0;top:0;width:' + theWidth + ';" class="bsalert-plugin alert alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong class="bsaTitle"></strong>&nbsp;<span class="bsaBody"></span></div>';
		
		jQuery(dbdesigner.namespaceWrapper + "#popupHolder").prepend(html);
		
		const $theAlert= jQuery(dbdesigner.namespaceWrapper + "#bsalertPlugin" + nid);

		//use the container to position the alert
		const cont = jQuery(dbdesigner.namespaceWrapper + ".container"); 
		const tval = cont.height();
		let lval = cont.offset().left + parseInt(cont.css('width')); //cont.width();
		lval -= parseInt($theAlert.css('width'));
		$theAlert.css( {'top': tval, 'left': lval} );
		
		$theAlert.addClass('alert-' + type);
		$theAlert.find(".bsaBody").html(text);
		$theAlert.find(".bsaTitle").text(title);

		//show the alert. If it is closed it is removed from the DOM!
		if (delay==0) {
			$theAlert.alert();
		}else {
			$theAlert.alert().hide().fadeIn(500).delay(delay).fadeOut(1000, function() {
				jQuery(this).alert('close');
			});
		};
	}; //bsalert
	
	getPathFromUrl(url) {
		 return url.split("?")[0];
	};
	
	/**
	 * Get the value of a querystring (http://gomakethings.com/how-to-get-the-value-of-a-querystring-with-native-javascript/)
	 * 
	 * @param  {String} field The field to get the value of
	 * @param  {String} url   The URL to get the value from (optional)
	 * @return {String}       The field value
	 */
	getQueryString ( field, url ) {
		if (url==undefined) {
			url = window.location.href;
		}
		const href = url ? url : window.location.href;
		const reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
		const string = reg.exec(href);
	    return string ? string[1] : null;
	}
	
	/**
	 * Validates a date as per European format (yyyy-mm-dd).
	 * 
	 * @return Empty string if valid, error message otherwise.
	 * */
	checkDate(theDate)
	{
	    //var re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/; //British Format
		const re = /^(\d{4})-(\d{1,2})-(\d{1,2})$/; //American Format
	    let errorMsg = "";
	    const allowBlank = true;
	    const minYear = 1000;
	    //var maxYear = (new Date()).getFullYear();
	    const maxYear = 9999;
	    
	    if(theDate.length > 0) {
	      if(regs = theDate.match(re)) {
	        if(regs[3] < 1 || regs[3] > 31) {
	          errorMsg = "Invalid value for day: " + regs[3];
	        } else if(regs[2] < 1 || regs[2] > 12) {
	          errorMsg = "Invalid value for month: " + regs[2];
	        } else if(regs[1] < minYear || regs[1] > maxYear) {
	          errorMsg = "Invalid value for year: " + regs[1] + " - must be between " + minYear + " and " + maxYear;
	        }
	      } else {
	        errorMsg = "Invalid date format: " + theDate;
	      }
	    } else if(!allowBlank) {
	      errorMsg = "Empty date not allowed!";
	    }
	    return errorMsg;
	}

	downloadSomeText(text, filename) {
		logger.log("downloadSomeText");
		const content = text;
		const uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		const a = document.createElement('a');
		
		if (a.click != undefined) {
			logger.log(a.click);
			//method-3
			a.href = uriContent;
			a.download  = filename;
			var myEvt = document.createEvent('MouseEvents');
			myEvt.initEvent(
			   'click'      // event type
			   ,true      // can bubble?
			   ,true      // cancelable?
			);		
			a.dispatchEvent(myEvt);
		}
		else {
			logger.log("a.click is undefined");
			//method-2
			location.href= uriContent;
		}
		
		//method-1
		//window.open(uriContent, "somefile.txt");
	};
	
	createCookie(name, value, days) 
	{
		value = value.split(";").join(COOKIE_ENCODER); //replace(';', COOKIE_ENCODER);

	    if (days>=0) {
	    	const date = new Date();
	        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	        const expires = "; expires=" + date.toGMTString();
	    }
	    //else var expires = "";


	    document.cookie = name + "=" + value + expires; // + "; path=/";
	};

	readCookie(name) 
	{
		//name = name.replace(';',COOKIE_ENCODER);
		const nameEQ = name + "=";
	    const ca = document.cookie.split(';');
	    for (let i = 0; i < ca.length; i++) {
	        let c = ca[i];
	        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
	        if (c.indexOf(nameEQ) == 0)
	        {
	        	s = c.substring(nameEQ.length, c.length);
	        	s = s.split(COOKIE_ENCODER).join(';');
	        	return s;
	        }
	    }
	    return null;
	};


	eraseCookie(name) 
	{
	    createCookie(name, "", -1);
	};

	//http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
	selectText(element) {
		var doc = document
	        , text = doc.getElementById(element)
	        , range, selection
	    ;    
	    if (doc.body.createTextRange) {
	        range = document.body.createTextRange();
	        range.moveToElementText(text);
	        range.select();
	    } else if (window.getSelection) {
	        selection = window.getSelection();        
	        range = document.createRange();
	        range.selectNodeContents(text);
	        selection.removeAllRanges();
	        selection.addRange(range);
	    };
	};

	/**
	 * Shows the Help PopUp. Called from the App Class.
	 * @param isStorageReady If false the user is informed that there is no storage available
	 */
	bshelp(isStorageReady){
		let strWelcome = "Just click the New Table link to start creating tables. \n\nOnce done, simply click the Code button to get the code!\n\nTo create relationships, drag the orange dots (primary-keys) and connect them to blue dots (candidate foreign-keys).\n\nTo detach/remove the relationships, click the blue area on the foreign-keys and drag it outside the table panel."
		if(!isStorageReady){
			strWelcome += "\n\nCAUTION: No storage is available. Remember to export your work!"
		};
		
		this.bspopup({
			title: "Help",
			text: strWelcome
		});
	};
}; //Utils class



const utils = new Utils;
export {utils};
