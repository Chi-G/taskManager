import axios from 'axios';

const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

interface GoogleDriveConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

interface TaskManagerData {
    lists: Array<{
        id: number;
        title: string;
        description: string | null;
        theme?: string;
        tasks_count?: number;
    }>;
    tasks: Array<{
        id: number;
        title: string;
        description: string | null;
        due_date?: string;
        completed: boolean;
        list_id: number;
    }>;
}

class GoogleDriveService {
    private config: GoogleDriveConfig;
    private accessToken: string | null = null;

    constructor(config: GoogleDriveConfig) {
        this.config = config;
        this.accessToken = localStorage.getItem('google_drive_access_token');
    }

    async initialize() {
        if (!this.accessToken) {
            await this.authenticate();
        }
    }

    private async authenticate() {
        const authUrl = new URL(GOOGLE_OAUTH_URL);
        authUrl.searchParams.append('client_id', this.config.clientId);
        authUrl.searchParams.append('redirect_uri', this.config.redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', this.config.scopes.join(' '));
        authUrl.searchParams.append('access_type', 'offline');
        authUrl.searchParams.append('prompt', 'consent');

        // Open the authentication window
        const authWindow = window.open(authUrl.toString(), 'Google Drive Auth', 'width=600,height=600');

        // Listen for the authentication response
        window.addEventListener('message', async (event) => {
            if (event.origin === window.location.origin) {
                const { code } = event.data;
                if (code) {
                    await this.exchangeCodeForToken(code);
                    authWindow?.close();
                }
            }
        });
    }

    private async exchangeCodeForToken(code: string) {
        try {
            const response = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                redirect_uri: this.config.redirectUri,
                grant_type: 'authorization_code',
            });

            this.accessToken = response.data.access_token;
            if (this.accessToken) {
                localStorage.setItem('google_drive_access_token', this.accessToken);
            }
        } catch (error) {
            console.error('Failed to exchange code for token:', error);
            throw new Error('Failed to authenticate with Google Drive');
        }
    }

    async syncData(data: TaskManagerData) {
        try {
            await this.initialize();

            if (!this.accessToken) {
                throw new Error('Not authenticated with Google Drive');
            }

            // Create or update the app folder
            const folderId = await this.getOrCreateAppFolder();

            // Upload the data file
            await this.uploadFile(folderId, 'task_manager_data.json', JSON.stringify(data));

            return true;
        } catch (error) {
            console.error('Failed to sync data:', error);
            throw new Error('Failed to sync with Google Drive');
        }
    }

    private async getOrCreateAppFolder(): Promise<string> {
        if (!this.accessToken) {
            throw new Error('Not authenticated with Google Drive');
        }

        try {
            // Search for existing folder
            const response = await axios.get(`${GOOGLE_DRIVE_API_URL}/files`, {
                headers: { Authorization: `Bearer ${this.accessToken}` },
                params: {
                    q: "name='TaskManager' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                    fields: 'files(id, name)',
                },
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            }

            // Create new folder if it doesn't exist
            const createResponse = await axios.post(
                `${GOOGLE_DRIVE_API_URL}/files`,
                {
                    name: 'TaskManager',
                    mimeType: 'application/vnd.google-apps.folder',
                },
                {
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                }
            );

            return createResponse.data.id;
        } catch (error) {
            console.error('Failed to get or create app folder:', error);
            throw new Error('Failed to access Google Drive folder');
        }
    }

    private async uploadFile(folderId: string, fileName: string, content: string) {
        if (!this.accessToken) {
            throw new Error('Not authenticated with Google Drive');
        }

        try {
            const metadata = {
                name: fileName,
                parents: [folderId],
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([content], { type: 'application/json' }));

            await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', form, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });
        } catch (error) {
            console.error('Failed to upload file:', error);
            throw new Error('Failed to upload data to Google Drive');
        }
    }
}

export const googleDriveService = new GoogleDriveService({
    clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_SECRET,
    redirectUri: 'http://127.0.0.1:8000/auth/google/callback',
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ],
});

// Add error checking
if (!import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID) {
    console.error('Google Drive Client ID is not configured. Please add VITE_GOOGLE_DRIVE_CLIENT_ID to your .env file.');
}
