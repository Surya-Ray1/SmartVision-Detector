<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DetectionController;

// simple health check
Route::get('/health', fn() => ['status' => 'ok']);

// detection endpoints
Route::get('/detections', [DetectionController::class, 'index']);
Route::post('/detections', [DetectionController::class, 'store']);
Route::get('/detections/{detection}', [DetectionController::class, 'show']);
