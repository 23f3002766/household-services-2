from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime

db = SQLAlchemy()


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    '''name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(240), nullable=True)
    phone = db.Column(db.String(10), nullable=False)
    pincode = db.Column(db.Integer, nullable=False)
   '''
    # flask-security specific
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, default = True)
    roles = db.relationship('Role', backref = 'bearers', secondary='user_roles')

    #Professional specific
   
    #date_created = db.Column(db.DateTime, default=datetime.now())
    #experience = db.Column(db.Integer, nullable=False)
    #pdf_path = db.Column(db.String(300), nullable=False)

    # Relationship for requests a user has initiated
    created_requests = db.relationship(
        "ServiceRequest",
        foreign_keys="[ServiceRequest.customer_id]",
        backref="customer",
        lazy=True
    )

    # Relationship for requests a user has accepted
    accepted_requests = db.relationship(
        "ServiceRequest",
        foreign_keys="[ServiceRequest.professional_id]",
        backref="professional",
        lazy=True
    )

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable  = False)
    description = db.Column(db.String, nullable = False)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

# Service Model
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, default=datetime.now())
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(20), default='requested')  # requested/assigned/closed
    remarks = db.Column(db.Text, nullable=True)
