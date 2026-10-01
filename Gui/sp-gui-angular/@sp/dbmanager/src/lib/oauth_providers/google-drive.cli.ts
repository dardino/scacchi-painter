/**
 * Google Drive OAuth client configuration.
 * This app uses Google Identity Services for browser-based access,
 * so it does not keep a client secret in the frontend.
 */
export const GOOGLE_DRIVE_CLIENT_ID = "1723600869-b47g1t480rn5nsn43gcivv153qahq5fg.apps.googleusercontent.com";

export const GOOGLE_DRIVE_AUTH_CONFIG = {
  clientId: GOOGLE_DRIVE_CLIENT_ID,
  redirectUri: `${location.origin}/redirect`,
  authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  scopes: [
    "https://www.googleapis.com/auth/drive",
  ],
} as const;

type GoogleDriveTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: GoogleDriveTokenResponse) => void;
            error_callback?: (error: unknown) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

function base64UrlEncode(value: Uint8Array): string {
  const binary = Array.from(value, byte => String.fromCharCode(byte)).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generateGoogleDriveCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function generateGoogleDriveCodeChallenge(codeVerifier: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    return codeVerifier;
  }

  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  return base64UrlEncode(new Uint8Array(digest));
}

export async function getGoogleDriveAuthUrl(state: string, codeVerifier?: string): Promise<string> {
  if (!GOOGLE_DRIVE_AUTH_CONFIG.clientId) {
    return "";
  }

  const verifier = codeVerifier ?? generateGoogleDriveCodeVerifier();
  const challenge = await generateGoogleDriveCodeChallenge(verifier);
  const codeChallengeMethod = globalThis.crypto?.subtle ? "S256" : "plain";
  const authUrl = new URL(GOOGLE_DRIVE_AUTH_CONFIG.authEndpoint);
  authUrl.searchParams.set("client_id", GOOGLE_DRIVE_AUTH_CONFIG.clientId);
  authUrl.searchParams.set("redirect_uri", GOOGLE_DRIVE_AUTH_CONFIG.redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", GOOGLE_DRIVE_AUTH_CONFIG.scopes.join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", codeChallengeMethod);

  return authUrl.toString();
}

export async function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Google Identity Services.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
      }
      else {
        reject(new Error("Google Identity Services did not initialize."));
      }
    };
    script.onerror = () => reject(new Error("Unable to load Google Identity Services."));
    document.head.appendChild(script);
  });
}

export async function requestGoogleDriveAccessToken(): Promise<GoogleDriveTokenResponse> {
  await loadGoogleIdentityScript();

  const googleApi = window.google?.accounts?.oauth2;
  if (!googleApi) {
    throw new Error("Google Identity Services is not available in the current browser.");
  }

  return await new Promise<GoogleDriveTokenResponse>((resolve, reject) => {
    const tokenClient = googleApi.initTokenClient({
      client_id: GOOGLE_DRIVE_AUTH_CONFIG.clientId,
      scope: GOOGLE_DRIVE_AUTH_CONFIG.scopes.join(" "),
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }

        if (!response.access_token) {
          reject(new Error("Google Identity Services did not return an access token."));
          return;
        }

        resolve({
          access_token: response.access_token,
          refresh_token: response.refresh_token ?? "",
          expires_in: response.expires_in ?? 3600,
          expiry_date: Date.now() + (response.expires_in ?? 3600) * 1000,
          token_type: response.token_type ?? "Bearer",
          scope: response.scope ?? GOOGLE_DRIVE_AUTH_CONFIG.scopes.join(" "),
        });
      },
      error_callback: error => reject(error instanceof Error ? error : new Error(String(error))),
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export async function exchangeGoogleDriveCode(code: string, codeVerifier?: string) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_DRIVE_AUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_DRIVE_AUTH_CONFIG.redirectUri,
    grant_type: "authorization_code",
  });

  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const response = await fetch(GOOGLE_DRIVE_AUTH_CONFIG.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const rawText = await response.text();
    let details = rawText;

    try {
      const parsed = JSON.parse(rawText) as { error?: string; error_description?: string };
      if (parsed.error === "invalid_request" && parsed.error_description?.includes("client_secret")) {
        details = "Google OAuth client requires a server-side token exchange or a browser-compatible public client configuration. This browser flow is not allowed for a confidential client.";
      }
    }
    catch {
      // ignore parse failures and keep the raw response text
    }

    throw new Error(`Google token exchange failed: ${details}`);
  }

  return await response.json() as GoogleDriveTokenResponse;
}
