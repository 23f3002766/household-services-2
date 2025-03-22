from flask import current_app as app, jsonify, render_template,  request
from flask_security import auth_required, verify_password, hash_password,current_user
from backend.models import db , Customer , Professional, User , Service
from datetime import datetime
import uuid 


datastore = app.security.datastore

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data)
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role_name = data.get('role')
    address = data.get('address')
    phone = data.get('phone')
    pincode = data.get('pincode')
    service_id = data.get('service_id')
    exp = data.get('experience')
    
    if not email or not password or role_name not in ['professional', 'customer']:
        return jsonify({"message": "Invalid inputs"}), 400

    user = datastore.find_user(email=email)

    if user:
        return jsonify({"message": "User already exists"}), 400

    role = datastore.find_role(role_name)
    if not role:
        return jsonify({"message": "Invalid role"}), 400
    
    if pincode:
        pincode = int(pincode)

    if service_id:
        service_id = int(service_id)

    if exp:
        exp = int(exp)

    try:
        if role_name == 'customer' :
            customer = Customer(
                email=email,
                password=hash_password(password),
                fs_uniquifier=str(uuid.uuid4()), 
                roles=[role], 
                type='customer',
                name = name,
                address = address,
                phone = phone,
                pincode = pincode,
                active=True
            )
            print(customer)
            db.session.add(customer)
            db.session.commit()
        else :
            professional = Professional(
                email=email,
                password=hash_password(password),
                fs_uniquifier=str(uuid.uuid4()), 
                roles=[role], 
                type='professional',
                name = name,
                address = address,
                phone = phone,
                pincode = pincode,
                service_id= service_id,
                experience=exp,
                active=True
            )
            db.session.add(professional)
            db.session.commit()

        user = User.query.filter_by(email=email).first()

        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.roles[0].name, 'id' : user.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {str(e)}") 
        return jsonify({"message": f"Error creating user: {str(e)}"}), 500
    

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message" : "invalid inputs"}), 404
    
    user = datastore.find_user(email = email)

    if not user:
        return jsonify({"message" : "invalid email"}), 404
    
    if verify_password(password, user.password):
        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.roles[0].name, 'id' : user.id})
    
    return jsonify({'message' : 'password wrong'}), 400

@app.get('/protected')
@auth_required('token')
def protected():
    return jsonify({'message' : 'Authorised'})

@app.route("/services", methods=["GET"])
def get_services():
    services = Service.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in services])


@app.before_request
def check_authentication():
    if request.endpoint not in ['home', 'login', 'register', 'static', 'get_services']:
        if not request.headers.get('Authentication-Token'):
            return jsonify({'error': 'Unauthorized'}), 401
