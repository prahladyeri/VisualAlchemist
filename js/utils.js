/**
* Some reusable javascript functions.
* 
* @author Prahlad Yeri
* @copyright GPLv3
* @date 2015/12/15
*/

/****************************/
/* START UTILITY/CORE FUNCTIONS */
/********************************/

//http://stackoverflow.com/questions/2540969/remove-querystring-from-url 
function getPathFromUrl(url) {
  return url.split("?")[0];
}

/**
 * Get the value of a querystring (http://gomakethings.com/how-to-get-the-value-of-a-querystring-with-native-javascript/)
 * 
 * @param  {String} field The field to get the value of
 * @param  {String} url   The URL to get the value from (optional)
 * @return {String}       The field value
 */
var getQueryString = function ( field, url ) {
	if (url==undefined) {
		url = window.location.href;
	}
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

/**
 * Validates a date as per European format (yyyy-mm-dd).
 * 
 * @return Empty string if valid, error message otherwise.
 * */
function checkDate(theDate)
{
    //var re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/; //British Format
    var re = /^(\d{4})-(\d{1,2})-(\d{1,2})$/; //American Format
    var errorMsg = "";
    var allowBlank = true;
    var minYear = 1000;
    //var maxYear = (new Date()).getFullYear();
    var maxYear = 9999;
    
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

/**
 * jQuery function to center screen
 * */
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}



function downloadSomeText(text, filename) {
	console.log("downloadSomeText");
	var content = text;
	var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
	var a = document.createElement('a');
	
	if (a.click != undefined) {
		console.log(a.click);
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
		console.log("a.click is undefined");
		//method-2
		location.href= uriContent;
	}
	
	//method-1
	//window.open(uriContent, "somefile.txt");
}


// source: http://stackoverflow.com/a/18405800/849365
// example: "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

if (!String.prototype.capitalize) {
	String.prototype.capitalize =  function() { 
		return this.replace(/^./, function(match){return match.toUpperCase()} );
	}
}

COOKIE_ENCODER = '{|}~';
function createCookie(name, value, days) 
{
	value = value.replace(';', COOKIE_ENCODER);
	
    //if (days>=0) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    //}
    //else var expires = "";


    document.cookie = name + "=" + value + expires; // + "; path=/";
}

function readCookie(name) 
{
	//name = name.replace(';',COOKIE_ENCODER);
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
        {
        	s = c.substring(nameEQ.length, c.length);
        	s = s.replace(COOKIE_ENCODER,';');
        	return s;
        }
    }
    return null;
}

function eraseCookie(name) 
{
    createCookie(name, "", -1);
}

//http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
function selectText(element) {
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
    }
}

/*END UTILITY FUNCTIONS*/

function bsabout() {
	bspopup({type:"about"});	
}

/**
 * Shows a bootstrap popup dialog on the center of screen.
 * Depends on jQuery and Bootstrap.
 * */
function bspopup(options, success) {
	//TODO: Clean/Dispose the popup objects once done for memory efficiency.
    if ($(".popupBox").length == 0) {
        $.get("assets/partials/bootui.html?time=" + (new Date()).getTime(), function(data){
            $('body').append(data);
            bspopup(options, success);
            return;
        });
    }
    
	//text, type, title
	if (typeof(options)=='string')
	{
		text = options;
        options = {type:"text", text:text};
	}
    if (options==undefined) options={};
	if (options.type==undefined) options.type='text';
	if (options.text==undefined) options.text='';
    
    var text = options.text;
	var type = options.type;
	var title = options.title;
	//if (obj.delay!=undefined) delay = obj.delay;
    var proto = '';
    if (type=='text') {
        proto = 'Generic';
    }
    else if (type=='input' || type=='radiolist') {
        proto = 'Input';
    }
    else if (type=='about') {
		proto = 'About';
	}
	console.log("proto: ", proto, ",type: ", type);
    
    var theBox = $("#popupBox" + proto).clone();
    theBox.attr("id", "popupBox" + (Math.random() + "").replace(".","") )
        .removeClass("hidden");
    if (type=='radiolist') {
		theBox.find(".messageText").text(text);
        theBox.find("#txtInput").remove();
        html = '<select class="form-control">';
        for(var i=0;i<options.list.length;i++) {
            html += '<option value="' + options.list[i] + '">' + options.list[i] +  '</option>';
        }
        html += '<select>';
        theBox.find(".modal-body").append(html);
    }
    else if (type=='text') 
    {
		theBox.find(".messageText").text(text);
        if (options.button1 != undefined) {
            theBox.find("#btnClose").text(options.button1);
            theBox.find("#btnClose").click(function(){
                ev = {};
                ev.button = "button1";
                options.success(ev);
            });
        }
        if (options.button2 != undefined) {
            theBox.find(".modal-footer").append("<button id='button2' class='btn btn-default'  data-dismiss='modal'>" + options.button2 + "</button>")
            theBox.find("#button2").click(function(){
                ev = {};
                ev.button = "button2";
                options.success(ev);
            });
        }
    }
    else if (type=='about') {
		theBox.find(".version").text(version);
		theBox.find(".year").text((new Date()).getFullYear());
	}
    
    if (options.success != undefined) {
        theBox.find("#btnOK").click(function() {
            var ev = {};
            if (type=='input') {
                ev.value = theBox.find("#txtInput").val(); 
            }
            else if (type=='radiolist') {
                ev.value = theBox.find(".modal-body select").val(); 
            }
            options.success(ev);
        });
    }
    
    theBox.on("hidden.bs.modal", function(e) {
        if (options.complete!=undefined) {
            var ev = {};
            //ev.id = theBox.attr("id");
            options.complete(ev);
        }
        theBox.remove();
    });
    
    theBox.modal('show');
}


//depends on bootstrap
//Note: obsolete, use bspopup instead
function bsalert(obj) {
	//initial config:
	cont = $('.header'); //container
	delay = 2000; //millis
	theWidth = "310px";
	
	//text, type, title
	text = obj.text; //.replace("\n","<br>");
	type = obj.type;
	title = obj.title;
	if (obj.delay!=undefined) delay = obj.delay;
	
	if (type==undefined) type='info';
	
	/*if ($('#bsalertPlugin').length>0){
		$('#bsalertPlugin').remove();
	}*/
	
	var nid = $('.bsalert-plugin').length + 1;
	
	//if ($('#bsalertPlugin').length==0) 
	//{
		html = '<div id="bsalertPlugin' + nid + '" style="z-index:2000;position:absolute;right:0;top:0;width:' + theWidth + ';" class="bsalert-plugin alert alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong class="bsaTitle"></strong>&nbsp;<span class="bsaBody"></span></div>';
		$('body').append(html);
	//}

	tval = cont.height();
	lval = cont.offset().left + parseInt(cont.css('width')); //cont.width();
	lval -= parseInt($('#bsalertPlugin' + nid).css('width'));
	
	$('#bsalertPlugin' + nid).css( {'top': tval, 'left': lval} );
		
	$('#bsalertPlugin' + nid).addClass('alert-' + type);
	$('#bsalertPlugin'  + nid + ' .bsaBody').text(text);
	$('#bsalertPlugin' + nid + ' .bsaTitle').text(title);
	//window.setTimeout(function() { ba.alert('close') }, delay);
	if (delay==0) {
		$('#bsalertPlugin'  + nid).alert();
	}
	else {
		$('#bsalertPlugin' + nid).alert().hide().fadeIn(500).delay(delay).fadeOut(1000, function() {
			$(this).alert('close');
		});
	}
}

