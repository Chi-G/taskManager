<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ListController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleDriveController;
use App\Models\TaskList;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Resource routes for Posts, Tasks, and Lists
    Route::resource('posts', PostController::class);
    Route::resource('tasks', TaskController::class);
    Route::resource('lists', ListController::class)->parameters([
        'lists' => 'list'
    ]);

    // Google Drive sync routes
    Route::post('google-drive/sync', [GoogleDriveController::class, 'sync'])->name('google-drive.sync');
    Route::post('google-drive/restore', [GoogleDriveController::class, 'restore'])->name('google-drive.restore');
    Route::get('/auth/google', [GoogleDriveController::class, 'redirectToGoogle'])->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleDriveController::class, 'handleCallback'])->name('google.callback');

    Route::get('/settings/notifications', function () {
        return Inertia::render('settings/notifications');
    })->name('settings.notifications');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
