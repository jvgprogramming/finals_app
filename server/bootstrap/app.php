<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Ensure API routes always return JSON, even on error
        $exceptions->shouldRenderJsonWhen(function (\Illuminate\Http\Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // Safety net: sanitize unexpected exceptions (DB errors, etc.) for API routes
        // while letting HTTP exceptions (404, 403, 422, 401) render normally
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if (!($request->is('api/*') || $request->expectsJson())) {
                return;
            }

            // Let HTTP exceptions, validation errors, and auth errors pass through
            // with proper status codes and messages that the front-end depends on
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface ||
                $e instanceof \Illuminate\Validation\ValidationException ||
                $e instanceof \Illuminate\Auth\AuthenticationException) {
                return;
            }

            // Sanitize unexpected exceptions (database errors, etc.)
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred.',
            ], 500);
        });
    })->create();
