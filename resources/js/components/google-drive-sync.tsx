import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Cloud, Loader2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface Flash {
    success?: string;
    error?: string;
}

interface PageProps {
    flash?: Flash;
}

export const GoogleDriveSync: React.FC = () => {
    const { flash } = usePage().props as PageProps;
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncWindow, setSyncWindow] = useState<Window | null>(null);

    useEffect(() => {
        if (flash?.success) {
            console.log('Success:', flash.success);
        }
        if (flash?.error) {
            console.error('Error:', flash.error);
        }
    }, [flash]);

    useEffect(() => {
        // Handle popup window closing after successful auth
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                if (syncWindow) {
                    syncWindow.close();
                    setSyncWindow(null);
                }
                // Start the sync process
                handleSync(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [syncWindow]);

    const handleSync = async (isPostAuth: boolean = false) => {
        try {
            const accessToken = localStorage.getItem('google_drive_access_token');
            if (!accessToken && !isPostAuth) {
                // Open popup for authentication
                const width = 500;
                const height = 600;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;

                const popup = window.open(
                    '/auth/google',
                    'Google Drive Sync',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                if (popup) {
                    setSyncWindow(popup);
                }
                return;
            }

            setIsSyncing(true);
            setSyncProgress(0);

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setSyncProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            const response = await fetch('/google-drive/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Sync failed');
            }

            const data = await response.json();
            console.log('Sync successful:', data);
            setSyncProgress(100);
        } catch (error) {
            console.error('Error syncing with Google Drive:', error);
        } finally {
            setIsSyncing(false);
            setSyncProgress(0);
        }
    };

    return (
        <Button
            onClick={() => handleSync()}
            disabled={isSyncing}
            className="relative"
        >
            {isSyncing ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing... {syncProgress}%
                </>
            ) : (
                <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Sync with Google Drive
                </>
            )}
        </Button>
    );
};
