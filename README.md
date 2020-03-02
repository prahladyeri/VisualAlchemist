![License](https://img.shields.io/badge/license-GPL-blue.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)
[![](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=8RBU2DYK9AT9Q&source=url)

# Visual Alchemist

##### Table of Contents

1. [Visual Alchemist reloaded](#visual-alchemist-reloaded)
2. [What it is](#what-it-is)
3. [Version 1.0.7](#version-1.0.7)
4. [Version 2.0.0](#version-2.0.0)
5. [Screenshots](#screenshots)
6. [For users](#for-users)
7. [For developers](#for-developers)
8. [License](#license)



## Visual Alchemist reloaded

This is a major rewrite / update of the 4 year old repository from Prahlad Yery.
[Original Repo of Visual Alchemist](https://github.com/prahladyeri/VisualAlchemist)

I basically ripped the code apart into modules and added new functionality as described below.

As this is a fork of the original repository I will create a Pull Request for Prahlad. I simply don't know if he's interested in further development of the software. 

## What it is

Visual Alchemist is a visual design tool for Entity Relationship Diagrams (ERD) that can be run by using a webserver and a browser.
Once the tables and their field are designed the code to create the entities can be generated and executed on the target database system.

## Version 1.0.7

The version number of Prahlads original repo is 1.0.7. Here are the features of that version. Important: I didn't change the code generation
stuff. Nor did I add any new code generators. 

- Create tables structures and relationships and represent them as elements on canvas.
- Drag/Drop the elements on canvas.
- Export the canvas as a `json` file.
- Import the canvas from existing `json` file.
- Export the database as `python-sqlalchemy` ORM code.
- Export the database as raw sql code (`mysql` dialect).
- Export the database as raw sql code (`sqlite` dialect).

## Version 2.0.0

I beamed the version number to 2.0.0. because major code reorganization has been done and the following (main) features were added:

- Renaming existing tables and fields.
- Editing existing fields.
- Zoom the canvas for a better overview.
- Added Datepicker for selecting Date / DateTime values.
- A scrollable canvas for being able to create lots of tables.

## Screenshots

![Screenshot1](/screens/screen1.png)
![Screenshot2](/screens/screen2.png)
![Screenshot3](/screens/screen3.png)

## For Users

What to download for a minimal installation? 
* Get the "dist" folder
* Get the index.html and the startUp.js (the latter only if you want to use the express webserver.. see below)
* From the "src" folder you'll need the "assets" and the "img" folder.
* Grab the "src/lib" folder if you want  or get your preferred version of jQuery and Bootstrap. (Tested with 3.4.1 / 4.4.1)
* All other software (javascript, css and external libs) are bundled in the vialch.js that you'll find in the "dist" folder.

So the final structure of a minimal installation looks like this:
    -index.html
    -startUp.js
    -dist
    |-vialch.js
    -src
    |-assets
    |-img
    |-lib
    

You'll need a webserver of your choice to run the tool. However, I included a little javascript "startUp.js" that uses express to get you started.

1. Install node.js (with npm) https://nodejs.org/en/
2. Do `npm install --save express`
3. Run the server with `node startUp.js`
4. Navigate your browser to `localhost:3000`

## For developers

As this software uses nodejs and webpack you'll have to install these tools. See the "package.json" and the "webpack.config.js"?
If you're familiar with these, you'll have no problem to bundle the distribution after you changed code. 
If not, hmm... it's definitely worth the time to get started with these frameworks.

## License

Visual Alchemist is free and open source, and it always will be. It is licensed under the [GPLv3](https://opensource.org/licenses/GPL-3.0).

André Kreienbring

Mar, 2020
