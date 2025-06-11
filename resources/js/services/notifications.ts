interface NotificationData {
    taskId: number;
    type: 'task_reminder';
}

interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: NotificationData;
}

class NotificationService {
    private permission: NotificationPermission = 'default';
    private swRegistration: ServiceWorkerRegistration | null = null;

    async initialize() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('This browser does not support service workers');
            return;
        }

        try {
            this.permission = await Notification.requestPermission();
            this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered successfully');
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
        }
    }

    async scheduleNotification(options: NotificationOptions) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        if (!this.swRegistration) {
            console.warn('Service Worker not registered');
            return;
        }

        try {
            await this.swRegistration.showNotification(options.title, {
                body: options.body,
                icon: options.icon || '/images/notification-icon.png',
                badge: options.badge || '/images/notification-badge.png',
                data: options.data,
                tag: `task-${options.data?.taskId}`,
                requireInteraction: true,
            });
        } catch (error) {
            console.error('Failed to schedule notification:', error);
        }
    }

    async scheduleTaskReminder(task: {
        id: number;
        title: string;
        description: string | null;
        due_date: string;
    }) {
        const dueDate = new Date(task.due_date);
        const now = new Date();

        // Only schedule if the due date is in the future
        if (dueDate > now) {
            await this.scheduleNotification({
                title: 'Task Due Soon',
                body: `Task "${task.title}" is due in 1 hour`,
                data: {
                    taskId: task.id,
                    type: 'task_reminder',
                },
            });
        }
    }

    async cancelTaskReminder(taskId: number) {
        if (!this.swRegistration) {
            return;
        }

        try {
            const notifications = await this.swRegistration.getNotifications({
                tag: `task-${taskId}`,
            });

            notifications.forEach(notification => notification.close());
        } catch (error) {
            console.error('Failed to cancel notification:', error);
        }
    }
}

export const notificationService = new NotificationService();
