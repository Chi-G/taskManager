<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use Google_Client;
use Google_Service_Drive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class GoogleDriveController extends Controller
{
    private $client;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect'));
        $this->client->addScope(Google_Service_Drive::DRIVE_FILE);
    }

    public function sync(Request $request)
    {
        try {
            $accessToken = $request->header('Authorization');
            if (!$accessToken) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'No access token provided'], 401);
                }
                return back()->with('error', 'No access token provided');
            }

            // Remove 'Bearer ' prefix if present
            $accessToken = str_replace('Bearer ', '', $accessToken);

            // Make the request to Google Drive API with proper SSL verification
            $response = Http::withToken($accessToken)
                ->withOptions([
                    'verify' => storage_path('certs/google-api.crt'),
                ])
                ->post('https://www.googleapis.com/upload/drive/v3/files', [
                    'uploadType' => 'multipart',
                    'fields' => 'id',
                ]);

            if ($response->successful()) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Sync successful']);
                }
                return back()->with('success', 'Sync successful');
            }

            if ($request->wantsJson()) {
                return response()->json(['message' => 'Sync failed', 'error' => $response->body()], 500);
            }
            return back()->with('error', 'Sync failed: ' . $response->body());
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Sync failed', 'error' => $e->getMessage()], 500);
            }
            return back()->with('error', 'Sync failed: ' . $e->getMessage());
        }
    }

    public function restore(Request $request)
    {
        try {
            $fileId = $request->input('file_id');
            $drive = new Google_Service_Drive($this->client);

            // Download the file
            $content = $drive->files->get($fileId, ['alt' => 'media']);

            // Parse the JSON data
            $data = json_decode($content->getBody()->getContents(), true);

            // Restore the data
            foreach ($data['lists'] as $list) {
                TaskList::updateOrCreate(
                    ['id' => $list['id']],
                    [
                        'title' => $list['title'],
                        'description' => $list['description'],
                        'user_id' => auth()->id(),
                    ]
                );
            }

            foreach ($data['tasks'] as $task) {
                Task::updateOrCreate(
                    ['id' => $task['id']],
                    [
                        'title' => $task['title'],
                        'description' => $task['description'],
                        'is_completed' => $task['is_completed'],
                        'due_date' => $task['due_date'],
                        'list_id' => $task['list_id'],
                    ]
                );
            }

            return response()->json([
                'message' => 'Restore completed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Restore failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function handleCallback(Request $request)
    {
        try {
            $code = $request->get('code');
            if (!$code) {
                return response()->view('google-auth-callback', [
                    'error' => 'Authorization code not received'
                ]);
            }

            $client = new \Google_Client();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));
            $client->setRedirectUri(config('services.google.redirect'));

            $token = $client->fetchAccessTokenWithAuthCode($code);

            if (isset($token['error'])) {
                return response()->view('google-auth-callback', [
                    'error' => 'Failed to get access token: ' . $token['error']
                ]);
            }

            // Store the access token in the session
            session(['google_drive_access_token' => $token['access_token']]);

            // Return a view that will send a message to the parent window
            return response()->view('google-auth-callback', [
                'success' => true,
                'token' => $token['access_token']
            ]);
        } catch (\Exception $e) {
            return response()->view('google-auth-callback', [
                'error' => 'Failed to process Google Drive authentication: ' . $e->getMessage()
            ]);
        }
    }

    public function redirectToGoogle()
    {
        $client = new \Google_Client();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));
        $client->addScope('https://www.googleapis.com/auth/drive.file');
        $client->addScope('https://www.googleapis.com/auth/drive.appdata');
        $client->addScope('https://www.googleapis.com/auth/userinfo.email');
        $client->addScope('https://www.googleapis.com/auth/userinfo.profile');

        return redirect($client->createAuthUrl());
    }
}
