const opentelemetry = require('@opentelemetry/sdk-node');
const {
    OTLPTraceExporter,
    StatusCode
} = require('@opentelemetry/exporter-trace-otlp-proto');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

process.env.OTEL_RESOURCE_ATTRIBUTES =
    `service.name=solucao42-express-demo` + (process.env.NODE_ENV !== 'prod' ? '-dev' : '');

process.env.OTEL_EXPORTER_OTLP_HEADERS =
    'api-key=XXX';

process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'https://collector-http-oltp.solucao42.com.br/';

const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter({
        concurrencyLimit: 5,
        timeoutMillis: 9000
    }),
    instrumentations: [getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-http": {
            applyCustomAttributesOnSpan: (span, request, response) => {
                span.setAttribute("http.status_code", response.statusCode.toString());

                if(response.error) {
                    span.recordException(response.error);
                    span.setStatus({
                        code: opentelemetry.api.SpanStatusCode.ERROR
                    })
                    return;
                }

                if(span.status.code === opentelemetry.api.SpanStatusCode.UNSET) {
                    span.setStatus({
                        code: response.statusCode < 500 ? opentelemetry.api.SpanStatusCode.OK : opentelemetry.api.SpanStatusCode.ERROR
                    })
                }
            }
        }
    })]
});

sdk.start();

const s42ErrorMiddleware = (error, req, res, next) => {
    res.error = error;
    next(error);
}

module.exports = { s42ErrorMiddleware }