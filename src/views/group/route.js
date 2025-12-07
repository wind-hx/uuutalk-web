const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'YuniGroup',
    path: '/yuni-group',
    component: Layout,
    redirect: '/yuni-group/list',
    meta: {
        title: '群组管理',
        icon: 'mdi:account-group',
        order: 2,
    },
    children: [
        {
            name: '群组管理',
            path: 'list',
            component: () =>
                import ('./index.vue'),
            meta: {
                title: '群组管理',
                icon: 'mdi:account-group',
            },
        },
    ],
}