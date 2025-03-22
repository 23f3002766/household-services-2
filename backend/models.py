from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime

db = SQLAlchemy()


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    
    # flask-security specific
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, default = True)
    roles = db.relationship('Role', backref = 'bearers', secondary='user_roles')
    

    # Discriminator for subclasses
    type = db.Column(db.String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": type,
    }

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "active": self.active,
            "roles": [role.name for role in self.roles],
            "type": self.type,
        }
    

    # Customer Model (inherits from User)
class Customer(User):
    id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String(240), nullable=True)
    phone = db.Column(db.String(10), nullable=True)
    pincode = db.Column(db.Integer, nullable=True)
    

    # Relationship for requests a user has initiated
    created_requests = db.relationship(
        "ServiceRequest",
        foreign_keys="[ServiceRequest.customer_id]",
        cascade="all, delete",
        backref="customer",
        lazy=True
    )

    __mapper_args__ = {
        "polymorphic_identity": "customer",
    }

    def to_dict(self):
        return {
            **super().to_dict(),
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "pincode": self.pincode,
        }

# Professional Model (inherits from User)
class Professional(User):
    id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.now())
    name = db.Column(db.String, nullable=True)
    experience = db.Column(db.Integer, nullable=True)
    address = db.Column(db.String(240), nullable=True)
    phone = db.Column(db.String(10), nullable=True)
    pincode = db.Column(db.Integer, nullable=True)
    approved = db.Column(db.Boolean, default = False)
     # Relationship for requests a user has accepted
    accepted_requests = db.relationship(
        "ServiceRequest",
        foreign_keys="[ServiceRequest.professional_id]",
        cascade="all, delete", 
        backref="professional",
        lazy=True
    )

    __mapper_args__ = {
        "polymorphic_identity": "professional",
    }

    def to_dict(self):
        return {
            **super().to_dict(),
            "service_id": self.service_id,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "name": self.name,
            "experience": self.experience,
            "address": self.address,
            "phone": self.phone,
            "pincode": self.pincode,
            "approved": self.approved,
        }



class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable  = False)
    description = db.Column(db.String, nullable = False)
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role_id": self.role_id,
        }

# Service Model
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "time_required": self.time_required,
            "description": self.description,
        }

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, default=datetime.now())
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(20), default='requested')  # requested/accepted/closed
    remarks = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "customer_id": self.customer_id,
            "professional_id": self.professional_id,
            "date_of_request": self.date_of_request.isoformat() if self.date_of_request else None,
            "date_of_completion": self.date_of_completion.isoformat() if self.date_of_completion else None,
            "service_status": self.service_status,
            "remarks": self.remarks,
        }

# Relationships
Service.professional = db.relationship('Professional',cascade="all, delete", backref='service', lazy=True)
Service.service = db.relationship('ServiceRequest',cascade="all, delete", backref='service', lazy=True)
