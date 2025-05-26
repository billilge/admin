export default {
    billilge: {
        input: process.env.OPENAPI_SCHEMA_URL,
        output: {
            target: './src/api-client/index.ts',
            client: 'react-query',
            schemas: './src/api-client/model',
        },
    },
}
