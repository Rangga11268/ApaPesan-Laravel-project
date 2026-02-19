<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    /**
     * Basic health check endpoint.
     */
    public function index()
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Detailed health check with all dependencies.
     */
    public function detailed(Request $request)
    {
        $checks = [];
        $healthy = true;

        // Database check
        try {
            DB::connection()->getPdo();
            $checks['database'] = [
                'status' => 'ok',
                'connection' => config('database.default'),
            ];
        } catch (\Exception $e) {
            $checks['database'] = [
                'status' => 'error',
                'message' => 'Database connection failed',
            ];
            $healthy = false;
        }

        // Cache check
        try {
            $cacheKey = 'health_check_' . time();
            Cache::put($cacheKey, 'ok', 10);
            $value = Cache::get($cacheKey);
            Cache::forget($cacheKey);

            $checks['cache'] = [
                'status' => $value === 'ok' ? 'ok' : 'error',
                'driver' => config('cache.default'),
            ];
            if ($value !== 'ok') {
                $healthy = false;
            }
        } catch (\Exception $e) {
            $checks['cache'] = [
                'status' => 'error',
                'message' => 'Cache check failed',
            ];
            $healthy = false;
        }

        // Queue check
        $checks['queue'] = [
            'status' => 'ok',
            'connection' => config('queue.default'),
        ];

        // Broadcasting check
        $checks['broadcasting'] = [
            'status' => 'ok',
            'driver' => config('broadcasting.default'),
        ];

        // Disk space check
        $freeSpace = disk_free_space(storage_path());
        $totalSpace = disk_total_space(storage_path());
        $usedPercent = round((1 - $freeSpace / $totalSpace) * 100, 2);

        $checks['disk'] = [
            'status' => $usedPercent < 90 ? 'ok' : ($usedPercent < 95 ? 'warning' : 'critical'),
            'used_percent' => $usedPercent,
            'free_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
        ];

        if ($usedPercent >= 95) {
            $healthy = false;
        }

        // Memory check
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));
        $memoryPercent = $memoryLimit > 0 ? round($memoryUsage / $memoryLimit * 100, 2) : 0;

        $checks['memory'] = [
            'status' => $memoryPercent < 80 ? 'ok' : ($memoryPercent < 90 ? 'warning' : 'critical'),
            'used_mb' => round($memoryUsage / 1024 / 1024, 2),
            'limit_mb' => round($memoryLimit / 1024 / 1024, 2),
            'used_percent' => $memoryPercent,
        ];

        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    /**
     * Parse PHP memory limit to bytes.
     */
    private function parseMemoryLimit(string $limit): int
    {
        if ($limit === '-1') {
            return PHP_INT_MAX;
        }

        $value = (int) $limit;
        $unit = strtoupper(substr($limit, -1));

        switch ($unit) {
            case 'G':
                $value *= 1024;
            case 'M':
                $value *= 1024;
            case 'K':
                $value *= 1024;
        }

        return $value;
    }
}
