const Home = {
    template : `<h1> this is home </h1>`
}

const routes = [
    {path : '/', component : Home}
]

const router = new VueRouter({
    routes
})




export default router;