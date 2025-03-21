import router from "./utils/router.js"
import store from "./utils/store.js"
import NavBar from "./components/NavBar.js"
import GenericTable from "./components/GenericTable.js"

const app = new Vue({
    el : '#app',
    template : `
        <div> 
            <NavBar />
            <router-view> </router-view>
        </div>
    `,
    components : {
        NavBar,
        GenericTable
    },
    router,
    store,
    
})