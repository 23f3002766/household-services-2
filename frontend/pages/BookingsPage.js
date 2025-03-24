export default {
    props: {
      customer: Object,
      services: Array,
      professionals: Array
    },
    computed: {
      filteredProfessionals() {
        if (!this.professionals || this.professionals.length === 0) {
          return [];
        }
        return this.professionals.filter(professional => {
          return professional.service_id == this.$route.params.sid && professional.approved;
        });
      }
    },
    template: `
      <div class="my-container">
        <div class="center">
          <h1>Request a Service</h1>
        </div>
        <div class="my-panel">
          <div class="center">
            <h3>New  Service Request </h3>
          </div>
          <form @submit.prevent="createRequest">
            <div class="input-form">
              <div class="form-group">
                <label for="professional" class="form-label">Select professional</label>
                <select v-model="professional_id" class="form-control">
                  <option v-for="professional in filteredProfessionals" :key="professional.id" :value="professional.id">
                    {{ professional.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="date" class="form-label">Preferred Date & Time</label>
                <input type="datetime-local" class="form-control" v-model="date_of_request">
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-primary mt-2">Submit Request</button>
              </div>
            </div>
          </form>
          <button class="btn btn-danger mt-2" @click="cancel">Cancel</button>
        </div>
      </div>
    `,
    data() {
      return {
        professional_id: null,
        date_of_request: null
      };
    },
    methods: {
      async createRequest() {
        if (!this.professional_id || !this.date_of_request) {
          alert("Please fill all fields.");
          return;
        }

        if (!this.date_of_request) {
          alert("Invalid date selected.");
          return;
      }

      const dateObject = new Date(this.date_of_request);
      if (isNaN(dateObject.getTime())) {
          alert("Invalid date format.");
          return;
      }
        // Ensure date is formatted as "YYYY-MM-DD HH:MM:SS"
        const formatedDate = dateObject.toISOString().slice(0, 19).replace("T", " ");
        console.log(formatedDate)
        
        const res = await fetch(location.origin + '/api/customer/bookings/' + this.$route.params.cid, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token
          },
          body: JSON.stringify({
            customer_id: this.$route.params.cid,
            professional_id: this.professional_id,
            service_id: this.$route.params.sid,
            date_of_request: formatedDate
          })
        });
        
        if (res.ok) {
          const data = await res.json()
          console.log(data)
          console.log('Service request submitted successfully!');
          this.$emit('request-created');
          this.$router.push('/dashboard');
        } else {
          alert('Failed to submit request. Try again.');
        }
      },
      cancel() {
        this.$router.back();
      }
    }
  };
  