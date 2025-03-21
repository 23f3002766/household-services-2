export default {
    template: `
    <div class="container mt-5">
        <div class="card p-4">
            <h1 class="text-center text-primary">Customer Signup</h1>
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
                    <label class="form-label">Phone</label>
                    <input type="text" class="form-control" v-model="phone" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Pincode</label>
                    <input type="text" class="form-control" v-model="pincode" />
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
