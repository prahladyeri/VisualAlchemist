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

import "tempusdominus-bootstrap-4";

/**
 * Interface to the implemented datepicker.
 * As of today this is Tempus Dominus Bootstrap 4
 * */
class Datepicker{
    constructor() {
    	this.datepickerElement;
    	this.datepickerButtonElement;
    	this.datepickerInputElement;
   };
    
    /**
     * initializes the datepicker
     * @param datepickerElement JQuery object. This element will hold the datetimepicker JQuery Plugin
     * @param datepickerButtonElement JQuery object. Used to disable and enable the datetimepicker
     * @param datepickerInputElement JQuery object. The HTML input that is connected with the datetimepicker
    */
    init(datepickerElement, datepickerButtonElement, datepickerInputElement){
    	this.datepickerElement = datepickerElement;
    	this.datepickerButtonElement = datepickerButtonElement;
    	this.datepickerInputElement = datepickerInputElement;

    	//set the constructor defaults. The icons require fontawesome solid to be installed
		jQuery.fn.datetimepicker.Constructor.Default = jQuery.extend({}, jQuery.fn.datetimepicker.Constructor.Default, {
			autoclose: true,
			icons: {
			    time: 'fas fa-clock',
			    date: 'fas fa-calendar-alt',
			    up: 'fas fa-arrow-up',
			    down: 'fas fa-arrow-down',
			    previous: 'fas fa-chevron-left',
			    next: 'fas fa-chevron-right',
			    today: 'fas fa-calendar-check-o',
			    clear: 'fas fa-trash',
			    close: 'fas fa-times',
			},				
		});
		
		//and initialize the datetimepicker on the element. Do this only once!
		this.datepickerElement.datetimepicker();
    };
    
    /**
     * Hides and disables the datetimepicker by manipulating the DOM
     */
    hide(){
    	this.datepickerButtonElement.addClass("invisible");
    	this.datepickerButtonElement.prop('disabled',true);
    	this.datepickerInputElement.removeClass("datetimepicker-input");
    };
    
    /**
     * Shows and enables the datetimepicker by manipulating the DOM
     */
    show(){
    	this.datepickerButtonElement.removeClass("invisible");
    	this.datepickerButtonElement.prop('disabled',false);
    	this.datepickerInputElement.addClass("datetimepicker-input");
    };
    
    /**
     * Sets the given option of the datetimepicker to the given value
     * @param option The option that will be set
     * @param value The new value of the option
     */
    set(option, value){
    	this.datepickerElement.datetimepicker(option, value);
    };
    
    /**
     * Gets the value of an option of the datetimepicker
     * @param option The option 
     * @return The current value of the option
     */
    get(option){
    	return this.datepickerElement.datetimepicker(option);
    };
}; //class datepicker

const datetimepicker = new Datepicker();
export {datetimepicker};