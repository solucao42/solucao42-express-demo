# Solução42 - Express Demo

Esse repositório foi construído para mostrar e simplificar como o OpenTelemetry é configurado para funcionar com a Solução42.

O respositório base foi criado com o [Express Starter Kit](https://github.com/thatbeautifuldream/express-starter)

## Iniciar Aplicação

```
docker-compose up && \
yarn sequelize db:migrate --migrations-path src/models/migrations --config src/config/database-config.json
```

## Instalação

**1. Instalar Pacotes**

```bash
yarn add @opentelemetry/sdk-node \
         @opentelemetry/exporter-trace-otlp-proto \
         @opentelemetry/auto-instrumentations-node
```

**2. Criar Arquivo do OpenTelemetry**

Crie um arquivo chamado `solucao42.js` ao lado do arquivo de inicialização do express.

```javascript
const { readFileSync } = require('fs');

const opentelemetry = require('@opentelemetry/sdk-node');
const {
    OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-proto');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

const ENV_NAME = process.env.NODE_ENV || 'dev';
const PACKAGE = JSON.parse(readFileSync('./package.json') || '{}');

if(!process.env.OTEL_EXPORTER_OTLP_HEADERS)
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'api-key=API_KEY';

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
```

**3. Configurar o Express**

```javascript
// no arquivo de inicialização do express

// importar arquivo do OpenTelemetry da Solucação42
const { s42ErrorMiddleware} = require("./solucao42");

const express = require("express");

// ...
// adicione suas rotas e todas as outras configurações do express aqui
app.use("/api", apiRoutes);
// ...

// adicione o middleware de erro da Solucao42 no final da cadeia de middlewares
// imediatemente antes do app.listen
app.use(s42ErrorMiddleware);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
```

**4. Definir Api Key**

Nesta Etapa, é necessário definir o API KEY cadastrado na Solução42 como variável de ambiente.

```
OTEL_EXPORTER_OTLP_HEADERS='api-key=API_KEY'
```

**Prontinho**

Agora é só rodar a aplicação e verificar se os traces estão sendo enviados para a Solução42.