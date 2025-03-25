export default {
    props: {
        customer: {
          type: Object,
          required: true
        },
      },
    template: `
      <div class="container mt-4">
        <h1>Edit Profile Details</h1>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" v-model="name" class="form-control" id="name" placeholder="Your Name">
          </div>
          <div class="form-group mt-2">
            <label for="email">Email</label>
            <input type="email" v-model="email" class="form-control" id="email" placeholder="you@example.com">
          </div>
          <div class="form-group mt-2">
            <label for="address">Address</label>
            <input type="text" v-model="address" class="form-control" id="address" placeholder="Your Address">
          </div>
          <div class="form-group mt-2">
            <label for="phone">Phone</label>
            <input type="text" v-model="phone" class="form-control" id="phone" placeholder="Phone Number">
          </div>
          <div class="form-group mt-2">
            <label for="pincode">Pincode</label>
            <input type="number" v-model="pincode" class="form-control" id="pincode" placeholder="Pincode">
          </div>
          <button type="submit" class="btn btn-primary mt-3">Update Profile</button>
          <router-link class="btn btn-secondary ms-2 mt-3" to="/dashboard">Cancel</router-link>
        </form>
      </div>
    `,
    data() {
      return {
        // Local copies for form fields
        name: this.customer.name,
        email: this.customer.email,
        address: this.customer.address,
        phone: this.customer.phone,
        pincode: this.customer.pincode
      };
    },
    created() {
        this.loadProfile();
      },
    watch: {
        customer: 'loadProfile'
      },
    methods: {
        loadProfile() {
            this.name = this.customer.name;
            this.email = this.customer.email;
            this.address = this.customer.address;
            this.phone = this.customer.phone;
            this.pincode = this.customer.pincode
        },
      async updateProfile() {
        const res = await fetch(location.origin + '/api/customer/profile/' + this.$store.state.user_id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            address: this.address,
            phone: this.phone,
            pincode: this.pincode
          })
        })
        if (res.ok) {
            console.log("successfull")
            const updatedProfile= await res.json();
            this.$emit('profile-updated', updatedProfile , this.id);
            alert("Profile updated successfully!");
            this.$router.push('/dashboard');
          } else {
            console.error('Error updating profile:');
          }
      }
    },
  };
  