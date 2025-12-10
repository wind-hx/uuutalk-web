const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'UserPlan',
    path: '/user-plan',
    component: Layout,
    redirect: '/user-plan/list',
    meta: {
        title: '套餐管理',
        icon: 'mdi:gift-outline',
        order: 2,
    },
    children: [
        {
            name: '套餐管理',
            path: 'list',
            component: () =>
                import ('./index.vue'),
            meta: {
                title: '套餐管理',
                icon: 'mdi:gift-outline',
            },
        },
    ],
}