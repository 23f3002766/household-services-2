import LoginPage from "../pages/LoginPage.js";
import SignUpPage from "../pages/SignupPage.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
import CustomerDashboardPage from "../pages/CustomerDashboard.js";
import ProfessionalDashboard from "../pages/ProfessionalDashboard.js";
import UserSignupPage from "../pages/UserSignupPage.js";
import CreateServicePage from "../pages/CreateServicePage.js";
import EditServicePage from "../pages/EditServicePage.js";

import store from './store.js'
import EditProfile from "../pages/EditProfile.js";
import BookingsPage from "../pages/BookingsPage.js";


const Home = {
    template : `<h1> this is home </h1>`
}

const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register', component : SignUpPage},
    {path : '/signup', component : UserSignupPage},
    {path : '/admin-dashboard', component : AdminDashboardPage, meta : {requiresLogin : true, role : "admin"}, children: [
        {
          path: 'create-service',
          components : {create : CreateServicePage},
          props: {create : true},
          meta: { requiresLogin: true, role: "admin" }
        },
        {
            path: 'editservice/:id',
            name: 'EditService',
            components : {edit : EditServicePage},
            props: {edit : true}, // Pass route.params as props
            meta: { requiresLogin: true, role: "admin" }
        },
        {
            path: '',
            //default child that renders nothing
            components: {
              create: { template: '<div></div>' },
              edit: { template: '<div></div>' }
            }  
        },
          
      ]},
    {path : '/professional-dashboard', component : ProfessionalDashboard, meta : {requiresLogin : true, role : "professional"}},
    {path : '/dashboard', component : CustomerDashboardPage, meta : {requiresLogin : true, role : "customer"}, children: [
        {
            path: "editprofile/:id",
            name: 'EditProfile',
            components: {editprofile: EditProfile},
            props: {editprofile : true},
            meta: { requiresLogin: true, role: "customer" }
        },
        {
            path: "booking/:name/:cid/:sid",
            components : {create : BookingsPage},
            props: {create : true},
            meta: { requiresLogin: true, role: "customer" }
        },
        {
            path: '',
            // default child that renders nothing
            components: {
              create: { template: '<div></div>' },
              editprofile: { template: '<div></div>' }
            }  
        },
    ]}
]

const router = new VueRouter({
    routes
})

// navigation guards
router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            next({path : '/login'})
        } else if (to.meta.role && to.meta.role != store.state.role){
            alert('role not authorized')
             next({path : '/'})
        } else {
            next();
        }
    } else {
        next();
    }
})



export default router;