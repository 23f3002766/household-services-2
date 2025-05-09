from flask import jsonify, request, url_for, current_app as app , send_from_directory,abort
from flask_restful import Api, Resource, fields, marshal_with,reqparse
from flask_security import auth_required,roles_required,current_user
from backend.models import db, User, Customer, Professional, Service, ServiceRequest
from datetime import datetime


#file utils
UPLOAD_FOLDER = "uploads"  # Change this to your actual upload directory
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# Initialize the API
api = Api(prefix='/api')

# --- Output Fields ---
# For creating a new service, we want to return the new service's fields.
service_fields = {
    'name': fields.String,
    'price': fields.Float,
    'time_required': fields.String,
    'description': fields.String,
}

# --- Util Path For SP PDF ---
@app.route('/uploads/<path:filename>', methods=['GET'])
def uploaded_file(filename):
    uploads_dir = app.config["UPLOAD_FOLDER"]

    # Debugging: Print the requested file
    print(f"Requested file: {filename}")

    try:
        return send_from_directory(uploads_dir, filename)
    except FileNotFoundError:
        abort(404)
# -----------------------------------------------------------------------------
# Admin Dashboard Resource
# -----------------------------------------------------------------------------
class AdminDashboard(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self):
 
        customers = Customer.query.all()
        professionals = Professional.query.all()
        services = Service.query.all()
        service_reqs = ServiceRequest.query.all()
        
        #  to_dict() method in models.
        customers_data = [c.to_dict() for c in customers]
        professionals_data = []

        for p in professionals:
            prof_dict = p.to_dict()
            if prof_dict.get("resume"):  
                print(prof_dict.get("resume"))
                prof_dict["resume"] = url_for("uploaded_file", filename=prof_dict["resume"], _external=True)
            print(f"Generated Resume URL: {prof_dict["resume"]}")
            professionals_data.append(prof_dict)

        services_data = [c.to_dict() for c in services]
        service_reqs_data = [c.to_dict() for c in service_reqs]
        
        return jsonify({
            "customers": customers_data,
            "professionals": professionals_data,
            "services": services_data,
            "service_reqs": service_reqs_data
        })

# -----------------------------------------------------------------------------
# Admin Create Service Resource
# -----------------------------------------------------------------------------
class AdminCreateService(Resource):
    @auth_required("token")
    @roles_required("admin")
    @marshal_with(service_fields)
    def post(self):
        data = request.get_json()
        print(data)
        name = data.get("service_name")
        price = float(data.get("price"))
        time_required = data.get("time_required")
        description = data.get("description", "")
        print(name)
        if not name or price is None or not time_required:
            return {"error": "Name, price, and time_required are required."}, 400

        service = Service(name=name, price=price, time_required=time_required, description=description)
        db.session.add(service)
        db.session.commit()
        
        return service, 201


# -----------------------------------------------------------------------------
# Admin Update Service Resource
# -----------------------------------------------------------------------------
class AdminUpdateService(Resource):
    @auth_required("token")
    @roles_required("admin")
    @marshal_with(service_fields)
    def put(self, service_id):

        data = request.get_json()
        service = Service.query.get(service_id)

        print(data, service)
        if not service:
            print("Service not found")
            return {"error": "Service not found", "status": 404}, 404
        
        name = data.get("service_name")
        price = float(data.get("price"))
        time_required = data.get("time_required")
        description = data.get("description", "")
        print(name)
        if not name or price is None or not time_required:
            return {"error": "Name, price, and time_required are required."}, 400

        # Update
        service.name = name
        service.price = price
        service.time_required = time_required
        service.description = description

        db.session.commit()
        
        return service, 200


# -----------------------------------------------------------------------------
# Admin Delete Service Resource
# -----------------------------------------------------------------------------
class AdminDeleteService(Resource):
    @auth_required("token")
    @roles_required("admin")
    def delete(self, service_id):
        service = Service.query.get(service_id)

        if not service:
            return {"error": "Service not found."}, 404

        db.session.delete(service)
        db.session.commit()

        return {"message": "Service deleted successfully."}, 200


