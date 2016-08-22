'use strict';
import { isRegExp } from 'util';

var pathToKeyCache = {};

export class ApiMetricKeyBuilder {

    buildKey(path: string | RegExp, method: string, statusCode: number, error: Error): string {
        let key = '';
        if (!path) {
            return key;
        }

        if (isRegExp(path)) {
            key = this.regexpToKey(<RegExp>path);
        } else {
            key = this.pathToKey(<string>path);
        }

        if (method) {
            key += '.' + method;
        }

        key += '.' + this.statusToKey(statusCode, error);

        return key.toLowerCase();
    }

    private statusToKey(statusCode: number, error: Error): string {
        let statusCodeIsNumber = (typeof statusCode === 'number') && !isNaN(statusCode);
        let statusKey = 'success';
        if (error || !statusCodeIsNumber || statusCode >= 400 || statusCode === 0) {
            statusKey = 'failure';
        }

        let statusCodeKey = 'unknown';
        if (statusCodeIsNumber) {
            statusCodeKey = '' + Math.floor(statusCode / 100) + 'xx';
        }

        let key = `${statusKey}.${statusCodeKey}`;
        return key;
    }

    private pathToKey(path: string): string {
        let key = pathToKeyCache[path];
        if (!key) {
            key = (path || '')
                .replace(/^\//, '') // remove leading slash if present
                .replace(/[\.:]/g, '_')
                .replace(/\//g, '.');

            pathToKeyCache[path] = key;
        }

        return key;
    }

    private regexpToKey(regex: RegExp): string {
        let path = regex.toString();
        let key = pathToKeyCache[path];
        if (!key) {
            // extract pattern where pattern is:
            // /pattern/  /^pattern/  /pattern$/  or  /^pattern$/
            let pattern = path.replace(/^\/\^?([^$]*)[\$]?\/$/, '$1');
            key = pattern
                .replace(/^\\\//, '') // remove leading slash
                .replace(/\\\/$/, '') // remove trailing slash
                .replace(/([^\\])\./g, '$1_') // replace all . (any one character placeholder) with _
                .replace(/\\\//g, '.') // replace all \/ with .
                .replace(/\\./g, '_') // replace all escaped characters with _
                .replace(/[^A-Za-z0-9_|\.]/g, '_'); // replace all non-alphanumeric characters (not including _ and .) with _
            pathToKeyCache[path] = key;
        }

        return key;
    }
}
