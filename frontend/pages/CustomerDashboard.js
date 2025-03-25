import GenericTable from "../components/GenericTable.js";
import EditProfile from "./EditProfile.js";
import BookingsPage from "./BookingsPage.js";

export default {
  template: `
    
    <div v-if="isChildRouteActive">
      <div v-if="childActive" class="container mt-3 bg-light p-3 rounded shadow-sm">
        <router-view name="editprofile" :customer="customer"  @profile-updated="updateProfile" ></router-view>
        <router-view name="create" @request-created="fetchDashboardData" :customer="customer" :professionals="professionals" :services="services"></router-view>
       
       </div>
    </div>
    <div v-else class="container mt-4">
      <!-- Edit Profile Link -->
      <div class="my-container mb-4">
        <router-link 
          class="btn btn-dark w-100" 
          :to="'/dashboard/editprofile/' + customer.id">
          Edit Profile Details
        </router-link>
      </div>
    
      <!-- Header -->
      <div class="center mb-4">
        <h1>Looking For?</h1> 
      </div>
      
      <!-- Service Cards Section -->
      <div class="my-container mb-4">
        <div class="card-container d-flex flex-wrap gap-3">
          <div v-if="services.length" 
               v-for="service in services" 
               :key="service.id" 
               class="card p-3 border rounded shadow-sm" 
               style="width: 18rem;">
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <router-link 
              class="btn btn-primary" 
              :to="'/dashboard/booking/' + customer.name + '/' + customer.id + '/' + service.id">
              Book
            </router-link>
          </div>
          <div v-else>
            <p>No services available</p>
          </div>
        </div>
      </div>
      
      <!-- Accepted Service Requests Section -->
      <h3>Accepted Service Requests</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="acceptedReqColumns" :data="acceptedServiceReqs">
          <template v-slot:action="{ row }">
            <td>
                  <div class="d-flex align-items-center">
                    <button 
                      @click="closeReq(row.id)"
                      :disabled="row.service_status === 'closed'"
                      class="btn btn-danger"
                      style="padding: 5px 10px; font-size: 14px; border-radius: 5px;"
                    >
                        {{ row.service_status === 'closed' ? "Closed" : "Close Req" }}
                    </button>

                  </div>
              </td>
          </template>
        </GenericTable>
      </main>
      
      <!-- Edit Requests Section -->
      <h3>Edit Requests</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="editReqColumns" :data="requestedServiceReqs">
          <template v-slot:action="{ row }">
            
              <td>
                  <div class="d-flex align-items-center gap-2">
      
                    <input 
                      type="datetime-local" 
                      :value="formatDate(row.date_of_request)"
                      @input="row.date_of_request = $event.target.value" 
                      class="form-control form-control-sm" 
                      style="max-width: 170px;"
                    >

                    <button 
                      @click="updateBooking(row.id, row.date_of_request)"
                      class="btn btn-primary btn-sm"
                      style="padding: 5px 10px; font-size: 14px; border-radius: 5px;"
                    >
                       Edit
                    </button>
                  </div>
                </td>
            
          </template>
        </GenericTable>
      </main>
      
      <!-- Service History Section -->
      <h3>Service History</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="historyReqColumns" :data="closedServiceReqs">
          <template v-slot:action="{ row }">
          
              <td>
                <input type="text" name="remark" id="remark" 
                  :value="row.remarks" 
                  @input="row.remarks = $event.target.value" 
                  class="rounded p-2" 
                  style="background-color:rgb(136, 228, 87); color: rgb(6,7,7);border: none;">
                <button
                 @click="updateReview(row.id, row.remarks)"
                 class="btn btn-danger" 
                 style="padding: 5px;"
                 >
                 &#10003;
                 </button>
              </td>
        
          </template>
        </GenericTable>
      </main>
    </div>
  `,
  data() {
    return {
      customer : {},
      services: [],
      service_reqs: [],
      professionals: [],
      acceptedReqColumns: [
        { label: "ID", key: "id" },
        { label: "Service Name", key: "service_name" },
        { label: "Professional Name", key: "prof_name" },
        { label: "Phone", key: "phone" },
        { label: "Status", key: "service_status" },
        { label: "Close Req", key: "action" } 
      ],
      editReqColumns: [
        { label: "ID", key: "id" },
        { label: "Service Name", key: "service_name" },
        { label: "Professional Name", key: "prof_name" },
        { label: "Phone", key: "phone" },
        { label: "Status", key: "service_status" },
        { label: "Edit Req Date", key: "action" } 
      ],
      historyReqColumns: [
        { label: "ID", key: "id" },
        { label: "Service Name", key: "service_name" },
        { label: "Professional Name", key: "prof_name" },
        { label: "Phone", key: "phone" },
        { label: "Date", key: "date_of_completion" },
        { label: "Review", key: "action" }
      ]
    };
  },
  components: {
    GenericTable,
    EditProfile,
    BookingsPage
  },
  computed: {
    // Check if the current route is a child route of /dashboard.
    // If the path is exactly '/dashboard', then no child is active.
     isChildRouteActive() {
      return this.$route.path !== '/dashboard';
      },
      childActive() {
        // $route.matched is an array of route records;

        return this.$route.matched.some(record => {
          return record.components && (record.components.create || record.components.editprofile);
        })
      },
      requestedServiceReqs() {
        let a = this.service_reqs
        .filter(req => req.service_status === "requested")
        .map(req => {
       
          const service = this.services.find(s => s.id === req.service_id) || {}; // Inject service details
          const prof = this.professionals.find(p => p.id === req.professional_id) || {}; // Inject professional details
          return {
            id: req.id,  // Ensure ID is included
            service_name: service.name || "Unknown",  // Ensure valid service name
            prof_name: prof.name || "Unknown",  // Ensure valid professional name
            phone: prof.phone || "N/A",  // Ensure valid phone number
            date_of_request: req.date_of_request,  
            service_status: req.service_status ,
          
          };
      
        });
        
        return a
      },
      acceptedServiceReqs() {
        let a = this.service_reqs
        .filter(req => req.service_status === "accepted")
        .map(req => {
       
          const service = this.services.find(s => s.id === req.service_id) || {}; // Inject service details
          const prof = this.professionals.find(p => p.id === req.professional_id) || {}; // Inject professional details
          return {
            id: req.id,  // Ensure ID is included
            service_name: service.name || "Unknown",  // Ensure valid service name
            prof_name: prof.name || "Unknown",  // Ensure valid professional name
            phone: prof.phone || "N/A",  // Ensure valid phone number
            date_of_request: req.date_of_request,  
            service_status: req.service_status ,
            
          };
      
        });
        
        return a
      },
      closedServiceReqs() {
        let a = this.service_reqs
        .filter(req => req.service_status === "closed")
        .map(req => {
       
          const service = this.services.find(s => s.id === req.service_id) || {}; // Inject service details
          const prof = this.professionals.find(p => p.id === req.professional_id) || {}; // Inject professional details
          return {
            id: req.id,  // Ensure ID is included
            service_name: service.name || "Unknown",  // Ensure valid service name
            prof_name: prof.name || "Unknown",  // Ensure valid professional name
            phone: prof.phone || "N/A",  // Ensure valid phone number
            date_of_request: req.date_of_request,  
            service_status: req.service_status ,
            date_of_completion: req.date_of_completion,
            remarks: req.remarks || "N/A"
          };
      
        });
        
        return a
      },
    },
  methods: {
    fetchDashboardData: function() {
      fetch(location.origin + '/api/customer/dashboard/' + this.$store.state.user_id , {
        headers: { 'Authentication-Token': this.$store.state.auth_token }
      })
        .then(response => response.json())
        .then(data => {
          // Expect your API to return an object with these keys:
          // services, acceptedRequests, editRequests, closedRequests
          console.log("Service Requests Data:", data["service_reqs"]); 
          this.customer = data["customer"];
          this.services = data["services"];
          this.service_reqs = data["service_reqs"];
          this.professionals = data["professionals"];
          console.log(this.professionals)
        })
        .catch(err => console.error("Error fetching customer dashboard data:", err));
    },//Profile Methods
    updateProfile(updatedProfile) {         

        Object.assign(this.customer,updatedProfile);
    },  //Service Request Methods
    async updateBooking(bookingId,newDate) {
      try {
        if (!newDate) {
            alert("Invalid date selected.");
            return;
        }

        const dateObject = new Date(newDate);
        if (isNaN(dateObject.getTime())) {
            alert("Invalid date format.");
            return;
        }
          // Ensure date is formatted as "YYYY-MM-DD HH:MM:SS"
          const formatedDate = dateObject.toISOString().slice(0, 19).replace("T", " ");
          console.log(formatedDate)
          const response = await fetch(location.origin + '/api/customer/bookings/' + this.customer.id + '/' + bookingId, 
            {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": this.$store.state.auth_token
                },
              body: JSON.stringify({ date_of_request: formatedDate})
            }
          );
    
          if (response.ok) {
            console.log("Booking updated successfully!");
            this.fetchDashboardData();  // Refresh data after update
          } else {
            alert("Failed to update booking.");
          }
        } catch (error) {
          console.error("Error updating booking:", error);
        }
      },
      async closeReq(serviceRequestId) {
        console.log(serviceRequestId)
        try {
          
          const response = await fetch(location.origin + '/api/customer/close-request/' + serviceRequestId, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token
            }
          });
      
          if (response.ok) {
            // Find the request in acceptedServiceReqs
            const requestIndex = this.acceptedServiceReqs.findIndex(req => req.id === serviceRequestId);
            if (requestIndex !== -1) {
              const closedRequest = { ...this.acceptedServiceReqs[requestIndex], service_status: "closed" };
              
              // Remove from acceptedServiceReqs and add to closedServiceReqs
              this.acceptedServiceReqs.splice(requestIndex, 1);
              this.closedServiceReqs.push(closedRequest);
            }
            this.fetchDashboardData();  // Refresh data after update
      
            console.log("Service request closed successfully!");
          } else {
            alert("Failed to close request.");
          }
        } catch (error) {
          console.error("Error closing request:", error);
        }
      },
      async updateReview(serviceRequestId,remarks) {
        console.log(serviceRequestId)
        try {
          
          const response = await fetch(location.origin + '/api/customer/review-request/' + serviceRequestId, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token
            },
            body: JSON.stringify({ review: remarks})

          });
      
          if (response.ok) {
       
            this.fetchDashboardData();  // Refresh data after update
      
            console.log("Review added successfully!");
          } else {
            alert("Failed to update review.");
          }
        } catch (error) {
          console.error("Error updating review:", error);
        }
      },
      
      //Util Methods
      formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        
        // Ensure the format is "YYYY-MM-DDTHH:MM"
        const formattedDate = date.toISOString().slice(0, 16);  
        return formattedDate;
      },
      
    
  },
  created() {
    this.fetchDashboardData();
    
  },
};
