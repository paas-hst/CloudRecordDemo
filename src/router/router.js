import Vue from 'vue'
import Router from 'vue-router'
import FrameBase from '../views/Base.vue'
import RecordController from '../views/RecordController.vue';
import RecordManager from '../views/RecordManager.vue';
import Login from '../views/Login.vue';

Vue.use(Router)

const router = new Router({
    routes: [{
            path: '/',
            redirect: '/login'
        },
        {
            path: '/record',
            component: FrameBase,
            children: [{
                    path: 'controller',
                    name: 'controller',
                    component: RecordController
                },
                {
                    path: 'manager',
                    name: 'manager',
                    component: RecordManager
                }
            ]
        },
        {
            path: '/login',
            component: Login,
            name: 'login',
        }
    ]
})

router.beforeEach((to, from, next) => {
    document.title = "好视通云通信-云录制DEMO";
    next();
})

export default router;