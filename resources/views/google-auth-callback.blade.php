<!DOCTYPE html>
<html>
<head>
    <title>Google Drive Authentication</title>
</head>
<body>
    <script>
        @if(isset($success) && $success)
            // Store the token in localStorage
            localStorage.setItem('google_drive_access_token', '{{ $token }}');

            // Send success message to parent window
            window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                token: '{{ $token }}'
            }, '*');
        @else
            // Send error message to parent window
            window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: '{{ $error ?? 'Authentication failed' }}'
            }, '*');
        @endif

        // Close this window
        window.close();
    </script>
</body>
</html>
