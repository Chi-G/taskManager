import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PushNotificationService } from '../../services/push-notifications';

export const PushNotificationSettings: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pushService = PushNotificationService.getInstance();

    useEffect(() => {
        const checkNotificationStatus = async () => {
            try {
                const permission = await Notification.permission;
                setIsEnabled(permission === 'granted');
            } catch (error) {
                console.error('Error checking notification status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkNotificationStatus();
    }, []);

    const handleToggleNotifications = async () => {
        setIsLoading(true);
        try {
            if (!isEnabled) {
                const permissionGranted = await pushService.requestNotificationPermission();
                if (permissionGranted) {
                    await pushService.registerServiceWorker();
                    const subscription = await pushService.subscribeToPushNotifications();
                    if (subscription) {
                        setIsEnabled(true);
                    }
                }
            } else {
                await pushService.unsubscribeFromPushNotifications();
                setIsEnabled(false);
            }
        } catch (error) {
            console.error('Error toggling notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div>Loading notification settings...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive notifications for task reminders and updates
                    </p>
                </div>
                <Switch
                    checked={isEnabled}
                    onCheckedChange={handleToggleNotifications}
                    disabled={isLoading}
                />
            </div>
            {!isEnabled && (
                <p className="text-sm text-muted-foreground">
                    Enable push notifications to stay updated with your tasks and reminders.
                </p>
            )}
        </div>
    );
};
