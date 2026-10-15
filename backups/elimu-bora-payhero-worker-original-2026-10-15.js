      
      const PROJECT_ID = "elimu-bora-7144f";
      const FIREBASE_API_KEY = "AIzaSyC6JBx_7_aZl6zhFAXUMgbi3EBMQaFzYpc";
      const CHANNEL_ID = 12959;
      const SITE_ORIGIN = "https://sirkoja1.github.io";
      const WORKER_URL = "https://elimu-bora-payhero.kojasalim2015.workers.dev";
      
      const PLANS = {
        weekly: { amount: 70, days: 7 },
          "7": { amount: 70, days: 7 },
            "7days": { amount: 70, days: 7 },
              "7 days": { amount: 70, days: 7 },
                monthly: { amount: 250, days: 30 },
                  "30": { amount: 250, days: 30 },
                    "30days": { amount: 250, days: 30 },
                      "30 days": { amount: 250, days: 30 },
                        yearly: { amount: 1000, days: 365 },
                          "365": { amount: 1000, days: 365 },
                            "365days": { amount: 1000, days: 365 },
                              "365 days": { amount: 1000, days: 365 }
                              };
                              
                              function json(data, status = 200, origin = SITE_ORIGIN) {
                                return new Response(JSON.stringify(data), {
                                    status,
                                        headers: {
                                              "Content-Type": "application/json",
                                                    "Access-Control-Allow-Origin": origin,
                                                          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                                                                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                                                                      "Cache-Control": "no-store"
                                                                          }
                                                                            });
                                                                            }
                                                                            
                                                                            function base64UrlBytes(bytes) {
                                                                              let binary = "";
                                                                                const chunkSize = 8192;
                                                                                  for (let i = 0; i < bytes.length; i += chunkSize) {
                                                                                      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
                                                                                        }
                                                                                          return btoa(binary)
                                                                                              .replace(/\+/g, "-")
                                                                                                  .replace(/\//g, "_")
                                                                                                      .replace(/=+$/g, "");
                                                                                                      }
                                                                                                      
                                                                                                      function base64UrlJson(value) {
                                                                                                        return base64UrlBytes(
                                                                                                            new TextEncoder().encode(JSON.stringify(value))
                                                                                                              );
                                                                                                              }
                                                                                                              
                                                                                                              async function authenticateFirebase(request) {
                                                                                                                const authorization = request.headers.get("Authorization") || "";
                                                                                                                
                                                                                                                  if (!authorization.startsWith("Bearer ")) {
                                                                                                                      throw new Error("Please sign in to your Elimu Bora account first.");
                                                                                                                        }
                                                                                                                        
                                                                                                                          const idToken = authorization.slice(7);
                                                                                                                          
                                                                                                                            const response = await fetch(
                                                                                                                                "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key="
                                                                                                                                      + encodeURIComponent(FIREBASE_API_KEY),
                                                                                                                                          {
                                                                                                                                                method: "POST",
                                                                                                                                                      headers: { "Content-Type": "application/json" },
                                                                                                                                                            body: JSON.stringify({ idToken })
                                                                                                                                                                }
                                                                                                                                                                  );
                                                                                                                                                                  
                                                                                                                                                                    const result = await response.json();
                                                                                                                                                                    
                                                                                                                                                                      if (!response.ok || !result.users || !result.users.length) {
                                                                                                                                                                          throw new Error("Your login has expired. Sign in again.");
                                                                                                                                                                            }
                                                                                                                                                                            
                                                                                                                                                                              return {
                                                                                                                                                                                  uid: result.users[0].localId,
                                                                                                                                                                                      email: result.users[0].email || ""
                                                                                                                                                                                        };
                                                                                                                                                                                        }
                                                                                                                                                                                        
                                                                                                                                                                                        async function getGoogleAccessToken(env) {
                                                                                                                                                                                          const service = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
                                                                                                                                                                                            const now = Math.floor(Date.now() / 1000);
                                                                                                                                                                                            
                                                                                                                                                                                              const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
                                                                                                                                                                                                const payload = base64UrlJson({
                                                                                                                                                                                                    iss: service.client_email,
                                                                                                                                                                                                        sub: service.client_email,
                                                                                                                                                                                                            aud: "https://oauth2.googleapis.com/token",
                                                                                                                                                                                                                iat: now,
                                                                                                                                                                                                                    exp: now + 3600,
                                                                                                                                                                                                                        scope: "https://www.googleapis.com/auth/datastore"
                                                                                                                                                                                                                          });
                                                                                                                                                                                                                          
                                                                                                                                                                                                                            const unsigned = header + "." + payload;
                                                                                                                                                                                                                              const pem = service.private_key
                                                                                                                                                                                                                                  .replace(/-----BEGIN PRIVATE KEY-----/g, "")
                                                                                                                                                                                                                                      .replace(/-----END PRIVATE KEY-----/g, "")
                                                                                                                                                                                                                                          .replace(/\s/g, "");
                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                            const keyBytes = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                              const privateKey = await crypto.subtle.importKey(
                                                                                                                                                                                                                                                  "pkcs8",
                                                                                                                                                                                                                                                      keyBytes,
                                                                                                                                                                                                                                                          { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
                                                                                                                                                                                                                                                              false,
                                                                                                                                                                                                                                                                  ["sign"]
                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                      const signature = await crypto.subtle.sign(
                                                                                                                                                                                                                                                                          "RSASSA-PKCS1-v1_5",
                                                                                                                                                                                                                                                                              privateKey,
                                                                                                                                                                                                                                                                                  new TextEncoder().encode(unsigned)
                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                      const assertion = unsigned + "." +
                                                                                                                                                                                                                                                                                          base64UrlBytes(new Uint8Array(signature));
                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                            const response = await fetch(
                                                                                                                                                                                                                                                                                                "https://oauth2.googleapis.com/token",
                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                          method: "POST",
                                                                                                                                                                                                                                                                                                                headers: {
                                                                                                                                                                                                                                                                                                                        "Content-Type": "application/x-www-form-urlencoded"
                                                                                                                                                                                                                                                                                                                              },
                                                                                                                                                                                                                                                                                                                                    body: new URLSearchParams({
                                                                                                                                                                                                                                                                                                                                            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                                                                                                                                                                                                                                                                                                                                                    assertion
                                                                                                                                                                                                                                                                                                                                                          })
                                                                                                                                                                                                                                                                                   --- TRUNCATED --- 405,754 chars