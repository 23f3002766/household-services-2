export default {
  props: {
    services: {
      type: Array,
      default: () => []
    }
  },
   template : `
      <div class="my-container">
        <div class="center">
          <h1>Service Register</h1>
        </div>
        <div class="my-panel">
          <div class="center">
            <h3>Add New Service</h3>
          </div>
          <form @submit.prevent="createService">
            <div class="input-form">
              <div class="form-group">
                <label for="service_name" class="form-label">Service Name</label>
                <input type="text" class="form-control"  placeholder="Plumbing" v-model="service_name">
              </div>
              <div class="form-group">
                <label for="price" class="form-label">Price</label>
                <input type="text" class="form-control" placeholder="$40" v-model="price" >
              </div>
              <div class="form-group">
                <label for="time_required" class="form-label">Time Required (hrs)</label>
                <input type="text" class="form-control" placeholder="2" v-model="time_required" >
              </div>
              <div class="form-group">
                <label for="description" class="form-label">Description</label>
                <input type="text" class="form-control mb-2" placeholder="Brief description"  v-model="description" >
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-primary" >Add</button>
              </div>
            </div>
          </form>
          <button class="btn btn-danger mt-2" @click="Cancel">Cancel</button>
        </div>
      </div>
    `,
    data(){
      return {
          service_name : null,
          price : null,
          time_required : null,
          description : null,

      } 
  },
  methods : {
      async createService(){
          const res = await fetch(location.origin+'/api/admin/service', 
              {
                  method : 'POST', 
                  headers: {'Content-Type' : 'application/json','Authentication-Token' : this.$store.state.auth_token}, 
                  body : JSON.stringify({'service_name': this.service_name,'price': this.price,'time_required': this.time_required, 'description': this.description, })
              })
          if (res.ok){
              console.log('Service Created')
              let l = this.services.length + 1
              let s = {
                        'description': this.description ,
                        'id': l ,
                        'price': this.price,
                        'name': this.service_name,     
                        'time_required': this.time_required,
                      }
                      console.log(s)
              this.$emit('service-created', s);
              const data = await res.json()

              this.$router.push('/admin-dashboard')
            }
          
      },
    Cancel() {
      this.$router.push('/admin-dashboard')
      }
  },
}