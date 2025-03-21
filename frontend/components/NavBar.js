export default {
    template : `
    <div class="container mt-3">
    <nav class="navbar navbar-expand-lg navbar-light bg-light p-3 rounded shadow-sm">
        <div class="d-flex align-items-center">
            <router-link class="navbar-brand fw-bold" to="/">Home</router-link>

            
                <router-link class="nav-link text-primary me-3 hover-effect" v-if="!$store.state.loggedIn" to="/login">Login</router-link>
                <router-link class="nav-link text-secondary me-3 hover-effect" v-if="!$store.state.loggedIn" to="/register">Register</router-link>
                <router-link class="nav-link text-info me-3 hover-effect" v-if="!$store.state.loggedIn" to="/signup">SignUp</router-link>

                <router-link class="nav-link fw-bold text-primary me-3 hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to="/admin-dashboard">Admin Dash</router-link>
                <router-link class="nav-link fw-bold text-success me-3 hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'customer'" to="/dashboard">Feed</router-link>
                <router-link class="nav-link fw-bold text-warning me-3 hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'professional'" to="/professional-dashboard">Explore</router-link>

                <button class="nav-link text-danger border-0 bg-transparent" v-if="$store.state.loggedIn" @click="$store.commit('logout')">Logout</button>

            
        </div>
    </nav>
    </div>

    `
    

}

