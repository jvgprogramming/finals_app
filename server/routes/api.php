<?php

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\GenderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\UserController;

Route::controller(AuthController::class)->prefix('/auth')->group(function () {
    Route::post('/login', 'login');
    Route::post('/logout', 'logout');
    Route::get('/me', 'me');
});

Route::middleware('auth:sanctum')->group(function ( ) {

    Route::controller(AuthController::class)->prefix('/auth')->group(function () {
        Route::post('/logout', 'logout');
        Route::get('/me', 'me'); 
    });


    Route::controller(GenderController::class)->prefix('/gender')->group(function () {
        Route::get('/loadGenders', 'loadGenders');  // /gender/loadGenders
        Route::get('/getGender/{genderId}', 'getGender');
        Route::post('/storeGender', 'storeGender'); // /gender/storegender
        Route::put('/updateGender/{gender}', 'updateGender');
        Route::put('/destroyGender/{gender}', 'destroyGender');
    });

    Route::controller(UserController::class)->prefix('/user')->group(function () {
        Route::get('/loadUsers', 'loadUsers');
        Route::post('/storeUser', 'storeUser');
        Route::put('/updateUser/{user}', 'updateUser');
        route::put('/destroyUser/{user}', 'destroyUser');
    });

});



// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
