import admin from "firebase-admin";
import fs from "fs";

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY) {
  // On Render (or any prod env)
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} else {
  // Locally (fallback to file)
  serviceAccount = JSON.parse(
    fs.readFileSync(new URL("../serviceAccountKey.json", import.meta.url))
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
