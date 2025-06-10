<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ListController;
use App\Http\Controllers\DashboardController;
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
