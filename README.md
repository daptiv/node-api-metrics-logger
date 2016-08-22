Eliminates the grunt work of building consistent metric keys from complex API paths and acquiring response time.

Accepts the metric (i.e. StatsD) client of your choice, such as the popular [Etsy's StatsD](https://github.com/etsy/statsd), [Datadog](https://github.com/joybro/node-dogstatsd), etc...

## Dependencies

The client must implement or be adapted the provided MetricsClient interface.
```
interface MetricsClient {
  timing(key: string, milliseconds: number): void;

  increment(key: string): void;
  incrementBy(key: string, value: number): void;

  decrement(key: string): void;
  decrementBy(key: string, value: number): void;

  gauge(key: string, value: number): void;

  histogram(key: string, value: number): void;

  close(): void;
}
```

Depends on the following portions of Restify's RouteSpec interface:
* `RouteSpec.path` for the string or RegExp path definition.
* `RouteSpec.method` for the HTTP verb.
* `Response.getHeader('Response-Time')` and `Request.time()` as a backup for determining response time.

## Usage

```
let metricsLogger = new ApiMetricsLogger(client, options);
server.on('after', (request: any, response: Response, route: Route, error) => {
    metricsLogger.logResponseMetrics(request, response, route, error);
});
```

## Options

* `timing` *boolean* log the timing for each request. `default = true`
* `increment` *boolean* increment for each request. `default = true`

## License

ISC License

Copyright (c) 2016, Changepoint

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Attribution

Based on the work originally done by [jtrinklein](https://github.com/jtrinklein) [here](https://github.com/daptiv/api-metrics-client).
