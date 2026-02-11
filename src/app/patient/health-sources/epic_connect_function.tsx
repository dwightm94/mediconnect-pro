// Add this function to your HealthSourcesPage component (around line 130)
// This replaces the complex handleEpicConnect function

const handleDirectEpicConnect = useCallback(() => {
  if (!user?.sub) return;

  // Generate PKCE challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store for token exchange
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);

  // State with patient info
  const state = btoa(JSON.stringify({
    patientId: user.sub,
    provider: 'epic',
    orgName: 'Epic MyChart',
    timestamp: Date.now(),
  }));

  // Epic's universal OAuth URL - Epic will show hospital picker
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: EPIC_PROD_CLIENT_ID,
    redirect_uri: `${window.location.origin}/patient/health-sources/callback`,
    scope: EPIC_SCOPES,
    state: state,
    aud: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  // Redirect to Epic - Epic will show their hospital finder
  window.location.href = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?${params.toString()}`;
}, [user]);
