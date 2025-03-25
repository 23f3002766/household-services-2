export default {
    template : `
    <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg rounded-4" style="width: 380px; background-color: #f8f9fa;">
        <h2 class="text-center mb-4 fw-bold text-primary">Login</h2>

        <form @submit.prevent="submitLogin">
            <!-- Email Input -->
            <div class="mb-3">
                <input 
                    class="form-control py-2 px-3 rounded-pill shadow-sm" 
                    placeholder="Enter your email" 
                    v-model="email"
                />
            </div>

            <!-- Password Input -->
            <div class="mb-3">
                <input 
                    class="form-control py-2 px-3 rounded-pill shadow-sm" 
                    type="password" 
                    placeholder="Enter your password" 
                    v-model="password"
                />
            </div>

            <!-- Login Button -->
            <button class="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm hover-effect">
                Login
            </button>

            <!-- Register Link -->
            <p class="mt-3 text-center text-secondary">
                Don't have an account? 
                <router-link to="/signup" class="text-decoration-none text-primary fw-semibold">Sign Up</router-link>
            </p>
        </form>
    </div>
</div>

    `,
    data(){
        return {
            email : null,
            password : null,
        } 
    },
    methods : {
        async submitLogin(){
            if (!this.email || !this.password) {
                alert("All fields are required!");
                return;
            }
            const res = await fetch(location.origin+'/login', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'email': this.email,'password': this.password})
                })
            if (res.ok){
                console.log('we are logged in')
                const data = await res.json()
              
                localStorage.setItem('user', JSON.stringify(data))
                
                this.$store.commit('setUser')
                if(data.role == 'customer'){
                    this.$router.push('/dashboard')
                }
                if(data.role == 'professional'){
                    this.$router.push('/professional-dashboard')
                }
                if(data.role == 'admin') {
                    this.$router.push('/admin-dashboard')
                }
                
            } else {
                alert("signin failed")
            }
        }
    }
}