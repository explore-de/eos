import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: '../openapi.yaml',
  apiFile: './src/api/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/api/eosApi.ts',
  exportName: 'eosApi',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  tag: true,
}

export default config
