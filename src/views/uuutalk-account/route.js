const Layout = () => import ('@/layout/index.vue')

export default {
    name: 'UUUTalkAccount',
    path: '/uuutalk-account',
    component: Layout,
    redirect: '/uuutalk-account/list',
    meta: {
        title: 'UUUTalk账户管理',
        icon: 'mdi:group-add-outline',
        order: 1,
    },
    children: [ 
        {
            name: 'UUUTalk账户管理',
            path: 'list',
            component: () => import ('./index.vue'),
            meta: {
                title: 'UUUTalk账户管理',
                icon: 'mdi:group-add-outline',
            },
        },
    ],
}