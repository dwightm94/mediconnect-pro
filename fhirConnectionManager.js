// fhirConnectionManager.js — Epic Production + Multi-Provider
const https = require('https');
const { DynamoDBClient, PutItemCommand, QueryCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: 'us-east-1' });
const TABLE = process.env.FHIR_TABLE || 'fhir_connections';
const EPIC_PROD_CLIENT_ID = 'f09904cf-3580-4e62-809e-2e748e3ea345';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ statusCode: res.statusCode, body: JSON.parse(d) }) } catch { resolve({ statusCode: res.statusCode, body: d }) } });
    });
    req.on('error', reject); req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')) });
  });
}

function httpsPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, port: 443, path: u.pathname + u.search, method: 'POST', headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ statusCode: res.statusCode, body: JSON.parse(d) }) } catch { resolve({ statusCode: res.statusCode, body: d }) } });
    });
    req.on('error', reject); req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) });
    req.write(body); req.end();
  });
}

// POST /fhir/discover — Fetch OAuth endpoints from any FHIR server
async function handleDiscover(body) {
  const { fhirBaseUrl } = body;
  if (!fhirBaseUrl) return { statusCode: 400, body: { error: 'fhirBaseUrl required' } };

  // Try .well-known/smart-configuration
  try {
    const r = await httpsGet(`${fhirBaseUrl}/.well-known/smart-configuration`, { Accept: 'application/json' });
    if (r.statusCode === 200 && r.body.authorization_endpoint) {
      return { statusCode: 200, body: { authorizeUrl: r.body.authorization_endpoint, tokenUrl: r.body.token_endpoint, source: 'well-known' } };
    }
  } catch (e) { console.log('.well-known failed:', e.message); }

  // Fallback: /metadata
  try {
    const r = await httpsGet(`${fhirBaseUrl}/metadata`, { Accept: 'application/json' });
    if (r.statusCode === 200 && r.body.rest) {
      const ext = r.body.rest[0]?.security?.extension?.find(e => e.url === 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris');
      const auth = ext?.extension?.find(e => e.url === 'authorize')?.valueUri;
      const tok = ext?.extension?.find(e => e.url === 'token')?.valueUri;
      if (auth && tok) return { statusCode: 200, body: { authorizeUrl: auth, tokenUrl: tok, source: 'metadata' } };
    }
  } catch (e) { console.log('metadata failed:', e.message); }

  return { statusCode: 404, body: { error: 'Could not discover OAuth endpoints' } };
}

// POST /fhir/callback — Exchange auth code for tokens
async function handleCallback(body) {
  const { code, state, redirectUri, patientId, codeVerifier, tokenUrl, fhirBaseUrl } = body;
  if (!code || !state || !redirectUri) return { statusCode: 400, body: { error: 'Missing params' } };

  const effectiveTokenUrl = tokenUrl || state.tokenUrl;
  if (!effectiveTokenUrl) return { statusCode: 400, body: { error: 'Token URL not provided' } };

  let tokenBody = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(EPIC_PROD_CLIENT_ID)}`;
  if (codeVerifier) tokenBody += `&code_verifier=${encodeURIComponent(codeVerifier)}`;

  console.log('Token exchange at:', effectiveTokenUrl);
  const tr = await httpsPost(effectiveTokenUrl, tokenBody, { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' });
  console.log('Token status:', tr.statusCode);

  if (tr.statusCode !== 200) {
    console.error('Token error:', JSON.stringify(tr.body));
    return { statusCode: 400, body: { error: 'Token exchange failed', message: tr.body?.error_description || tr.body?.error || 'Unknown error' } };
  }

  const tokens = tr.body;
  const connId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const pid = patientId || state.patientId;
  const orgName = state.orgName || 'Health System';

  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: marshall({
      patientId: pid, connectionId: connId, provider: state.provider || 'epic',
      providerName: orgName, orgId: state.orgId || '', fhirBaseUrl: fhirBaseUrl || state.fhirBaseUrl || '',
      tokenUrl: effectiveTokenUrl, accessToken: tokens.access_token, refreshToken: tokens.refresh_token || '',
      expiresIn: tokens.expires_in || 3600, tokenScope: tokens.scope || '', patientFhirId: tokens.patient || '',
      status: 'active', lastSynced: new Date().toISOString(), createdAt: new Date().toISOString(),
      recordCount: 0, facilityName: orgName,
    }),
  }));

  return { statusCode: 200, body: { success: true, connectionId: connId, patientFhirId: tokens.patient, orgName } };
}

// GET /fhir/connections?patientId=xxx
async function handleGetConnections(patientId) {
  if (!patientId) return { statusCode: 400, body: { error: 'patientId required' } };
  const r = await dynamo.send(new QueryCommand({
    TableName: TABLE, KeyConditionExpression: 'patientId = :pid',
    ExpressionAttributeValues: marshall({ ':pid': patientId }),
  }));
  const connections = (r.Items || []).map(i => {
    const c = unmarshall(i);
    return { connectionId: c.connectionId, provider: c.provider, providerName: c.providerName, status: c.status, lastSynced: c.lastSynced, patientFhirId: c.patientFhirId, recordCount: c.recordCount || 0, facilityName: c.facilityName };
  });
  return { statusCode: 200, body: { connections } };
}

// DELETE /fhir/connections/{id}
async function handleDeleteConnection(connectionId, body) {
  if (!body.patientId || !connectionId) return { statusCode: 400, body: { error: 'Missing params' } };
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: marshall({ patientId: body.patientId, connectionId }) }));
  return { statusCode: 200, body: { success: true } };
}

// POST /fhir/sync
async function handleSync(body) {
  // TODO: Pull FHIR resources using stored access token
  return { statusCode: 200, body: { success: true, recordCount: 0 } };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  let result;
  const body = event.body ? JSON.parse(event.body) : {};
  const path = event.path || '';
  try {
    if (event.httpMethod === 'POST' && path.endsWith('/fhir/discover')) result = await handleDiscover(body);
    else if (event.httpMethod === 'POST' && path.endsWith('/fhir/callback')) result = await handleCallback(body);
    else if (event.httpMethod === 'GET' && path.includes('/fhir/connections')) result = await handleGetConnections(event.queryStringParameters?.patientId);
    else if (event.httpMethod === 'DELETE' && path.includes('/fhir/connections/')) result = await handleDeleteConnection(path.split('/fhir/connections/')[1], body);
    else if (event.httpMethod === 'POST' && path.endsWith('/fhir/sync')) result = await handleSync(body);
    else result = { statusCode: 404, body: { error: 'Not found' } };
  } catch (err) { console.error('Error:', err); result = { statusCode: 500, body: { error: 'Internal error' } }; }
  return { statusCode: result.statusCode, headers: CORS, body: JSON.stringify(result.body) };
};
