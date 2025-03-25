export default {
    template: `
    <div class="container mt-5">
        <div class="hero">
            <h1>Welcome to A to Z Household Services</h1>
            <p>Your one-stop solution for all household needs, from cleaning to repairs!</p>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'admin'" to="/admin-dashboard" class="btn cta-btn">Get Started</router-link>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'customer'" to="/dashboard" class="btn cta-btn">Get Started</router-link>
            <router-link v-if="$store.state.loggedIn && $store.state.role == 'professional'" to="/professional-dashboard" class="btn cta-btn">Get Started</router-link>
            <router-link v-if="!$store.state.loggedIn" to="/login" class="btn cta-btn">Get Started</router-link>
        </div>
        
        <h2 class="text-center my-5">Our Services</h2>
        <div class="row text-center">
            <div class="col-md-4">
                <div class="card service-card p-4">
                    <h3>Home Cleaning</h3>
                    <p>Professional cleaning services to keep your home spotless.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card service-card p-4">
                    <h3>Plumbing</h3>
                    <p>Reliable plumbing solutions for all your household needs.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card service-card p-4">
                    <h3>Electrical Repairs</h3>
                    <p>Expert electricians to fix all your household electrical issues.</p>
                </div>
            </div>
        </div>
    </div>
    `,
}