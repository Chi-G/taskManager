self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/images/notification-icon.png',
            badge: data.badge || '/images/notification-badge.png',
            data: data.data,
            tag: data.tag,
            requireInteraction: true,
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'complete') {
        // Handle task completion
        const taskId = event.notification.data?.taskId;
        if (taskId) {
            // Send message to the client to mark task as complete
            self.clients.matchAll().then(function(clients) {
                clients.forEach(function(client) {
                    client.postMessage({
                        type: 'TASK_COMPLETE',
                        taskId: taskId
                    });
                });
            });
        }
    } else if (event.action === 'snooze') {
        // Handle task snooze
        const taskId = event.notification.data?.taskId;
        if (taskId) {
            // Reschedule notification for 1 hour later
            setTimeout(() => {
                self.registration.showNotification(event.notification.title, {
                    body: event.notification.body,
                    icon: event.notification.icon,
                    badge: event.notification.badge,
                    data: event.notification.data,
                    tag: event.notification.tag,
                    requireInteraction: true,
                });
            }, 60 * 60 * 1000); // 1 hour
        }
    } else {
        // Default click behavior - open the app
        event.waitUntil(
            self.clients.matchAll().then(function(clientList) {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return self.clients.openWindow('/settings/notifications');
            })
        );
    }
});
