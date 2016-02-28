import os
import flask
from flask import Flask
from flask import Blueprint
from flask import request
import json
#import models
from time import sleep
from datetime import datetime
import hashlib
import random
import uuid

__author__ = "Prahlad Yeri"
__version__ = "1.2"

#app = Flask(__name__, static_url_path='', static_folder='static')
app = Flask(__name__,static_url_path='/img', static_folder='img')
blueprint = Blueprint('css', __name__, static_url_path='/css', static_folder='css')
app.register_blueprint(blueprint)
blueprint = Blueprint('js', __name__, static_url_path='/js', static_folder='js')
app.register_blueprint(blueprint)
blueprint = Blueprint('fonts', __name__, static_url_path='/fonts', static_folder='fonts')
app.register_blueprint(blueprint)
blueprint = Blueprint('lib', __name__, static_url_path='/lib', static_folder='lib')
app.register_blueprint(blueprint)
blueprint = Blueprint('assets', __name__, static_url_path='/assets', static_folder='assets')
app.register_blueprint(blueprint)
#blueprint = Blueprint('sh', __name__, static_url_path='/sh', static_folder='sh')
#app.register_blueprint(blueprint)
#blueprint = Blueprint('fullcalendar', __name__, static_url_path='/fullcalendar', static_folder='fullcalendar')
#app.register_blueprint(blueprint)


app.config['UPLOAD_FOLDER'] = 'upload'
app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])


@app.route("/")
def home():
	f = open("index.html", 'r')
	s = f.read()
	f.close()
	return s


if __name__ == "__main__":
	#print 'DEBUG: ' + str(models.DEBUG)
	app.run(debug=True)