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

import {DBDesigner} from "./js/dbdesigner.js";

import "./css/app.scss";
import "./css/tempusdominus-bootstrap-4.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

/**
 * This is the entrypoint for Webpack. It basically creates the dbdesigner interface
 * and puts it on the global window for making it available to the HTML files 
 */
jQuery(document).ready(function () {
	//Construct the Interface with the context and the CSS namespace wrapper.
	window.dbdesigner = new DBDesigner(document.URL + "src/", ".vialch");
	window.dbdesigner.app.start();
});


/*library.add(fas) 
dom.i2svg() 
*/

