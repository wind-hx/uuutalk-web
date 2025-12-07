const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'YuniNotify',
    path: '/notify',
    component: Layout,
    redirect: '/notify/list',
    meta: {
        title: '通知管理',
        icon: 'icon-park-outline:alarm',
        order: 4,
    },
    children: [
        {
            name: '通知管理',
            path: 'list',
            component: () =>
                import ('./index.vue'),
            meta: {
                title: '通知管理',
                icon: 'icon-park-outline:alarm',
            },
        },
    ],
}
