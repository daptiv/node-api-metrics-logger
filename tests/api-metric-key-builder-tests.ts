'use strict';
import { ApiMetricKeyBuilder } from '../src/api-metric-key-builder';
import { RouteSpec } from 'restify';

describe('api-metric-key-builder', () => {
    let builder: ApiMetricKeyBuilder;

    describe('buildKey', () => {
        let routeSpec: RouteSpec;
        const statusCode: number = 400;

        beforeEach(() => {
            builder = new ApiMetricKeyBuilder();

            routeSpec = {
                path: '/tasks',
                method: 'PUT',
                versions: [],
                name: 'routeHandlerName'
            };
        });

        it('should return empty string when routeSpec is null', () => {
            expect(builder.buildKey(null, null, statusCode, null)).toEqual('');
        });

        it('should remove the leading / before processing path', () => {
            expect(builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null)).toEqual('tasks.put.failure.4xx');
        });

        it('should convert . in path to _', () => {
            routeSpec.path = '/tasks.flagged';
            expect(builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null)).toEqual('tasks_flagged.put.failure.4xx');
        });

        it('should convert : in path to _', () => {
            routeSpec.path = '/tasks:flagged';
            expect(builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null)).toEqual('tasks_flagged.put.failure.4xx');
        });

        it('should convert / in path to .', () => {
            routeSpec.path = '/tasks/flagged';
            expect(builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null)).toEqual('tasks.flagged.put.failure.4xx');
        });

        it('should append lowercased method when method is defined', () => {
            routeSpec.method = 'GET';
            expect(builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null)).toEqual('tasks.get.failure.4xx');
        });

        it('should append statusCode if it exists', () => {
            expect(builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null)).toEqual('tasks.put.failure.4xx');
        });

        it('should not append statusCode if it does not exist', () => {
             expect(builder.buildKey(routeSpec.path, routeSpec.method, null, null)).toEqual('tasks.put.failure.unknown');
        });

        describe('when path is a regular expression', () => {
            let setPath = (regExpPath: RegExp) => {
                routeSpec.path = <any>regExpPath;
                routeSpec.path = <any>regExpPath;
            };

            it('should strip / from start and end of expression', () => {
                setPath(/path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('path.put.failure.4xx');
            });

            it('should trim leading /', () => {
                setPath(/\/some\/test\/path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('some.test.path.put.failure.4xx');
            });

            it('should trim trailing /', () => {
                setPath(/some\/test\/path\//);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('some.test.path.put.failure.4xx');
            });

            it('should convert \\/ in pattern to .', () => {
                setPath(/test\/path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('test.path.put.failure.4xx');
            });

            it('should convert \\. in pattern to _', () => {
                setPath(/test\.path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('test_path.put.failure.4xx');
            });

            it('should convert . (any one character symbol) in pattern to _', () => {
                setPath(/test.ed\.path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('test_ed_path.put.failure.4xx');
            });

            it('should convert : in pattern to _', () => {
                setPath(/test:path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('test_path.put.failure.4xx');
            });

            it('should convert other escaped characters (not including \\/) in pattern to _', () => {
                setPath(/test\wthis\/path/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);
                expect(key).toEqual('test_this.path.put.failure.4xx');
            });

            it('should convert any non-alphanumeric character (not including / ) to _', () => {
                setPath(/v1\/[Tt]est(this)?\/path\/:param/);

                let key = builder.buildKey(routeSpec.path, routeSpec.method, statusCode, null);

                expect(key).toEqual('v1._tt_est_this__.path._param.put.failure.4xx');
            });
        });

    });

});
