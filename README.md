# Derkap

## Dev:

### Start local Supabase:
- `cd application`
- `pnpm install`
- `supabase start`
- Verify it's running with `supabase status`

### API:
- `cd api`
- `pnpm install`
- Fill in the `.env` file with the necessary information from the `.env.example` file. Based on what the `supabase status` command outputs
- `npm run dev`

### Launch Expo app:
- `cd application`
- `pnpm install` (Should already be done)
- Fill in the `.env` file with the necessary information from the `.env.example` file. Based on what the `supabase status` command outputs + the API
- `npm run start`

### Encryption key:
- The encryption key is stored in the `.env` file. It is used to encrypt and decrypt the private data (posts photos) stored in the database.
In development, if you change the encryption key, the photos posted with the previous key will not be decrypted correctly.

### Notes:

If you want to run the app on a physical device, you can use the Expo Go app.

Just scan the QR code that appears in the terminal after running `npm run start`.

You may need to configure ngrok to expose the API & Supabase to the internet. You can do this by running `ngrok http 3000` (for API) and `ngrok http 54321` (for Supabase) respectively. And run the app with `npm run start:tunnel`.

If you have a free ngrok account, you may need to configure your ngrok yaml and run `ngrok start --all` to expose both the API and Supabase to the internet.
