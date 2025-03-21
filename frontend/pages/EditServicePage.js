// EditServicePage.js
export default {
    // The route passes the service id as a prop; the parent passes "services" as a prop too.
    props: {
      id: {
        type: String,
        required: true
      },
      services: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        service: null,
        service_name: '',
        price: '',
        time_required: '',
        description: ''
      };
    },
    created() {
      this.loadService();
    },
    watch: {
      services: 'loadService'
    },
    methods: {
      loadService() {
 
        const svc = this.services.find(s => s.id.toString() === this.id.toString());
        if (svc) {
          this.service = svc;
          this.service_name = svc.name;
          this.price = svc.price;
          this.time_required = svc.time_required;
          this.description = svc.description;
        }
      },
      async updateService() {
        // Update the service via an API call (using PUT as an example)
        const res = await fetch(location.origin + '/api/admin/update-service/' + this.id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token
          },
          body: JSON.stringify({
            service_name: this.service_name,
            price: this.price,
            time_required: this.time_required,
            description: this.description
          })
        });
        if (res.ok) {
          console.log('Service updated');
          const updatedService = await res.json();
          console.log(updatedService)
          this.$emit('service-updated', updatedService , this.id);
            console.log(this.services)
          this.$router.push('/admin-dashboard');
        } else {
          console.error('Update failed');
        }
      }
    },
    template: `
      <div class="my-container">
        <div class="center">
          <h1>Edit Service</h1>
        </div>
        <div class="my-panel">
          <div class="center">
            <h3>Edit Service Details</h3>
          </div>
          <form @submit.prevent="updateService">
            <div class="input-form">
              <div class="form-group">
                <label for="service_name" class="form-label">Service Name</label>
                <input type="text" class="form-control" v-model="service_name" placeholder="Plumbing">
              </div>
              <div class="form-group">
                <label for="price" class="form-label">Price</label>
                <input type="text" class="form-control" v-model="price" placeholder="$40">
              </div>
              <div class="form-group">
                <label for="time_required" class="form-label">Time Required (hrs)</label>
                <input type="text" class="form-control" v-model="time_required" placeholder="2">
              </div>
              <div class="form-group">
                <label for="description" class="form-label">Description</label>
                <input type="text" class="form-control" v-model="description" placeholder="Brief description">
              </div>
              <div class="form-group mt-3">
                <button type="submit" class="btn btn-primary">Update</button>
                <router-link class="btn btn-secondary ms-2" to="/admin-dashboard">Cancel</router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    `
  };
  