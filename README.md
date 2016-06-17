![License](https://img.shields.io/badge/license-GPL-blue.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)
[![](https://www.paypalobjects.com/en_US/i/btn/x-click-but04.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JM8FUXNFUK6EU)

# Visual Alchemist

##### Table of Contents

1. [Mission Statement](#mission)
2. [Project Details](#project-details)
3. [Feature Roadmap for v1.1](#feature-roadmap-for-v11)
4. [Feature Roadmap for v2.0](#feature-roadmap-for-v20)
5. [Screenshots](#screenshots)
6. [Demo](#demo)
7. [Installation](#installation)
8. [Documentation](#documentation)
9. [Contribution](#contribution)
10. [Donation](#donation)
11. [License](#license)
12. [Contribution Guidelines](#contribution-guidelines)
13. [Stack](#stack)

![Screenshot](https://github.com/prahladyeri/valchemist/raw/master/img/screenRelation.png)

## Mission

##### To create as a community, the best open source web-based database diagramming and automation tool.

## Project Details

- Lead Developer: [Prahlad Yeri](https://github.com/prahladyeri)
- Governance: Meritocracy.
- Issue tracker: [https://github.com/prahladyeri/VisualAlchemist/issues](https://github.com/prahladyeri/VisualAlchemist/issues)
- Discussion Room: [https://www.reddit.com/r/VisualAlchemist](https://www.reddit.com/r/VisualAlchemist)

## Feature Roadmap for v1.1

- Create tables structures and relationships and represent them as elements on canvas.
- Drag/Drop the elements on canvas.
- Export the canvas as a `json` file.
- Import the canvas from existing `json` file.
- Export the database as `python-sqlalchemy` ORM code.
- Export the database as raw sql code (`mysql` dialect).
- (Pending) Export the database as raw sql code (`postgresql` dialect).
- (Pending) Export the database as raw sql code (`sqlite` dialect).
- (Pending) Export the database as `PHP Doctrine` ORM code.
- (Pending) Export the database as `Laravel Eloquent` ORM code.
- (Pending) Support for composite primary keys.
- (Nice to have) A better looking logo for the tool.

## Feature Roadmap for v2.0

- Ability to change ordering of columns by drag-drop.
- Ability to save the session for future use and `database versioning`.
- Ability to share sessions through URL.
- Multiple sessions in different tabs with ability to save them on backend.
- Interfacing with backends like php/mysql/etc. for complete automation.
- Charting/data-analysis features.
- Export to diagram/image formats like PDF/PNG/etc.

## Screenshots

![Screenshot](https://github.com/prahladyeri/valchemist/raw/master/img/screenRelation.png)
![Screenshot](https://github.com/prahladyeri/valchemist/raw/master/img/screenAddTable.png)

## Demo

Visit [http://visualalchemist.prahladyeri.com](http://visualalchemist.prahladyeri.com) to see a live demo of how this app works.

## Installation

Visual Alchemist is a pure html app, so you can simply download the [source](https://github.com/prahladyeri/VisualAlchemist/archive/master.zip) and host it (with `index.html` as default).

## Documentation

Visual Alchemist is under active development, so there is no extensive documentation. However, a brief guide accompanies the app which should help most power users. If you don't understand anything, the best places to visit are the [issue tracker](https://github.com/prahladyeri/VisualAlchemist/issues) and the [VA subreddit](https://www.reddit.com/r/VisualAlchemist).

## Contribution

I'm presently looking for people who can contribute to Visual Alchemist. Mainly in the areas of:

1. Testing: Extensive alpha/beta testing, so our `v1.1` can be a big hit!
2. Code review: There is no such thing as bug-free code and more the number of eyeballs, the better it is.
3. Logo Design: Though a new logo is not immediately necessary, it is still a nice to have, though.
4. Documentation: Docs are very critical at this early of the project, and we don't have any apart from the basic guide accompnied by the app itself.

## Donation

| Paypal | Bitcoin |
| ------ | ------- |
| [![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JM8FUXNFUK6EU) |  <center> ![1Av4rPGBz5rJVPwewSTDCpYac1rjvkaSzT](https://www.prahladyeri.com/assets/btc_address.png)<br />1Av4rPGBz5rJVPwewSTDCpYac1rjvkaSzT</center> |

## License

`Visual Alchemist` is free and open source and it always will be! It is licensed under the [GPLv3](https://opensource.org/licenses/GPL-3.0).

## Contribution Guidelines

This is a GPLv3 project, so please make sure that contributed code complies accordingly. If it doesn't, then don't contribute.

## Stack

`Visual Alchemist` is entirely composed of Open source stack:

- [jQuery](http://www.jquery.com) - The most popular JavaScript library in vogue. A must-know for any web-developer.
- [Twitter Bootstrap](https://github.com/twbs/bootstrap) - A popular `CSS/JavaScript` framework by Twitter Inc., again an "off-the-shelf" reusable component for backend & front-end developers alike.
- [jsPlumb](https://jsplumbtoolkit.com/) - Useful JavaScript library for plugging-in "drag-drop" elements in your web-page.
