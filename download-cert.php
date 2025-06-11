<?php

$certUrl = 'https://pki.goog/roots.pem';
$certPath = __DIR__ . '/storage/certs/google-api.crt';

// Download the certificate
$certContent = file_get_contents($certUrl);
if ($certContent === false) {
    die("Failed to download certificate\n");
}

// Save the certificate
if (file_put_contents($certPath, $certContent) === false) {
    die("Failed to save certificate\n");
}

echo "Certificate downloaded successfully to: $certPath\n";
