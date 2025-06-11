import React from 'react';
import { Head } from '@inertiajs/react';
import { PushNotificationSettings } from '../../components/notifications/PushNotificationSettings';

export default function Notifications() {
    return (
        <>
            <Head title="Notification Settings" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">
                                Notification Settings
                            </h2>
                            <div className="space-y-6">
                                <PushNotificationSettings />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
