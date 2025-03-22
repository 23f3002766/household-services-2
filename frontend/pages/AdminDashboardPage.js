import GenericTable from "../components/GenericTable.js";
import CreateServicePage from "./CreateServicePage.js";
import EditServicePage from "./EditServicePage.js";

export default {
    template: `
    <div class="container mt-4">
      <h1>Admin Dashboard</h1>
       



      <div v-if="isChildRouteActive">
        <!-- This container shows the child component if one is active -->
        <div v-if="childActive" class="container mt-3 bg-light p-3 rounded shadow-sm">
     
          <router-view name="create" :services="services" @service-created="addService"></router-view>

          <router-view name="edit" :services="services" @service-updated="updateService"></router-view>
      
        </div>
      </div>
      
      <!-- Otherwise, show the dashboard content -->
      <div v-else>
        <div class="container mt-3 mb-2 bg-light p-3 rounded shadow-sm">
          <router-link class="navbar-brand fw-bold" to="/admin-dashboard/create-service">
            Create New Service
          </router-link>
        </div>
      
        <!-- Services Section -->
       <h3>Current Services</h3>
        <GenericTable :columns="serviceColumns" :data="services">
        
          <template v-slot:action="{ row }">
            <router-link 
            class="btn btn-primary btn-sm"
            :to="'/admin-dashboard/editservice/' + row.id">
              Edit
            </router-link>
            <button class="btn btn-danger btn-sm" @click="deleteService(row.id)">Delete</button>
          </template>
        </GenericTable>
        
        <!-- Professionals Section -->
        <h3>Professionals</h3>
        <GenericTable :columns="professionalColumns" :data="professionals">
          
          <template v-slot:action="{ row }">      
            <div v-if="!row.approved" >
              <button class="btn btn-primary btn-sm me-1" @click="approveProfessional(row.id)">&#10003;</button>
              <button class="btn btn-danger btn-sm" @click="blockUser(row.id)">&#10005;</button>
            </div>
            <div v-else-if="row.active" >
              <button class="btn btn-secondary btn-sm" @click="blockUser(row.id)">Block</button>
            </div>
            <div v-else >
              <button class="btn btn-secondary btn-sm">Blocked</button>
            </div>
          </template>
        </GenericTable>
        
        <!-- Customers Section -->
        <h3>Customers</h3>
        <GenericTable :columns="customerColumns" :data="customers">
          <template v-slot:action="{ row }">
            <div v-if="row.active" >
              <button class="btn btn-secondary btn-sm" @click="blockUser(row.id)">Block</button>
            </div>
            <div v-else >
              <button class="btn btn-secondary btn-sm">Blocked</button>
            </div>
          </template>
        </GenericTable>
        
        <!-- Service Requests Section -->
        <h3>Service Requests</h3>
        <GenericTable :columns="requestColumns" :data="serviceRequests"> 
         <template v-slot:action="{ row }">
            <button class="btn btn-danger btn-sm" >Delete</button>
          </template>
        </GenericTable>
      </div>
    </div>


    `,
    data: function() {
      return {
        services: [],
        professionals: [],
        customers: [],
        serviceRequests: [],
        serviceColumns: [
          { label: "ID", key: "id" },
          { label: "Service Name", key: "name" },
          { label: "Time Required", key: "time_required" },
          { label: "Base Price", key: "price" },
          { label: "Actions", key: "action" }
        ],
        professionalColumns: [
          { label: "ID", key: "id" },
          { label: "Name", key: "name" },
          { label: "Service ID", key: "service_id" },
          { label: "Pincode", key: "pincode" },
          { label: "Action", key: "action" }
        ],
        customerColumns: [
          { label: "ID", key: "id" },
          { label: "Name", key: "name" },
          { label: "Address", key: "address" },
          { label: "Pin Code", key: "pincode" },
          { label: "Action", key: "action" }
        ],
        requestColumns: [
          { label: "ID", key: "id" },
          { label: "Req Date", key: "date_of_request" },
          { label: "Status", key: "service_status" },
          { label: "Review", key: "remarks" },
        ]
      };
    },
    components: {
      GenericTable,
      EditServicePage,
      CreateServicePage
    },
  computed: {
    // Check if the current route is a child route of /admin-dashboard.
    // If the path is exactly '/admin-dashboard', then no child is active.
     isChildRouteActive() {
      return this.$route.path !== '/admin-dashboard';
      },
      childActive() {
        // $route.matched is an array of route records;

        return this.$route.matched.some(record => {
          return record.components && (record.components.create || record.components.edit);
        })
      },
    },

    methods: {
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
      deleteService: function(serviceId) {
        fetch(location.origin + '/api/admin/delete-service/' + serviceId, { method: 'DELETE', headers : { 'Authentication-Token' : this.$store.state.auth_token} })
          .then(response => {
            if(response.ok){
              this.services = this.services.filter(service => service.id !== serviceId);
              console.log("Service Deleted Successfully")
            }
          })
          .catch(error => console.error("Error deleting service :", error));
      },
      viewPDFUrl: function(professionalId) {
       //Do it later
        return window.apiHelper.viewPDFUrl(professionalId);
      },
      //Services methods
      addService(newService) {
        this.services.push(newService);
      },
      updateService(updatedService,sid) { 
          updatedService.id = sid         
          sid = parseInt(sid) - 1
          console.log(sid)
          this.$set(this.services,sid, updatedService);
      }
    },
    created: function() {
      this.fetchInitData();
    }
  };


  