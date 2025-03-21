from flask import Flask
from backend.config import LocalDevelopmentConfig
from flask_security import SQLAlchemyUserDatastore,Security
from backend.models import db, User, Role , Customer


def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)
    
    # model init
    db.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User,  Role)
    
    app.security = Security(app, datastore=datastore, register_blueprint=False)

    app.app_context().push()

    from backend.resources import api
    # flask-restful init
    api.init_app(app)

    return app

app = createApp()

import backend.init_initial_data

import backend.routes


if (__name__ == '__main__'):
   
    app.run()