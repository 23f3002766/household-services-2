import GenericTable from "../components/GenericTable.js";
import BookingsPage from "./BookingsPage.js";

export default {
  template: `
  <div>
      <!-- Header -->
      <div class="center mb-4">
        <h1>Search</h1> 
      </div>

            <!-- Search Filters for Professionals -->
      <div class="search-filters my-container mb-3">
        <input v-model="searchPincode" placeholder="Search by Pincode" class="form-control mb-2" />
        <input v-model="searchService" placeholder="Search by Service Name" class="form-control" />
      </div>
      
      <!-- Service Cards Section -->
      <div class="my-container mb-4">
        <div class="card-container d-flex flex-wrap justify-content-start">
          <div v-if="filteredProfessionals.length" 
               v-for="professional in filteredProfessionals" 
               :key="professional.id" 
               class="card m-2 p-3" 
               style="width: 18rem;">
            <h3>{{ professional.name }}</h3>
            
            <h3>Service: {{ professional.service_name}}</h3>

            <p> Pincode: {{ professional.pincode }}</p>
            <router-link 
              
              class="btn btn-primary" 
              v-if="$store.state.role == 'customer'"
              :to="'/dashboard/booking/' + customer.name + '/' + customer.id + '/' + professional.service_id">
              Book
            </router-link>
            <div v-else-if="professional.approved == false"  >
              <button class="btn btn-primary btn-sm me-1" @click="approveProfessional(professional.id)">&#10003;</button>
              <button class="btn btn-danger btn-sm" @click="blockUser(professional.id)">&#10005;</button>
            </div>
            <div v-else-if="professional.active" >
              <button class="btn btn-secondary btn-sm" @click="blockUser(professional.id)">Block</button>
            </div>
            <div v-else >
              <button class="btn btn-secondary btn-sm">Blocked</button>
            </div>
          </div>
          <div v-else>
            <p>No services available</p>
          </div>
        </div>
      </div>
      <div v-if="$store.state.role == 'customer'">
      <!-- Service History Section -->
      <h3>Service History</h3>
        <div class="search-filters my-container mb-3">
          <input v-model="searchClosedService" placeholder="Search by Service Name" class="form-control mb-2" />
          <input v-model="searchClosedProfessional" placeholder="Search by Professional Name" class="form-control" />
        </div>
      <main class="my-container mb-4">
        <GenericTable :columns="historyReqColumns" :data="filteredClosedServiceReqs">">
          <template v-slot:action="{ row }">
          
              <td>
                <input type="text" name="remark" id="remark" 
                  :value="row.remarks" 
                  @input="row.remarks = $event.target.value" 
                  style="background-color:greenyellow; color: rgb(6,7,7); border-radius:1em; border: none; padding: 1rem;">
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
    </div>
    </div>
  `,
  data() {
    return {
      customer : {},
      services: [],
      service_reqs: [],
      professionals: [],
      searchPincode: "",
      searchService: "",
      searchClosedService: "",
      searchClosedProfessional: "",
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
    BookingsPage
  },
  computed: {
      filteredProfessionals() {
        return this.professionals
        .map(req => {
       
            const service = this.services.find(s => s.id === req.service_id) || {}; // Inject service details
            return {
              id: req.id,  // Ensure ID is included
              service_name: service.name || "Unknown",  // Ensure valid service name
              name: req.name || "Unknown",  // Ensure valid professional name
              phone: req.phone || "N/A",  // Ensure valid phone number  
              pincode: req.pincode,
              service_id: req.service_id,
              approved: req.approved,
              active: req.active
            };
        
          })
        .filter(prof => {
           
            const matchesPincode = this.searchPincode === "" || String(prof.pincode).includes(this.searchPincode.toLowerCase())
            const matchesService = this.searchService === "" || String(prof.service_name).toLowerCase().includes(this.searchService.toLowerCase())
            
            return matchesPincode && matchesService;
        });
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
      filteredClosedServiceReqs() {
        return this.closedServiceReqs
        .filter(req => {
          const matchedService = req.service_name.toLowerCase().includes(this.searchClosedService.toLowerCase())
          const matchedProfessional = req.prof_name.toLowerCase().includes(this.searchClosedProfessional.toLowerCase())
          return matchedProfessional && matchedService
        });
      }
    },
  methods: {
    fetchDashboardData: function() {
    if (this.$store.state.role == "customer") {
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
        } else {
            fetch(location.origin + '/api/admin/dashboard', {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                } 
              })
                .then(response => response.json())
                .then(data => { 
                  this.professionals = data["professionals"]; 
                  this.customers = data['customers']; 
                  this.serviceRequests = data['service_reqs']; 
                  this.services = data["services"];
                 console.log(this.serviceRequests)
                })
                .catch(error => console.error("Error fetching professionals:", error));

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
      //Admin Search Page Methods
      fetchInitData: function() {
        fetch(location.origin + '/api/admin/dashboard', {
          headers : {
              'Authentication-Token' : this.$store.state.auth_token
          } 
        })
          .then(response => response.json())
          .then(data => { 
            this.professionals = data["professionals"]; 
            this.customers = data['customers']; 
            this.serviceRequests = data['service_reqs']; 
            this.services = data["services"];
           console.log(this.serviceRequests)
          })
          .catch(error => console.error("Error fetching professionals:", error));
      },
      approveProfessional: function(profId) {
        fetch(location.origin + '/api/admin/approve/' + profId, { method: 'POST', headers : { 'Authentication-Token' : this.$store.state.auth_token}})
          .then(response => response.json())   
          .then(response => {
            if(response.status == 200){           
              let prof = this.professionals.find(p => p.id === profId);
              if(prof) prof.approved = true;
              console.log(prof)
              console.log(this.professionals)
            }
          })
          .catch(error => console.error("Error approving professional:", error));
      },
      blockUser: function(userId) {
        fetch(location.origin + '/api/admin/block/' + userId, { method: 'POST', headers : { 'Authentication-Token' : this.$store.state.auth_token} })
          .then(response => {
            if(response.ok){
              let user = this.professionals.find(u => u.id === userId);
              if(user) {
                  user.active = false;
              } else {
                let user = this.customers.find(u => u.id === userId);
                if(user) {
                  user.active = false;
              } else {
                console.log("user not found , State Update Error!!!")
              }
              }
              console.log("User Blocked Successfully")
            }
          })
          .catch(error => console.error("Error blocking customer:", error));
      },
    
  },
  created() {

        this.fetchDashboardData();  
    }
}