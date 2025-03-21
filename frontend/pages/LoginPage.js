export default {
    template : `
    <div class="container mt-5">
        <div class="card p-5">
        <form @submit.prevent="submitLogin">
            <div class="p-2 d-flex flex-column align-items-center">
                <input class="form-control mb-2 w-50" placeholder="Email" v-model="email" />  
                <input class="form-control mb-2 w-50" type="password" placeholder="Password" v-model="password" />  
                <button class="btn btn-primary w-50">Login</button>
            </div>
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
                this.$router.push('/')
            }
        }
    }
}