export default {
    template : `
     <div class="container mt-3">
    <nav class="navbar navbar-expand-lg bg-white shadow-sm rounded p-3">
        <div class="container-fluid">

            <router-link class="navbar-brand fw-bold text-dark" to="/">
                A to Z Household Services
            </router-link>

            <!-- Navbar Toggle Button for Mobile -->
            <button class="navbar-toggler" type="button" @click="toggleNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Navbar Links -->
            <div class="collapse navbar-collapse justify-content-end" :class="{ 'show': isNavbarOpen }" id="navbarNav">
                <ul class="navbar-nav gap-2">
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-semibold hover-effect" v-if="!$store.state.loggedIn" to="/login">Login</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-semibold hover-effect" v-if="!$store.state.loggedIn" to="/register">Register</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-semibold hover-effect" v-if="!$store.state.loggedIn" to="/signup">Sign Up</router-link>
                    </li>

                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-bold hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to="/admin-dashboard">Dashboard</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-bold hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'customer'" to="/dashboard">Dashboard</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-bold hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'customer'" to="/search">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-bold hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to="/search">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link text-primary fw-bold hover-effect" v-if="$store.state.loggedIn && $store.state.role == 'professional'" to="/professional-dashboard">Explore</router-link>
                    </li>
                    

                    <!-- Logout Button -->
                    <li class="nav-item">
                        <button class="nav-link text-danger fw-bold border-0 bg-transparent hover-effect" v-if="$store.state.loggedIn" @click="$store.commit('logout')">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</div>


    `,
    data() {
        return {
            isNavbarOpen: false
        };
    },
    methods: {
        toggleNavbar() {
            this.isNavbarOpen = !this.isNavbarOpen;
        }
    }
    

}

