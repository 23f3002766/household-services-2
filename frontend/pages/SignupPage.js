export default {
    template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card p-4 shadow-lg" style="max-width: 450px; width: 100%; border-radius: 12px;">
        <h2 class="text-center text-primary fw-bold">Professional Signup</h2>
        <form @submit.prevent="submitSignup" enctype="multipart/form-data">
            <input type="email" class="form-control mb-2" v-model="email" placeholder="Email" required />
            <input type="password" class="form-control mb-2" v-model="password" placeholder="Password" required />
            <input type="text" class="form-control mb-2" v-model="name" placeholder="Full Name" required />
            <input type="text" class="form-control mb-2" v-model="address" placeholder="Address" required />
            <input type="number" class="form-control mb-2" v-model="experience" placeholder="Experience (years)" required />
            <input type="text" class="form-control mb-2" v-model="phone" placeholder="Phone" required />
            <input type="text" class="form-control mb-2" v-model="pincode" placeholder="Pincode" required />
            
            <!-- Dropdown-->
            <div class="mb-3 position-relative">
                <label class="form-label fw-bold">Select Service</label>
                <select class="form-select shadow-sm p-2" v-model="selectedService" required>
                    <option value="" disabled>Select a service</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">
                        {{ service.name }}
                    </option>
                </select>
            </div>

            <!-- PDF File Upload -->
            <div class="mb-3">
                <label class="form-label fw-bold">Upload Resume (PDF)</label>
                <input type="file" class="form-control" @change="handleFileUpload" accept=".pdf" required />
                <small class="text-muted">Max file size: 2MB</small>
            </div>

            <button class="btn btn-primary w-100 fw-bold">Sign Up</button>
        </form>
        <p v-if="errorMessage" class="text-danger text-center mt-2">{{ errorMessage }}</p>
    </div>
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
            services: [],  
            selectedService: null,
            errorMessage: '',
            vdoc: '',
        };
    },
    methods: {
        async fetchServices() {
            try {
                const res = await fetch(location.origin + "/services");
                if (res.ok) {
                    this.services = await res.json() ;
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },

        handleFileUpload(event) {
            console.log(event.target.files[0])
            this.vdoc = event.target.files[0];
             // Get the selected file
             console.log(this.vdoc)
        },
        async submitSignup() {
            if (!this.email || !this.password || !this.name || !this.address || !this.phone || !this.pincode || !this.vdoc) {
                this.errorMessage = "All fields are required!";
                return;
            }
            try {
                const formData = new FormData();
                formData.append("email", this.email);
                formData.append("password", this.password);
                formData.append("name", this.name);
                formData.append("role", "professional");
                formData.append("address", this.address);
                formData.append("phone", this.phone);
                formData.append("pincode", this.pincode);
                formData.append("experience", this.experience);
                formData.append("service_id", this.selectedService);
                formData.append("resume", this.vdoc); 

                const res = await fetch(location.origin + "/register-prof", {
                    method: "POST",
                    body: formData
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
