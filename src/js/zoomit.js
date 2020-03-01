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

import Panzoom from "@panzoom/panzoom";
import {Logger} from "./js-log.js";

var logger = Logger.getClassLogger("ZoomIt");

/**
 * Zoom covers the zooming functionality of the application.
 * Currently it uses panzoom (https://github.com/timmywil/panzoom) for this purpose
 * @export The created zoom object.
 * */
class ZoomIt{
    constructor() {
    	this.currentZoom = 1;
    	this.lastZoom = 1;
     	this.step = 0.1;
    	this.minScale = 0.6;
    	this.maxScale = 1;
    	this.events = 'animationend transitionend webkitAnimationEnd oanimationend MSAnimationEnd webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd';
    	this.initialEndpointSize;
    };
    
    /**
     * makes the Table DIV zoomable
     * @param tableElement The (DOM element) table DIV
     * @return a instance of Panzoom
     */
    makeTableZoomable(tableElement){
		const panzoom = Panzoom(tableElement, {
			disablePan: true,
			minScale: this.minScale,
			maxScale: this.maxScale,
			cursor: "auto",
		});
		
		return panzoom;
    };
    
    /**
     * Currently UNUSED because it apparently does not work.
     * Instead we use the transitionend event to react on the finished zoom.
     * Synchronizes and performs the zoom.
     * @param panzoom a panzoom instance.
     * @param zoom the scaling factor.
     * @return a Promise that is resolved when the zoom is performed.
     */
    syncZoom(panzoom){
    	if(!panzoom){
    		return Promise.resolve();
    	}else{
	        return new Promise((resolve, reject) => {
	        	panzoom.zoom(this.currentZoom, { animate: true });
	        	//panzoom.zoom(this.currentZoom);
	        	resolve()
	        });
     	};
 	};
 	
 	/**
 	 * AFTER zooming was applied, we need to adjust the endpoints and anchors of each field in the table.
 	 * Necessary because the endpoints are NOT zoomed with the Table. jsPlumb places them on the canvas!
 	 * @param table the table that was zoomed
 	 * @param field the field that needs endpoint adjustment
 	 */
 	adjustJsPlumbEndpoints(table, field){
 		if (field.pkEndpoint != null) {
 			const pkAnchor = jQuery(dbdesigner.namespaceWrapper + "#tblDiv" + table.id + " div[fpname='" + table.id + "." +  field.id + "']");
 			const pkImage = jQuery(dbdesigner.namespaceWrapper + ".zoomablePk" + table.id + "_" + field.id);
			
    		logger.log(table.name + "." +  field.name + " PK Anchor offset: " + JSON.stringify(pkAnchor.offset()));
			logger.log(table.name + "." +  field.name + " PK Image offset: " + JSON.stringify(pkImage.offset()));
				
			let pkchangeLeft = (pkAnchor.offset().left - pkImage.offset().left);  // find change in top
			let pkchangeTop = (pkAnchor.offset().top - pkImage.offset().top);  // find change in top
	        
			
			//apply the zoom to icon width, height and the anchor offsets
			const pkZoomedEndpointSettings = [
				this.initialEndpointSize * this.currentZoom, //width
				this.initialEndpointSize * this.currentZoom, //height
				field.pkEndpoint.anchor.orientation[0] * this.currentZoom, //x orientation
				field.pkEndpoint.anchor.orientation[1] * this.currentZoom  //y orientation
			];
			
			field.pkEndpoint.endpoint.width = pkZoomedEndpointSettings[0];
			field.pkEndpoint.endpoint.height = pkZoomedEndpointSettings[1];
			
	        //apply the zoomed anchor settings
			pkZoomedEndpointSettings[2] == 0 ? pkchangeLeft += pkZoomedEndpointSettings[0] / 2: pkchangeLeft += pkZoomedEndpointSettings[0] / 2 * pkZoomedEndpointSettings[2];
			pkZoomedEndpointSettings[3] == 0 ? pkchangeTop += pkZoomedEndpointSettings[1] / 2: pkchangeTop += pkZoomedEndpointSettings[1] / 2 * pkZoomedEndpointSettings[3];

			logger.log("PK changeLeft: " + pkchangeLeft + "PK changeTop: " + pkchangeTop);
			
			pkchangeLeft += field.pkEndpoint.anchor.offsets[0];
			pkchangeTop += field.pkEndpoint.anchor.offsets[1];
			field.pkEndpoint.setAnchor([1, 0.5, 1, 0.5, pkchangeLeft, pkchangeTop]);
			
	    };
				
	    const fkAnchor = jQuery(dbdesigner.namespaceWrapper + "#tblDiv" + table.id + " div[ffname='" + table.id + "." +  field.id + "']");
	    const fkImage = jQuery(dbdesigner.namespaceWrapper + ".zoomableFk" + table.id + "_" + field.id);
		
		logger.log(table.name + "." +  field.name + " FK Anchor offset: " + JSON.stringify(fkAnchor.offset()));
		logger.log(table.name + "." +  field.name + " FK Image offset: " + JSON.stringify(fkImage.offset()));
		
		let fkchangeLeft = (fkAnchor.offset().left - fkImage.offset().left);  // find change in top
		let fkchangeTop = (fkAnchor.offset().top - fkImage.offset().top); // find change in top
        
		const fkZoomedEndpointSettings = [
			this.initialEndpointSize * this.currentZoom, //width
			this.initialEndpointSize * this.currentZoom, //height
			field.fkEndpoint.anchor.orientation[0] * this.currentZoom, //x orientation
			field.fkEndpoint.anchor.orientation[1] * this.currentZoom  //y orientation
		];
		
		field.fkEndpoint.endpoint.width = fkZoomedEndpointSettings[0];
		field.fkEndpoint.endpoint.height = fkZoomedEndpointSettings[1];
		
		fkZoomedEndpointSettings[2] == 0 ? fkchangeLeft -= fkZoomedEndpointSettings[0] / 2: fkchangeLeft -= fkZoomedEndpointSettings[0] / 2 * fkZoomedEndpointSettings[2];
		fkZoomedEndpointSettings[3] == 0 ? fkchangeTop += fkZoomedEndpointSettings[1] / 2: fkchangeTop += fkZoomedEndpointSettings[1] / 2 * fkZoomedEndpointSettings[3];

		logger.log("FK fkchangeLeft: " + fkchangeLeft + " FK fkchangeTop: " + fkchangeTop);
	    
		fkchangeLeft += field.fkEndpoint.anchor.offsets[0];
		fkchangeTop += field.fkEndpoint.anchor.offsets[1];
		field.fkEndpoint.setAnchor([0, 0.5, 0, 0.5, fkchangeLeft, fkchangeTop]);
 	};
 	
