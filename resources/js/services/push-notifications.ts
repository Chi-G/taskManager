export class PushNotificationService {
    private static instance: PushNotificationService;
    private swRegistration: ServiceWorkerRegistration | null = null;

    private constructor() {}

    public static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    public async registerServiceWorker(): Promise<void> {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    public async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
        if (!this.swRegistration) {
            console.error('Service Worker not registered');
            return null;
        }

        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
            });

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            return subscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            return null;
        }
    }

    private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
        try {
            const response = await fetch('/api/push-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: btoa(String.fromCharCode.apply(null,
                            Array.from(new Uint8Array(subscription.getKey('p256dh') as ArrayBuffer)))),
                        auth: btoa(String.fromCharCode.apply(null,
                            Array.from(new Uint8Array(subscription.getKey('auth') as ArrayBuffer))))
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription on server');
            }
        } catch (error) {
            console.error('Error saving push subscription:', error);
            throw error;
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    public async unsubscribeFromPushNotifications(): Promise<void> {
        if (!this.swRegistration) {
            return;
        }

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                // Notify server about unsubscription
                await fetch('/api/push-subscriptions', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint
                    })
                });
            }
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
        }
    }
}
