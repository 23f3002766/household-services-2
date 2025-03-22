import GenericTable from "../components/GenericTable.js";

export default {
  template: `
    <div class="container mt-4">
      <h3>Pending Bookings</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="pendingBookingColumns" :data="requestedServiceReqs">
          <template v-slot:action="{ row }">
            <div class="d-flex">
              <button class="btn btn-success me-2" @click="acceptBooking(row.id)">Accept</button>
              <button class="btn btn-danger" @click="rejectBooking(row.id)">Reject</button>
            </div>
          </template>
        </GenericTable>
      </main>
      <h3>Confirmed Bookings</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="confirmedBookingColumns" :data="confirmedServiceReqs">
          <template v-slot:action="{ row }">
            <button class="btn btn-primary" @click="markComplete(row.id)">Mark as Completed</button>
          </template>
        </GenericTable>
      </main>
      <h3>Completed Bookings</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="completedBookingColumns" :data="closedServiceReqs">
        </GenericTable>
      </main>
    </div>
  `,
  data() {
    return {
      service_reqs: [],
      pendingBookings: [],
      confirmedBookings: [],
      completedBookings: [],
      pendingBookingColumns: [
        { label: "ID", key: "id" },
        { label: "Customer Name", key: "customer_name" },
        { label: "Service Name", key: "service_name" },
        { label: "Date", key: "date_of_request" },
        { label: "Status", key: "service_status" },
        { label: "Confirm Req", key: "action" } 
      ],
      confirmedBookingColumns: [
        { label: "ID", key: "id" },
        { label: "Customer Name", key: "customer_name" },
        { label: "Service Name", key: "service_name" },
        { label: "Date", key: "date_of_request" },
        { label: "Status", key: "service_status" },
        { label: "Close Req", key: "action" } 
      ],
      completedBookingColumns: [
        { label: "ID", key: "id" },
        { label: "Customer Name", key: "customer_name" },
        { label: "Service Name", key: "service_name" },
        { label: "Date", key: "date_of_completion" },
        { label: "Status", key: "service_status" }
      ]
    };
  },
  computed: {
    requestedServiceReqs() {
      let a = this.service_reqs
      .filter(req => req.service_status === "requested")
      .map(req => {
        return {
          id: req.id,  // Ensure ID is included
          service_name: req.service ? req.service.name : "Unknown",  // Ensure valid service name
          customer_name: req.customer ? req.customer.name : "Unknown",  // Ensure valid professional name
          date_of_request: req.date_of_request,  
          service_status: req.service_status ,
        
        };
    
      });
      if(!a) {
        console.log("service requests empty")
        a = []
      }

      return a
      },
      confirmedServiceReqs() {
        let a = this.service_reqs
        .filter(req => req.service_status === "accepted")
        .map(req => {
          return {
            id: req.id,  // Ensure ID is included
            service_name: req.service ? req.service.name : "Unknown",  // Ensure valid service name
            customer_name: req.customer ? req.customer.name : "Unknown",  // Ensure valid professional name
            date_of_request: req.date_of_request,  
            service_status: req.service_status ,
          
          };
      
        });
        if(!a) {
          console.log("service requests empty")
          a = []
        }
  
        return a
        },
        closedServiceReqs() {
          let a = this.service_reqs
          .filter(req => req.service_status === "closed")
          .map(req => {
            return {
              id: req.id,  // Ensure ID is included
              service_name: req.service ? req.service.name : "Unknown",  // Ensure valid service name
              customer_name: req.customer ? req.customer.name : "Unknown",  // Ensure valid professional name
              date_of_completion: req.date_of_completion,  
              service_status: req.service_status ,
            
            };
        
          });
          if(!a) {
            console.log("service requests empty")
            a = []
          }
    
          return a
          },
  },
  components: {
    GenericTable
  },
  methods: {
    fetchBookings() {
      fetch(location.origin + '/api/professional/service-requests', {
        headers: { 'Authentication-Token': this.$store.state.auth_token }
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          this.service_reqs = data;
        })
        .catch(err => console.error("Error fetching bookings:", err));
    },
    acceptBooking(bookingId) {
      fetch(`/api/service-requests/${bookingId}/action`, { 
          method: 'PUT',
          headers: { 'Authentication-Token': this.$store.state.auth_token ,
                     'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: "accept" }) 
          })
          .then(() => this.fetchBookings())
          .catch(err => console.error("Error accepting booking:", err));;
    },
    rejectBooking(bookingId) {
      fetch(`/api/service-requests/${bookingId}/action`, { 
          method: 'PUT',
          headers: { 'Authentication-Token': this.$store.state.auth_token,
                      'Content-Type': 'application/json'
           },
          body: JSON.stringify({ action: "reject" }) 
          })
          .then(() => this.fetchBookings())
          .catch(err => console.error("Error rejecting booking:", err));;
    },
    markComplete(bookingId) {
      fetch(`/api/service-requests/${bookingId}/close`, { 
        method: 'PUT' ,
        headers: { 'Authentication-Token': this.$store.state.auth_token,
                    'Content-Type': 'application/json'
         } })
        .then(() => this.fetchBookings())
        .catch(err => console.error("Error closing booking:", err));;
    }
  },
  created() {
    this.fetchBookings();
  }
};
