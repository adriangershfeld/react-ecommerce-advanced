// jest.setup.js
const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream } = require('web-streams-polyfill');
const { URL } = require('url');

// Add missing web APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.URL = URL;
global.ReadableStream = ReadableStream;

// Add other polyfills as needed
require('firebase/auth');
require('firebase/firestore');