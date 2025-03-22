import GenericTable from "../components/GenericTable.js";

export default {
  template: `
    <div class="container mt-4">
      <h3>Pending Bookings</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="pendingBookingColumns" :data="pendingBookings">
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
        <GenericTable :columns="confirmedBookingColumns" :data="confirmedBookings">
          <template v-slot:action="{ row }">
            <button class="btn btn-primary" @click="markComplete(row.id)">Mark as Completed</button>
          </template>
        </GenericTable>
      </main>
      <h3>Completed Bookings</h3>
      <main class="my-container mb-4">
        <GenericTable :columns="completedBookingColumns" :data="completedBookings">
        </GenericTable>
      </main>
    </div>
  `,
  data() {
    return {
      pendingBookings: [],
      confirmedBookings: [],
      completedBookings: [],
      pendingBookingColumns: [
        { label: "ID", key: "id" },
        { label: "Customer Name", key: "customer.name" },
        { label: "Service Name", key: "service.name" },
        { label: "Date", key: "date" }
      ],
      confirmedBookingColumns: [
        { label: "ID", key: "id" },
        { label: "Customer Name", key: "customer.name" },
        { label: "Service Name", key: "service.name" },
        { label: "Date", key: "date" }
      ],
      completedBookingColumns: [
        { label: "ID", key: "id" },
        { label: "Customer Name", key: "customer.name" },
        { label: "Service Name", key: "service.name" },
        { label: "Date", key: "date" }
      ]
    };
  },
  methods: {
    fetchBookings() {
      fetch(location.origin + '/api/bookings', {
        headers: { 'Authentication-Token': this.$store.state.auth_token }
      })
        .then(response => response.json())
        .then(data => {
          this.pendingBookings = data.pending;
          this.confirmedBookings = data.confirmed;
          this.completedBookings = data.completed;
        })
        .catch(err => console.error("Error fetching bookings:", err));
    },
    acceptBooking(bookingId) {
      fetch(`/api/bookings/${bookingId}/accept`, { method: 'POST' })
        .then(() => this.fetchBookings());
    },
    rejectBooking(bookingId) {
      fetch(`/api/bookings/${bookingId}/reject`, { method: 'POST' })
        .then(() => this.fetchBookings());
    },
    markComplete(bookingId) {
      fetch(`/api/bookings/${bookingId}/complete`, { method: 'POST' })
        .then(() => this.fetchBookings());
    }
  },
  created() {
    //this.fetchBookings();
  }
};
