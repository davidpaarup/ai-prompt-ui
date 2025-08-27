import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient();
 
const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "microsoft",
    callbackURL: "/dashboard", // The URL to redirect to after the sign in
  });
};