# -----------------------------------------------------------------------------
# Admin Approve Professional Resource
# -----------------------------------------------------------------------------
class AdminApproveProfessional(Resource):
    @auth_required("token")
    @roles_required("admin")
    def post(self, professional_id):
        professional = Professional.query.get(professional_id)
        print(professional)
        if not professional:
            print("professional not found")
            return jsonify({"error": "Professional not found", "status" : 404})
        
        professional.approved = True 
        db.session.commit()
        return jsonify({"message": "Professional approved" , "status" : 200})

# -----------------------------------------------------------------------------
# Admin Block User Resource
# -----------------------------------------------------------------------------
class AdminBlockUser(Resource):
    @auth_required("token")
    @roles_required("admin")
    def post(self, user_id):

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found", "status" : 404})
        
        # Block the user
        user.active = False
        db.session.commit()
        return jsonify({"message": "User blocked", "status" : 200})
    
# -----------------------------------------------------------------------------
# Customer Dashboard Resource
# -----------------------------------------------------------------------------
class CustomerDashboard(Resource):
    @auth_required("token")
    @roles_required("customer")
    def get(self , customer_id):
        professionals = Professional.query.all()
        services = Service.query.all()
        service_reqs = ServiceRequest.query.filter_by(customer_id=current_user.id).all()
        
        # Assume each model implements a to_dict() method.
        customer_data = Customer.query.get(customer_id)
        professionals_data = [p.to_dict() for p in professionals]
        services_data = [c.to_dict() for c in services]
        service_reqs_data = [c.to_dict() for c in service_reqs]
        
        return jsonify({
            "customer": customer_data.to_dict(),
            "professionals": professionals_data,
            "services": services_data,
            "service_reqs": service_reqs_data
        })

# -----------------------------------------------------------------------------
# Customer Update Profile Resource
# -----------------------------------------------------------------------------

class CustomerUpdateProfile(Resource):
    @auth_required("token")
    @roles_required("customer")
    def get(self, customer_id):
        customer = Customer.query.get(customer_id)
        if not customer:
            print("Customer not found")
            return {"error": "Customer not found", "status": 404}, 404
        
        return customer.to_dict(), 200

    @auth_required("token")
    @roles_required("customer")
    def put(self, customer_id):

        data = request.get_json()
        customer = Customer.query.get(customer_id)

        print(data, customer)
        if not customer:
            print("Customer not found")
            return {"error": "Customer not found", "status": 404}, 404
        
        name = data.get("name")
        email = data.get("email")
        address = data.get("address")
        phone = data.get("phone")
        pincode = data.get("pincode")
        print(name)
        if not name or email is None or not pincode:
            return {"error": "Name, email, and pincode are required."}, 400

        # Update
        customer.name = name
        customer.email = email
        customer.address = address
        customer.phone = phone
        customer.pincode = pincode

        db.session.commit()
        
        return customer.to_dict(), 200
    

# -----------------------------------------------------------------------------
# Customer Service Request Resources
# -----------------------------------------------------------------------------


