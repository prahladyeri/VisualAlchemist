## Visual Alchemist

**Visual Alchemist** is a web app to seamlessly create `sqlalchemy` models by dragging/dropping objects in a canvas.

![Screenshot](https://github.com/prahladyeri/valchemist/raw/master/img/screenRelation.png)

Features:

- Automatically builds the `models.py` code file to generate the models.
- Joins and table-movement on canvas by simple drag/drop.
- Saves the canvas in local data-store (HTML5-enabled browsers only).
- Ability to export/import the canvas to/from `JSON` files.

### Demo

Visit [http://valchemist-inn.rhcloud.com](http://valchemist-inn.rhcloud.com) to see a live demo of how this app works.

### Installation and Usage

Visual Alchemist is presently a pure html app, so you can simply copy the github repo and host it. However, Flask support is also added as I intend to add more backend-specific features soon.

To run VA in Flask, you'll need to install the minimum requirements via the requirements.txt file. Run the following commands to install requirements in a virtual environment from within the application root directory (assuming you have pip and virtualenv installed): 

    virtualenv venv
    source venv/bin/activate
    pip install -r
    deactivate

To run the app, go to the application root directory and type:

    venv/bin/python valchemist.py
    	
	
### Contribution

I need contributions in the following areas:
- **Front-end Testing:** To test the app across various Browser/OS environments to make sure it runs all-right.
- **Design:** My CSS/JavaScript skills aren't that great. So, if you can suggest any improvisation to the front-end workflow, it would be great!
- **Suggestions:** Need more suggestions from Python Experts regarding how can I improvise this app, so its useful somewhere.