const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'Task',
    path: '/task',
    component: Layout,
    redirect: '/task/send-message-task',
    meta: {
        title: '任务管理',
        icon: 'mdi:calendar-task-outline',
        order: 3,
    },
    children: [{
            name: '群发任务',
            path: 'send-message-task',
            component: () =>
                import ('./send-message-task.vue'),
            meta: {
                title: '群发任务',
                icon: 'mdi:calendar-task-outline',
            },
        },
    ],
}