class CustomerBookings(Resource):
    @auth_required("token")
    @roles_required("customer")
    def get(self, customer_id):
        bookings = ServiceRequest.query.filter_by(customer_id=customer_id).all()
        return jsonify([b.to_dict() for b in bookings])

    @auth_required("token")
    @roles_required("customer")
    def post(self, customer_id):
        data = request.get_json()
        service_id = data.get("service_id")
        professional_id = data.get("professional_id")
        date_of_request = data.get("date_of_request")

        if "date_of_request" in data and data["date_of_request"]:
            try:
                date_of_request = datetime.strptime(data["date_of_request"], "%Y-%m-%d %H:%M:%S")
            except ValueError:
                return {"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}, 400

        if not service_id:
            return {"error": "Service ID is required."}, 400

        new_booking = ServiceRequest(
            customer_id=customer_id,
            service_id=service_id,
            professional_id=professional_id,
            date_of_request=date_of_request
        )

        db.session.add(new_booking)
        db.session.commit()

        return new_booking.to_dict(), 201

    @auth_required("token")
    @roles_required("customer")
    def put(self, customer_id, booking_id):
        booking = ServiceRequest.query.get(booking_id)
        if not booking or booking.customer_id != customer_id:
            return {"error": "Booking not found."}, 404

        data = request.get_json()
        print("Received Data:", data)  # Debugging

        # Parse date_of_request if provided
        if "date_of_request" in data and data["date_of_request"]:
            try:
                booking.date_of_request = datetime.strptime(data["date_of_request"], "%Y-%m-%d %H:%M:%S")
            except ValueError:
                return {"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}, 400

        db.session.commit()
        print("Updated Successfully")
    
        return booking.to_dict(), 200


class CloseServiceRequest(Resource):
    @auth_required("token")
    @roles_required("customer")
    def put(self, service_request_id):
      
        # Fetch the service request
        service_request = ServiceRequest.query.get(service_request_id)

        if not service_request:
            return {"error": "Service request not found."}, 404
        
        # Update the service status to "closed"
        service_request.service_status = "closed"
        service_request.date_of_completion = datetime.utcnow()  # Set completion date
        db.session.commit()

        return {"message": "Service request closed successfully", "service_request": service_request.to_dict()}, 200
    
class ReviewServiceRequest(Resource):
    @auth_required("token")
    @roles_required("customer")
    def put(self, service_request_id):
      
        # Fetch the service request
        service_request = ServiceRequest.query.get(service_request_id)

        if not service_request:
            return {"error": "Service request not found."}, 404
        
        data = request.get_json()
        print("Received Data:", data)
        
        # Update the service status to "closed"
        service_request.remarks = data["review"]
        db.session.commit()

        return {"message": "Review added successfully", "service_request": service_request.to_dict()}, 200

# -----------------------------------------------------------------------------
# Professional Dashboard Resource
# -----------------------------------------------------------------------------    

class ProfessionalServiceRequestsAPI(Resource):
    @auth_required("token")
    @roles_required("professional")
    def get(self):
  
        requests = ServiceRequest.query.filter_by(professional_id=current_user.id).all()

        result = []
        for req in requests:
            customer = Customer.query.get(req.customer_id)
            service = Service.query.get(req.service_id)

            request_data = req.to_dict()
            request_data["customer"] = customer.to_dict() if customer else None
            request_data["service"] = service.to_dict() if service else None
            
            result.append(request_data)
        
        return jsonify(result)

class AcceptRejectServiceRequestAPI(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument("action", type=str, required=True, choices=("accept", "reject"), help="Choose either 'accept' or 'reject'.")

    @auth_required("token")
    @roles_required("professional")
    def put(self, request_id):
        print("hello")
        args = self.parser.parse_args()
        print(args, request_id)
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        if args["action"] == "accept":
            service_request.service_status = "accepted"
        else:
            service_request.service_status = "rejected"

        db.session.commit()
        return {"message": f"Service request {args['action']}ed successfully"}

class CloseServiceRequestAPI(Resource):
    @auth_required("token")
    @roles_required("professional")
    def put(self, request_id):
       
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        if service_request.professional_id != current_user.id:
            return {"message": "You are not assigned to this request"}, 403

        service_request.service_status = "closed"
        service_request.date_of_completion = datetime.utcnow()
        db.session.commit()
        return {"message": "Service request closed successfully"}



# -----------------------------------------------------------------------------
# Register Resources with the API
# -----------------------------------------------------------------------------

#Admin Resources
api.add_resource(AdminDashboard, "/admin/dashboard", endpoint="admin_dashboard")
api.add_resource(AdminCreateService, "/admin/service")
api.add_resource(AdminUpdateService, "/admin/update-service/<int:service_id>")
api.add_resource(AdminApproveProfessional, "/admin/approve/<int:professional_id>")
api.add_resource(AdminBlockUser, "/admin/block/<int:user_id>")
api.add_resource(AdminDeleteService, "/admin/delete-service/<int:service_id>")


#Customer Resources
api.add_resource(CustomerDashboard, "/customer/dashboard/<int:customer_id>", endpoint="dashboard")
api.add_resource(CustomerUpdateProfile, "/customer/profile/<int:customer_id>")
#service request Resources
api.add_resource(CustomerBookings, "/customer/bookings/<int:customer_id>", "/customer/bookings/<int:customer_id>/<int:booking_id>")
api.add_resource(CloseServiceRequest, "/customer/close-request/<int:service_request_id>")
api.add_resource(ReviewServiceRequest, "/customer/review-request/<int:service_request_id>")

#Professional Resources

api.add_resource(ProfessionalServiceRequestsAPI, "/professional/service-requests")
api.add_resource(AcceptRejectServiceRequestAPI, "/service-requests/<int:request_id>/action")
api.add_resource(CloseServiceRequestAPI, "/service-requests/<int:request_id>/close")