export interface GoogleUserInfo {
  sub: string; // googleId
  email: string;
  name: string;
  email_verified: boolean;
}

export const getGoogleUserInfo = async (
  accessToken: string,
): Promise<GoogleUserInfo> => {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json() as unknown as GoogleUserInfo;
};
