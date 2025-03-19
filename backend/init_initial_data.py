from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password


with app.app_context():
    db.create_all()

    # Ensure security extension is initialized
    if not hasattr(app, "security") or not hasattr(app.security, "datastore"):
        raise RuntimeError("Flask-Security is not initialized properly in app.py")

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore  # Now it's safe to use


    userdatastore.find_or_create_role(name = 'admin', description = 'superuser')
    userdatastore.find_or_create_role(name = 'user', description = 'general user')

    if (not userdatastore.find_user(email = 'admin@study.iitm.ac.in')):
        userdatastore.create_user(email = 'admin@study.iitm.ac.in', password = hash_password('pass'), roles = ['admin'] )
    if (not userdatastore.find_user(email = 'user01@study.iitm.ac.in')):
        userdatastore.create_user(email = 'user01@study.iitm.ac.in', password = hash_password('pass'), roles = ['user'] )

    db.session.commit()