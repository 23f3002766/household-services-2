from flask import Flask
from backend.config import LocalDevelopmentConfig
from flask_security import SQLAlchemyUserDatastore,Security
from backend.models import db, User, Role
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel


def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)
    
    app.config.update(
        MAIL_SERVER='smtp@gmail.com',
        MAIL_PORT=587,
        MAIL_USE_TLS=True,
        MAIL_USERNAME='thanos112357@gmail.com',
        MAIL_PASSWORD='kgpp kjze mmsi pmwk',
        MAIL_DEFAULT_SENDER='23f3002766@ds.study.iitm.ac.in'
    )
    # model init
    db.init_app(app)


    # cache init
    cache = Cache(app)

    datastore = SQLAlchemyUserDatastore(db, User,  Role)

    app.cache = cache
    
    app.security = Security(app, datastore=datastore, register_blueprint=False)

    app.app_context().push()

    from backend.resources import api
    # flask-restful init
    api.init_app(app)

    return app

app = createApp()

celery = celery_init_app(app)

import backend.init_initial_data

import backend.routes

import backend.celery.celery_schedule

excel.init_excel(app)

if (__name__ == '__main__'):
   
    app.run()