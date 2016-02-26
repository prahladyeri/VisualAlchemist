/**
* @brief Some reusable javascript functions.
* 
* @author Prahlad Yeri
* @copyright MIT License
* @date 2015/12/15
*/

/****************************/
/* START UTILITY/CORE FUNCTIONS */
/********************************/

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


//depends on bootstrap
function bsalert(obj) {
	//initial config:
	cont = $('.header'); //container
	delay = 2000; //millis
	theWidth = "300px";
	
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
	$('#bsalertPlugin'  + nid + ' .bsaBody').html(text);
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

