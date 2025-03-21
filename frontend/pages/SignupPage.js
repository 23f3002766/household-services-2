export default {
    template: `
    <div class="container mt-5">
        <div class="card p-4">
            <h1 class="text-center text-primary">Service Professional Signup</h1>
            <form @submit.prevent="submitSignup">
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" v-model="email" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" v-model="password" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-control" v-model="name" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <input type="text" class="form-control" v-model="address" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Experience (years)</label>
                    <input type="text" class="form-control" v-model="experience" />
                </div>
                <div class="mb-3">
                    <input type="file" accept=".pdf" @change="handleFileUpload" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Phone</label>
                    <input type="text" class="form-control" v-model="phone" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Pincode</label>
                    <input type="text" class="form-control" v-model="pincode" />
                </div>
                <!-- Services Dropdown -->
                <div class="mb-3">
                <label for="service" class="form-label">Service</label>
                <select class="form-control" v-model="selectedService">
                    <option v-for="service in services" :key="service.id" :value="service.id">
                         {{ service.id }} | {{ service.name }}
                    </option>
                </select>
                </div>
                <button class="btn btn-primary w-100">Sign Up</button>
            </form>
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    `,
    data() {
        return {
            email: '',
            password: '',
            name: '',
            address: '',
            phone: '',
            pincode: '',
            experience: '',
            vdoc: null,
            services: [
                { id: 1, name: "Plumbing" },
                { id: 2, name: "Electrician" },
                { id: 3, name: "Cleaning" } ],  
            selectedService: null,
            errorMessage: '',
        };
    },
    methods: {
        async fetchServices() {
            try {
                const res = await fetch(location.origin + "/services");
                if (res.ok) {
                    this.services = await res.json() | [
                        { id: 1, name: "Plumbing" },
                        { id: 2, name: "Electrician" },
                        { id: 3, name: "Cleaning" } ];
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },

        handleFileUpload(event) {
            this.vdoc = event.target.files[0]; // Get the selected file
        },
        async submitSignup() {
            if (!this.email || !this.password || !this.name || !this.address || !this.phone || !this.pincode ) {
                this.errorMessage = "All fields are required!";
                return;
            }

            try {
                const res = await fetch(location.origin + "/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password,
                        name: this.name,
                        role: "professional",
                        address: this.address,
                        phone: this.phone,
                        pincode: this.pincode,
                        experience: this.experience,
                        pdf_path: this.vdoc ,
                        service_id: "1"
                    })
                });

                if (res.ok) {
                    console.log("User registered successfully");
                    const data = await res.json();
                    localStorage.setItem("user", JSON.stringify(data));
                    this.$store.commit("setUser");
                    this.$router.push("/");
                } else {
                    this.errorMessage = "Signup failed. Try again.";
                }
            } catch (error) {
                console.error(error);
                this.errorMessage = "Error during signup. Check console.";
            }
        }
    },
    mounted() {
        this.fetchServices(); 
    }
};
