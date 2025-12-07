const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'Help',
    path: '/help',
    component: Layout,
    redirect: '/help/help',
    meta: {
        title: '',
        icon: 'material-symbols:help-outline',
        order: 5,
    },
    children: [{
        name: '使用帮助',
        path: 'list',
        component: () =>
            import ('./index.vue'),
        meta: {
            title: '使用帮助',
            icon: 'material-symbols:help-outline',
        },
    }, ],
}