 	/**
 	 * Zooms a table to the current zoom. First the zoom is applied and then an event listener listens for the 
 	 * transformation to finish.
  	 * Only AFTER the transformation we can adjust the field endpoints.
 	 * @param table the table object that will be zoomed
 	 */
 	zoomTable(table){
		this.onAnimationEnd(jQuery(dbdesigner.namespaceWrapper + "#tblDiv" + table.id), () =>{
 	  		jQuery.each(table.fields, (fieldId, field) => {
 	  			this.adjustJsPlumbEndpoints(table, field);
 	 		});
 	  		
 	  		//once zoomed unbind the event listener
 	  		jQuery(dbdesigner.namespaceWrapper + "#tblDiv" + table.id).off(this.events)
 	  		logger.log("zoomed to " + this.currentZoom);
		});
		
		//zoom with animation! Necessary to fire the transitionend event after zooming
		table.panzoom.zoom(this.currentZoom, { animate: true });
 	};
    	
 	/**
 	 * Zoom all tables that are on the canvas to the current zoom factor. Performs a CSS3 transformation on each table.
 	 * @param listen If true the zoomed element listens for the end of the transition
 	 * @see zoomTable
 	 * */
 	zoomAll(){
    	jQuery.each(dbdesigner.tables, (tableId,table) => {
    		setTimeout(() =>{
        		this.zoomTable(table);
    		}, 0);			
		});
    	
    	this.lastZoom = this.currentZoom;
    }; 
    
    /**
     * Adds an event handler to the given element that listens for the transitionend and animationend event after zooming
     * @param $element the (table) element
     * @param handler a function that handles the event
     * @return the element 
     */
    onAnimationEnd($element, handler) {
        //- Bind event to element
        $element.on(this.events, handler)

        //- Return received element
        return $element
    };    
}; //Class ZoomIt

const zoomit = new ZoomIt();
export {zoomit};
