import GenericTable from "../components/GenericTable.js";
import CreateServicePage from "./CreateServicePage.js";
import EditServicePage from "./EditServicePage.js";

export default {
    template: `
  <div class="container mt-4 p-4 rounded shadow-sm" style="background: #f8f9fa; border-radius: 10px;">
  <h1 >Admin Dashboard</h1>
  
  <!-- Trigger create Service Req CSV -->
  <button class="btn btn-danger btn-sm mb-3" @click="create_csv"> Export Service Requests Data </button>
  
  <div v-if="isChildRouteActive">
    <div v-if="childActive" class="container mt-3 p-3 rounded shadow-sm" style="background: white; border-radius: 10px;">
      <router-view name="create" :services="services" @service-created="addService"></router-view>
      <router-view name="edit" :services="services" @service-updated="updateService"></router-view>
    </div>
  </div>
  
  <div v-else>
    <div class="container mt-3 mb-2 p-3 rounded shadow-sm" style="background: white; border-radius: 10px;">
      <router-link class="btn btn-dark w-100" to="/admin-dashboard/create-service">
        Create New Service
      </router-link>
    </div>
    
    <!-- Services Section -->
    <h3 >Current Services</h3>
    <GenericTable :columns="serviceColumns" :data="services" class="rounded border shadow-sm">
      <template v-slot:action="{ row }">
        <router-link class="btn btn-primary btn-sm" :to="'/admin-dashboard/editservice/' + row.id">
          Edit
        </router-link>
        <button class="btn btn-danger btn-sm" @click="deleteService(row.id)">Delete</button>
      </template>
    </GenericTable>
    
    <!-- Professionals Section -->
    <h3 >Professionals</h3>
    <GenericTable :columns="professionalColumns" :data="professionals" class="rounded border shadow-sm">
      
      <!-- File View Section -->
    <template v-slot:resume="{ row }">
      <a v-if="row.resume" :href="row.resume" target="_blank" class="btn btn-primary btn-sm">
          View Resume
      </a>
      <span v-else>Not Available</span>
    </template>
    <template v-slot:action="{ row }">
      
        <div v-if="!row.approved">
          <button class="btn btn-primary btn-sm me-1" @click="approveProfessional(row.id)">&#10003;</button>
          <button class="btn btn-danger btn-sm" @click="blockUser(row.id)">&#10005;</button>
        </div>
        <div v-else-if="row.active">
          <button class="btn btn-secondary btn-sm" @click="blockUser(row.id)">Block</button>
        </div>
        <div v-else>
          <button class="btn btn-secondary btn-sm">Blocked</button>
        </div>
      </template>
    </GenericTable>
    
    <!-- Customers Section -->
    <h3 >Customers</h3>
    <GenericTable :columns="customerColumns" :data="customers" class="rounded border shadow-sm">
      <template v-slot:action="{ row }">
        <div v-if="row.active">
          <button class="btn btn-secondary btn-sm" @click="blockUser(row.id)">Block</button>
        </div>
        <div v-else>
          <button class="btn btn-secondary btn-sm">Blocked</button>
        </div>
      </template>
    </GenericTable>
    
    <!-- Service Requests Section -->
    <h3>Service Requests</h3>
    <GenericTable :columns="requestColumns" :data="serviceRequests" class="rounded border shadow-sm">
      <template v-slot:action="{ row }">
        <button class="btn btn-danger btn-sm">Delete</button>
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
          { label: "Resume", key: "resume"},
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
      //Services methods
      addService(newService) {
        this.services.push(newService);
      },
      updateService(updatedService,sid) { 
          updatedService.id = sid         
          sid = parseInt(sid) - 1
          console.log(sid)
          this.$set(this.services,sid, updatedService);
      },
      //Async job method
      async create_csv(){
        const res = await fetch(location.origin + '/create-csv', {
            headers: {
                'Authentication-Token': this.$store.state.auth_token 
            }
        });
    
        const data = await res.json();
        const task_id = data.task_id;
    
        const interval = setInterval(async () => {
            const res = await fetch(`${location.origin}/get-csv/${task_id}`,
              {
                headers: {
                    'Authentication-Token': this.$store.state.auth_token 
              }
        });
            
            if (res.status === 200) {  
                alert('Data successfully exported');
                
                clearInterval(interval);
            } else if (res.status === 404 || 500) {
                console.error('File not found');  // Handle error
                clearInterval(interval);
            }
        }, 5000);
    }
    
    },
    created: function() {
      this.fetchInitData();
    }
  };


  