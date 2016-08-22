'use strict';
import { ApiMetricKeyBuilder } from './api-metric-key-builder';
import { RouteSpec, Response, Request, Route } from 'restify';

export interface MetricsClient {
  timing(key: string, milliseconds: number): void;

  increment(key: string): void;
  incrementBy(key: string, value: number): void;

  decrement(key: string): void;
  decrementBy(key: string, value: number): void;

  gauge(key: string, value: number): void;

  histogram(key: string, value: number): void;

  close(): void;
}

export interface ApiMetricsLoggerOptions {
    timing: boolean;
    increment: boolean;
}

export class ApiMetricsLogger {
    private keyBuilder: ApiMetricKeyBuilder;

    constructor(private client: MetricsClient, private options: ApiMetricsLoggerOptions) {
        this.keyBuilder = new ApiMetricKeyBuilder();
    }

    logResponseMetrics(request: Request, response: Response, route: Route, error: Error): void {
        try {
            let routeSpec: RouteSpec = route && route.spec;
            let statusCode = this.getStatusCode(response);
            let key = this.keyBuilder.buildKey(routeSpec.path, routeSpec.method, statusCode, error);

            if (this.options.timing) {
                let responseTime = this.getResponseTime(request, response);
                if (responseTime) {
                    this.client.timing(key, responseTime);
                }
            }

            if (this.options.increment) {
                this.client.increment(key);
            }
        } catch (e) {
            // Never fail when logging
        }
    }

    private getStatusCode(response: Response): number {
        let statusCode = (response && typeof response.statusCode === 'number')
            ? response.statusCode
            : NaN;
        return statusCode;
    }

    private getResponseTime(request: Request, response: Response): number {
        let responseTime = parseInt(response.getHeader('Response-Time'), 10);
        if (isNaN(responseTime)) {
            responseTime = Date.now() - request.time();
        }
        return responseTime;
    }

}
