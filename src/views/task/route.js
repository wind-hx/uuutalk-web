const Layout = () =>
    import ('@/layout/index.vue')

export default {
    name: 'Task',
    path: '/task',
    component: Layout,
    redirect: '/task/group-message-task',
    meta: {
        title: '任务管理',
        icon: 'mdi:calendar-task-outline',
        order: 3,
    },
    children: [
        {
            name: '群组消息任务',
            path: 'group-message-task',
            component: () =>
                import ('./group-message-task.vue'),
            meta: {
                title: '群组消息任务',
                icon: 'mdi:calendar-task-outline',
            },
        },
        {
            name: '用户消息任务',
            path: 'user-message-task',
            component: () =>
                import ('./user-message-task.vue'),
            meta: {
                title: '用户消息任务',
                icon: 'mdi:calendar-task-outline',
            },
        },
    ],
}