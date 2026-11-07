import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

const openApiJsonPath = path.resolve(process.cwd(), 'docs/openapi.json');
const openApiYamlPath = path.resolve(process.cwd(), 'docs/openapi.yaml');
const postmanSpecPath = path.resolve(process.cwd(), 'postman/openapi-spec.json');
const rootSpecPath = path.resolve(process.cwd(), 'openapi.json');

const spec = JSON.parse(fs.readFileSync(openApiJsonPath, 'utf8'));

// 1. Tambahkan ProblemDetailsResponse ke components.schemas
spec.components = spec.components || {};
spec.components.schemas = spec.components.schemas || {};

spec.components.schemas.ProblemDetailsResponse = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      format: 'uri',
      example: 'https://api.perpus.ac.id/errors/bad-request',
      description: 'URI identifikasi tipe problem sesuai RFC 9457',
    },
    title: {
      type: 'string',
      example: 'Bad Request',
      description: 'Ringkasan singkat problem',
    },
    status: {
      type: 'integer',
      example: 400,
      description: 'Status code HTTP',
    },
    detail: {
      type: 'string',
      example: 'Data input tidak valid atau stok eksemplar habis',
      description: 'Penjelasan spesifik kesalahan yang terjadi',
    },
    instance: {
      type: 'string',
      example: '/api/v1/books',
      description: 'URI resource endpoint tempat terjadinya kesalahan',
    },
  },
  required: ['type', 'title', 'status', 'detail', 'instance'],
};

// 2. Perbarui parameter sorting pada GET /api/v1/books dan GET /api/v1/members
const sortingParams = [
  {
    name: 'sortBy',
    in: 'query',
    required: false,
    schema: {
      type: 'string',
      default: 'createdAt',
    },
    description: 'Kolom untuk pengurutan data terverifikasi allowlist',
  },
  {
    name: 'order',
    in: 'query',
    required: false,
    schema: {
      type: 'string',
      enum: ['ASC', 'DESC'],
      default: 'DESC',
    },
    description: 'Arah pengurutan data (ASC atau DESC) dengan secondary tie-breaker id ASC',
  },
];

for (const listPath of ['/api/v1/books', '/api/v1/members']) {
  if (spec.paths[listPath] && spec.paths[listPath].get) {
    const existingParams = spec.paths[listPath].get.parameters || [];
    const filteredParams = existingParams.filter(
      (p) => p.name !== 'sortBy' && p.name !== 'order',
    );
    spec.paths[listPath].get.parameters = [...filteredParams, ...sortingParams];
  }
}

// 3. Tambahkan ETag header pada respons GET /api/v1/books/{id} dan GET /api/v1/members/{id}
const etagHeaderDefinition = {
  ETag: {
    schema: {
      type: 'string',
      example: '"e3b0c44298fc1c149afbf4c8996fb92427ae41e4"',
    },
    description: 'Strong entity tag RFC 9110 penjamin integritas & concurrency',
  },
};

for (const detailPath of ['/api/v1/books/{id}', '/api/v1/members/{id}']) {
  if (spec.paths[detailPath] && spec.paths[detailPath].get) {
    const getOp = spec.paths[detailPath].get;
    if (getOp.responses && getOp.responses['200']) {
      getOp.responses['200'].headers = etagHeaderDefinition;
    }
  }
}

// 4. Tambahkan If-Match header dan respons 412 pada PUT/PATCH books & members
const ifMatchParam = {
  name: 'If-Match',
  in: 'header',
  required: false,
  schema: {
    type: 'string',
  },
  description: 'Strong ETag validator untuk optimistic concurrency control (RFC 9110)',
};

const response412 = {
  description: 'Precondition Failed - ETag usang atau tidak cocok',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ErrorResponseEnvelope',
      },
    },
    'application/problem+json': {
      schema: {
        $ref: '#/components/schemas/ProblemDetailsResponse',
      },
    },
  },
};

const problemDetailsResponse400 = {
  'application/json': {
    schema: {
      $ref: '#/components/schemas/ErrorResponseEnvelope',
    },
  },
  'application/problem+json': {
    schema: {
      $ref: '#/components/schemas/ProblemDetailsResponse',
    },
  },
};

for (const mutationPath of ['/api/v1/books/{id}', '/api/v1/members/{id}']) {
  if (spec.paths[mutationPath]) {
    for (const method of ['put', 'patch']) {
      if (spec.paths[mutationPath][method]) {
        const op = spec.paths[mutationPath][method];
        op.parameters = op.parameters || [];
        const hasIfMatch = op.parameters.some((p) => p.name.toLowerCase() === 'if-match');
        if (!hasIfMatch) {
          op.parameters.push(ifMatchParam);
        }
        op.responses = op.responses || {};
        op.responses['412'] = response412;
      }
    }
  }
}

// 5. Tambahkan Problem Details media type pada respons error 400 dan 409
for (const pathKey of Object.keys(spec.paths)) {
  for (const methodKey of Object.keys(spec.paths[pathKey])) {
    const op = spec.paths[pathKey][methodKey];
    if (op.responses) {
      if (op.responses['400']) {
        op.responses['400'].content = problemDetailsResponse400;
      }
      if (op.responses['409']) {
        op.responses['409'].content = problemDetailsResponse400;
      }
    }
  }
}

// 6. Simpan dokumen tersinkronisasi
const updatedJson = JSON.stringify(spec, null, 2);
fs.writeFileSync(openApiJsonPath, updatedJson, 'utf8');
fs.writeFileSync(postmanSpecPath, updatedJson, 'utf8');
fs.writeFileSync(rootSpecPath, updatedJson, 'utf8');

const updatedYaml = yaml.dump(spec, {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
});
fs.writeFileSync(openApiYamlPath, updatedYaml, 'utf8');

console.log('OpenAPI JSON and YAML successfully synchronized across docs/, postman/, and root!');
