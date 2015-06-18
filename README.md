## Visual Alchemist

**Visual Alchemist** is a web app to seamlessly create `sqlalchemy` models by dragging/dropping objects in a canvas.

![Screenshot](https://github.com/prahladyeri/valchemist/raw/master/img/screenAddTable.png)

Presently, the tool just automates the code creation to build the corresponding `sqlite` database. Following features are coming soon:

- Implement joins and relations by drag/drop.
- Authentication/Sign-up.
- Ability to save the visual models on backend.
- Multi-language support (on-demand).

### Demo

Visit [http://valchemist-inn.rhcloud.com](http://valchemist-inn.rhcloud.com) to see a live demo of how this app works.

### Installation and Usage

Visual Alchemist is presently a pure `html` app, so you can simply copy the `github` repo and host it.
However, Flask support is also added as I intend to add more backend-specific features soon.
To install the flask-based version, first ensure that you already have `flask`, `jinja2` and `sqlalchemy` installed.
Then, just download the repo and copy to a folder and issue the following command:

	python valchemist.py
	
### Contribute

I need contributions in the following areas:
- **Front-end Testing:** To test the app across various Browser/OS environments to make sure it runs all-right.
- **Design:** My CSS/JavaScript skills aren't that great. So, if you can suggest any improvisation to the front-end workflow, it would be great!
- Need more suggestions from Python Experts regarding how can I improvise this app, so its useful somewhere.