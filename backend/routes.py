from flask import current_app as app, jsonify, render_template,  request, send_file,render_template_string
from flask_security import auth_required, verify_password, hash_password
from backend.models import db , Customer , Professional, User , Service,ServiceRequest
import uuid 
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult
import os 
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from datetime import datetime


datastore = app.security.datastore
cache = app.cache

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True) 


@app.route('/')
#@cache.cached(timeout = 5)
def home():
    return render_template('index.html')

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id' : task.id}

@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)
    print("inside get")
    if result.ready():
        filename = result.result
        filepath = os.path.join(app.root_path, "backend/celery/user-downloads", filename)

        if os.path.exists(filepath):
            return send_file(filepath, mimetype='text/csv')
        else:
            return {'message': 'File not found'}, 404
    else:
        return {'message': 'Task not ready'}, 202

@auth_required('token') 
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return render_template_string("<center><h1>{{time}}</h1></center>",time = datetime.now())

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
   

    if not email or not password or role_name not in ['customer']:
        return jsonify({"message": "Invalid inputs"}), 400

    user = datastore.find_user(email=email)

    if user:
        return jsonify({"message": "User already exists"}), 400

    role = datastore.find_role(role_name)
    if not role:
        return jsonify({"message": "Invalid role"}), 400
    
    if pincode:
        pincode = int(pincode)


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
        

        user = User.query.filter_by(email=email).first()

        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.roles[0].name, 'id' : user.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {str(e)}") 
        return jsonify({"message": f"Error creating user: {str(e)}"}), 500

@app.route("/register-prof", methods=["POST"])
def register_prof():
    try:
        # Get form fields from FormData
        email = request.form.get("email")
        password = request.form.get("password")
        name = request.form.get("name")
        role_name = request.form.get("role")
        address = request.form.get("address")
        phone = request.form.get("phone")
        pincode = request.form.get("pincode")
        service_id = request.form.get("service_id")
        exp = request.form.get("experience")

        if not email or not password or role_name not in ['professional']:
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


        # Get uploaded file
        if "resume" not in request.files:
            return jsonify({"error": "Resume file is required"}), 400

        resume = request.files["resume"]

        # Validate file type
        if resume.filename == "" or not resume.filename.endswith(".pdf"):
            return jsonify({"error": "Invalid file type. Only PDFs are allowed"}), 400

        # Save file
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], resume.filename)
        resume.save(file_path)

        print(f"Email: {email}, Resume: {file_path}")

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
                resume=resume.filename,
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


#Chart Routes
@app.route('/admin/summary')
def admin_summary():
    # Data aggregation
    service_counts = db.session.query(Service.name, db.func.count(ServiceRequest.id))\
        .join(ServiceRequest, Service.id == ServiceRequest.service_id)\
        .group_by(Service.name).all()
    
    services = [row[0] for row in service_counts]
    counts = [row[1] for row in service_counts]

    # Generate Matplotlib chart
    plt.figure(figsize=(6, 4))
    plt.bar(services, counts, color='skyblue')
    plt.xlabel('Services')
    plt.ylabel('Number of Requests')
    plt.title('Service Requests per Service')
    plt.xticks(rotation=45)

    # Convert plot to a base64 string to embed in HTML
    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    chart_url = base64.b64encode(img.getvalue()).decode()
    img.close()

    return render_template(
        'admin_summary.html',
        chart_url=f"data:image/png;base64,{chart_url}",
        total_professionals=Professional.query.count(),
        total_customers=Customer.query.count(),
        total_requests=ServiceRequest.query.count()
    )


#Professionals chart
@app.route('/professional/summary/<int:professional_id>')
def professional_summary(professional_id):
    # Get the professional's details
    professional = Professional.query.get(professional_id)

    # Fetch service requests handled by this professional
    service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()

    # Count requests by status
    status_counts = db.session.query(
        ServiceRequest.service_status, db.func.count(ServiceRequest.id)
    ).filter_by(professional_id=professional_id).group_by(ServiceRequest.service_status).all()

    statuses = [row[0] for row in status_counts]
    counts = [row[1] for row in status_counts]

    # Generate chart for service statuses
    plt.figure(figsize=(6, 4))
    plt.pie(counts, labels=statuses, autopct='%1.1f%%', startangle=140, colors=['lightblue', 'lightgreen', 'salmon'])
    plt.title('Service Request Status Distribution')

    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    chart_url = base64.b64encode(img.getvalue()).decode()
    img.close()

    return render_template(
        'professional_summary.html',
        professional=professional,
        chart_url=f"data:image/png;base64,{chart_url}",
        total_requests=len(service_requests),
        assigned_requests=len([req for req in service_requests if req.service_status == 'accepted']),
        reqs = [req for req in service_requests],
        completed_requests=len([req for req in service_requests if req.service_status == 'closed'])
    )

#Customer Chart
@app.route('/customer/summary/<int:customer_id>')
def customer_summary(customer_id):
    # Get the customer's details
    customer = Customer.query.get(customer_id)

    # Fetch service requests made by this customer
    service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()

    # Count requests by service
    service_counts = db.session.query(
        Service.name, db.func.count(ServiceRequest.id)
    ).join(Service, Service.id == ServiceRequest.service_id)\
     .filter(ServiceRequest.customer_id == customer_id)\
     .group_by(Service.name).all()

    services = [row[0] for row in service_counts]
    counts = [row[1] for row in service_counts]

    # Generate chart for services requested
    plt.figure(figsize=(6, 4))
    plt.bar(services, counts, color='skyblue')
    plt.xlabel('Services')
    plt.ylabel('Number of Requests')
    plt.title('Services Requested by Customer')
    plt.xticks(rotation=45)

    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    chart_url = base64.b64encode(img.getvalue()).decode()
    img.close()

    return render_template(
        'customer_summary.html',
        customer=customer,
        chart_url=f"data:image/png;base64,{chart_url}",
        total_requests=len(service_requests),
        pending_requests=len([req for req in service_requests if req.service_status == 'requested']),
        completed_requests=len([req for req in service_requests if req.service_status == 'closed']),
        id=customer_id
    )


@app.before_request
def check_authentication():
    if request.endpoint not in ['home', 'login', 'register', 'register_prof','static', 'get_services','admin_summary','customer_summary','professional_summary','cache','uploaded_file']:
        if not request.headers.get('Authentication-Token'):
            return jsonify({'error': 'Unauthorized'}), 401
