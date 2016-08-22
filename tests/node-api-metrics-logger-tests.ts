'use strict';
import { ApiMetricsLogger } from '../src/node-api-metrics-logger';
import { Route, RouteSpec } from 'restify';

describe('node-api-metrics-logger', () => {
    let metricsClientSpy;
    let mockRequest;
    let mockResponse;
    let mockRoute = <Route>{};
    let routeSpec: RouteSpec;
    let metricLog: ApiMetricsLogger;

    beforeEach(() => {
        metricsClientSpy = jasmine.createSpyObj('metricsClient', ['timing', 'increment']);
        mockRequest = jasmine.createSpyObj('mockRequest', ['time']);
        mockResponse = jasmine.createSpyObj('mockResponse', ['getHeader']);

        metricLog = new ApiMetricsLogger(metricsClientSpy, { timing: true, increment: true});

        mockResponse.statusCode = 200;
        routeSpec = {
            path: '/tasks',
            method: 'GET',
            versions: [],
            name: 'routeHandlerName'
        };
        mockRoute.spec = routeSpec;
    });

    it('when response Response-Time header is available should record time for route', () => {
        mockResponse.getHeader.and.callFake((headerName) => {
            return headerName === 'Response-Time' ? 123 : null;
        });

        metricLog.logResponseMetrics(mockRequest, mockResponse, mockRoute, null);

        expect(metricsClientSpy.timing).toHaveBeenCalledWith('tasks.get.success.2xx', 123);
    });

    it('when response Response-Time header is unavailable should record time for route', () => {
        spyOn(Date, 'now').and.callFake(() => { return 40; });
        mockRequest.time = () => 30;
        mockResponse.getHeader.and.callFake((headerName) => { return null; });

        metricLog.logResponseMetrics(mockRequest, mockResponse, mockRoute, null);

        expect(metricsClientSpy.timing).toHaveBeenCalledWith('tasks.get.success.2xx', 10);
    });

    it('when both response Response-Time header and request time is unavailable should not record time', () => {
        mockResponse.getHeader.and.callFake((headerName) => { return null; });

        metricLog.logResponseMetrics(mockRequest, mockResponse, mockRoute, null);

        expect(metricsClientSpy.timing).not.toHaveBeenCalled();
    });
});
