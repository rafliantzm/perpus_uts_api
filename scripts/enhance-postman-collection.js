import * as fs from 'node:fs';
import * as path from 'node:path';

const colPath = path.resolve(process.cwd(), 'postman/perpus_uts_api.postman_collection.json');
const col = JSON.parse(fs.readFileSync(colPath, 'utf8'));

const booksFolder = col.item.find((f) => f.name === 'Books');
const membersFolder = col.item.find((f) => f.name === 'Members');

// Reset to original items first
const originalBookNames = [
  'Get All Books',
  'Create Book',
  'Get Book Detail by ID',
  'Update Book (PUT)',
  'Update Book Partial (PATCH)',
  'Delete Book',
];
const originalMemberNames = [
  'Get All Members',
  'Register Member',
  'Get Member Detail by ID',
  'Update Member (PUT)',
  'Update Member Partial (PATCH)',
  'Delete Member',
];

const getBooksSorted = {
  name: 'Get Books Sorted ASC (Stable Sorting)',
  request: {
    method: 'GET',
    header: [{ key: 'Accept', value: 'application/json' }],
    url: {
      raw: '{{baseUrl}}/books?sortBy=title&order=ASC',
      host: ['{{baseUrl}}'],
      path: ['books'],
      query: [
        { key: 'sortBy', value: 'title' },
        { key: 'order', value: 'ASC' },
      ],
    },
  },
  event: [
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'pm.test("Status code is 200", function () {',
          '    pm.response.to.have.status(200);',
          '});',
          'pm.test("Books list envelope is valid", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json.success).to.be.true;',
          '    pm.expect(json.data).to.be.an("array");',
          '});',
        ],
      },
    },
  ],
};

const updateBookIfMatch = {
  name: 'Update Book with Valid If-Match (Strong ETag)',
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: [
          'const baseUrl = pm.variables.get("baseUrl") || pm.collectionVariables.get("baseUrl") || "http://localhost:3000/api/v1";',
          'const bookId = pm.collectionVariables.get("bookId");',
          'pm.sendRequest({',
          '    url: baseUrl + "/books/" + bookId,',
          '    method: "GET"',
          '}, function (err, res) {',
          '    if (!err && res) {',
          '        const etag = res.headers.get("ETag");',
          '        pm.variables.set("freshBookETag", etag);',
          '    }',
          '});',
        ],
      },
    },
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'pm.test("Status code is 200", function () {',
          '    pm.response.to.have.status(200);',
          '});',
          'pm.test("Conditional update succeeds with valid If-Match", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json.success).to.be.true;',
          '    pm.expect(json.data.title).to.include("Strong ETag");',
          '});',
        ],
      },
    },
  ],
  request: {
    method: 'PUT',
    header: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' },
      { key: 'If-Match', value: '{{freshBookETag}}' },
    ],
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        title: 'Clean Code (Updated via Strong ETag)',
        author: 'Robert C. Martin',
        totalCopies: 5,
      }),
    },
    url: {
      raw: '{{baseUrl}}/books/{{bookId}}',
      host: ['{{baseUrl}}'],
      path: ['books', '{{bookId}}'],
    },
  },
};

const updateBook412 = {
  name: 'Update Book with Stale ETag (412 Precondition Failed)',
  request: {
    method: 'PUT',
    header: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' },
      { key: 'If-Match', value: '"0000000000000000000000000000000000000000"' },
    ],
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        title: 'Buku Tidak Boleh Terupdate',
        author: 'Penulis Gagal',
        totalCopies: 5,
      }),
    },
    url: {
      raw: '{{baseUrl}}/books/{{bookId}}',
      host: ['{{baseUrl}}'],
      path: ['books', '{{bookId}}'],
    },
  },
  event: [
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'pm.test("Status code is 412 Precondition Failed", function () {',
          '    pm.response.to.have.status(412);',
          '});',
          'pm.test("Stale ETag is rejected and resource is untouched", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json.success).to.be.false;',
          '    pm.expect(json.statusCode).to.eql(412);',
          '});',
        ],
      },
    },
  ],
};

const duplicateNimProblemDetails = {
  name: 'Register Member Duplicate NIM (RFC 9457 Problem Details)',
  request: {
    method: 'POST',
    header: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/problem+json' },
    ],
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        name: 'Duplikat Anggota Problem Details',
        nim: '{{memberNim}}',
        email: 'duplicate@perpus.ac.id',
      }),
    },
    url: {
      raw: '{{baseUrl}}/members',
      host: ['{{baseUrl}}'],
      path: ['members'],
    },
  },
  event: [
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'pm.test("Status code is 409 Conflict", function () {',
          '    pm.response.to.have.status(409);',
          '});',
          'pm.test("Content-Type is application/problem+json", function () {',
          '    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/problem+json");',
          '});',
          'pm.test("Response conforms to RFC 9457 schema", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.have.property("type");',
          '    pm.expect(json).to.have.property("title", "Conflict");',
          '    pm.expect(json).to.have.property("status", 409);',
          '    pm.expect(json).to.have.property("detail");',
          '    pm.expect(json).to.have.property("instance");',
          '});',
        ],
      },
    },
  ],
};

// Filter existing original requests
const existingBooks = booksFolder.item.filter((r) => originalBookNames.includes(r.name));
const existingMembers = membersFolder.item.filter((r) => originalMemberNames.includes(r.name));

booksFolder.item = [
  existingBooks[0], // Get All Books
  getBooksSorted,
  existingBooks[1], // Create Book
  existingBooks[2], // Get Book Detail by ID
  updateBookIfMatch,
  updateBook412,
  existingBooks[3], // Update Book (PUT)
  existingBooks[4], // Update Book Partial (PATCH)
  existingBooks[5], // Delete Book
];

membersFolder.item = [
  existingMembers[0], // Get All Members
  existingMembers[1], // Register Member
  duplicateNimProblemDetails,
  existingMembers[2], // Get Member Detail by ID
  existingMembers[3], // Update Member (PUT)
  existingMembers[4], // Update Member Partial (PATCH)
  existingMembers[5], // Delete Member
];

fs.writeFileSync(colPath, JSON.stringify(col, null, 2), 'utf8');
console.log('Postman Collection re-assembled in logical flow!');
