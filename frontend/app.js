import router from "./utils/router.js"


const app = new Vue({
    el : '#app',
    template : `
        <div> 
            <router-view> </router-view>
        </div>
    `,
    components : {
        
    },
    router,
    
})