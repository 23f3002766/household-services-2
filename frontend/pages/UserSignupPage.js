export default {
    template: `
<div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card p-4 shadow-lg" style="max-width: 500px; width: 100%; border-radius: 10px;">
        <h2 class="text-center text-primary fw-bold mb-3">Customer Signup</h2>
        <form @submit.prevent="submitSignup">
            <div class="mb-3">
                <label class="form-label fw-semibold">Email</label>
                <input type="email" class="form-control rounded-pill p-2" v-model="email" placeholder="Enter your email" required />
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Password</label>
                <input type="password" class="form-control rounded-pill p-2" v-model="password" placeholder="Create a password" required />
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Name</label>
                <input type="text" class="form-control rounded-pill p-2" v-model="name" placeholder="Enter your name" required />
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Address</label>
                <input type="text" class="form-control rounded-pill p-2" v-model="address" placeholder="Enter your address" required />
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Phone</label>
                <input type="text" class="form-control rounded-pill p-2" v-model="phone" placeholder="Enter your phone number" required />
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Pincode</label>
                <input type="text" class="form-control rounded-pill p-2" v-model="pincode" placeholder="Enter your pincode" required />
            </div>
            <button class="btn btn-primary w-100 py-2 rounded-pill fw-bold">Sign Up</button>
        </form>
        <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
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
            errorMessage: '',
        };
    },
    methods: {
        async submitSignup() {
            if (!this.email || !this.password || !this.name || !this.address || !this.phone || !this.pincode) {
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
                        role: "customer",
                        address: this.address,
                        phone: this.phone,
                        pincode: this.pincode
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log(data)
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            token: data.token,
                            email: data.email,
                            role: data.role,
                            id: data.id
                        })
                    );
                    this.$store.commit("setUser");
                    this.$router.push("/dashboard");
                } else {
                    this.errorMessage = "Signup failed. Try again.";
                }
            } catch (error) {
                console.error(error);
                this.errorMessage = "Error during signup. Check console.";
            }
        }
    }
};
