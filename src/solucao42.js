const { readFileSync } = require('fs');

const opentelemetry = require('@opentelemetry/sdk-node');
const {
    OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-proto');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

const ENV_NAME = process.env.NODE_ENV || 'dev';
const PACKAGE = JSON.parse(readFileSync('./package.json') || '{}');

process.env.OTEL_EXPORTER_OTLP_HEADERS =
    'api-key=API_KEY';

function createResourceParams() {
    let serviceName = PACKAGE.name || "unknown-service-name";

    if(ENV_NAME !== 'prod') serviceName += `-${ENV_NAME}`;

    return {
        'service.name': serviceName,
        'service.version': PACKAGE.version || '0.0.0',
        'service.environment': ENV_NAME || 'dev',
    }
}

const sdk = new opentelemetry.NodeSDK({
    resource: new opentelemetry.resources.Resource(createResourceParams()),
    traceExporter: new OTLPTraceExporter({
        url: 'https://collector-http-oltp.solucao42.com.br/v1/traces',
        concurrencyLimit: 5,
        timeoutMillis: 30000
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