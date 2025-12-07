const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'YuniAccount',
    path: '/yuni-account',
    component: Layout,
    redirect: '/yuni-account/list',
    meta: {
        title: 'Yuni账户管理',
        icon: 'mdi:group-add-outline',
        order: 1,
    },
    children: [{
        name: 'Yuni账户管理',
        path: 'list',
        component: () =>
            import ('./index.vue'),
        meta: {
            title: 'Yuni账户管理',
            icon: 'mdi:group-add-outline',
        },
    }, ],
}