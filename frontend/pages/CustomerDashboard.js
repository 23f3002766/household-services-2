import GenericTable from "../components/GenericTable.js";
import EditProfile from "./EditProfile.js";

export default {
  template: `
    
    <div v-if="isChildRouteActive">
      <router-view :customer="customer"  @profile-updated="updateProfile" ></router-view>
    </div>
    <div v-else class="container mt-4">
      <!-- Edit Profile Link -->
      <div class="my-container mb-4">
        <router-link 
          class="btn btn-secondary" 
          :to="'/dashboard/editprofile/' + customer.id">
          Edit Profile Details
        </router-link>
      </div>
    
    
      <!-- "Looking For?" Header -->
      <div class="center mb-4">
        <h1>Looking For?</h1> 
      </div>
      
      <!-- Service Cards Section -->
      <div class="my-container mb-4">
        <div class="card-container d-flex flex-wrap justify-content-start">
          <div v-if="services.length" 
               v-for="service in services" 
               :key="service.id" 
               class="card m-2 p-3" 
               style="width: 18rem;">
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <router-link 
              class="btn btn-primary" 
              :to="'/booking/' + customer.name + '/' + customer.id + '/' + service.id">
              Learn More
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
        <GenericTable :columns="acceptedReqColumns" :data="acceptedRequests">
          <template v-slot:action="{ row }">
            <router-link 
              class="btn btn-danger" 
              :to="'/closereq/' + customer.id + '/' + customer.name + '/' + row.id">
              {{ row.service_status }}
            </router-link>
          </template>
        </GenericTable>
      </main>
      
      <!-- Edit Requests Section -->
      <h3>Edit Requests</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="editReqColumns" :data="editRequests">
          <template v-slot:action="{ row }">
            <form :action="'/editreq/' + customer.id + '/' + row.id" method="POST">
              <td>
                {{ row.date_of_request }}
                <input type="datetime-local" name="date" id="date">
              </td>
              <td>
                <button type="submit" class="btn-edit">Edit</button>
              </td>
            </form>
          </template>
        </GenericTable>
      </main>
      
      <!-- Service History Section -->
      <h3>Service History</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="historyReqColumns" :data="closedRequests">
          <template v-slot:action="{ row }">
            <form :action="'/addremark/' + customer.id + '/' + customer.name + '/' + row.id" method="POST">
              <td>
                <input type="number" name="remark" id="remark" 
                  :value="row.remarks" 
                  style="background-color:greenyellow; color: rgb(6,7,7); border-radius:1em; border: none; padding: 1rem;">
                <button type="submit" class="btn-edit" style="padding: 5px;">&#10003;</button>
              </td>
            </form>
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
      acceptedRequests: [],
      editRequests: [],
      closedRequests: [],
      acceptedReqColumns: [
        { label: "ID", key: "id" },
        { label: "Service Name", key: "service.name" },
        { label: "Professional Name", key: "prof.name" },
        { label: "Phone", key: "prof.phone" },
        { label: "Status", key: "service_status" }
      ],
      editReqColumns: [
        { label: "ID", key: "id" },
        { label: "Service Name", key: "service.name" },
        { label: "Professional Name", key: "prof.name" },
        { label: "Phone", key: "prof.phone" },
        { label: "Date", key: "date_of_request" },
        { label: "Status", key: "service_status" }
      ],
      historyReqColumns: [
        { label: "ID", key: "id" },
        { label: "Service Name", key: "service.name" },
        { label: "Professional Name", key: "prof.name" },
        { label: "Phone", key: "prof.phone" },
        { label: "Date", key: "date_of_completion" },
        { label: "Rating", key: "remarks" }
      ]
    };
  },
  components: {
    GenericTable,
    EditProfile
  },
  computed: {
    // Check if the current route is a child route of /admin-dashboard.
    // If the path is exactly '/admin-dashboard', then no child is active.
     isChildRouteActive() {
      return this.$route.path !== '/dashboard';
      },
    },
  methods: {
    fetchDashboardData() {
      fetch(location.origin + '/api/customer/dashboard/' + this.$store.state.user_id , {
        headers: { 'Authentication-Token': this.$store.state.auth_token }
      })
        .then(response => response.json())
        .then(data => {
          // Expect your API to return an object with these keys:
          // services, acceptedRequests, editRequests, closedRequests
          this.customer = data["customer"];
          this.services = data["services"];
          this.service_reqs = data["service_reqs"];
          this.professionals = data["professionals"];
          console.log(this.customer)
        })
        .catch(err => console.error("Error fetching customer dashboard data:", err));
    },
    updateProfile(updatedProfile) {         

        Object.assign(this.customer,updatedProfile);
    }
  },
  created() {
    this.fetchDashboardData();
  }
};
