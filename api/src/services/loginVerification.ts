// server.js
import express from 'express'

const app = express()

app.get('/api/callback', async (req, res) => {
  const code = req.query.code as string
  const clientId = process.env.VITE_DISCORD_CLIENT_ID!;
  const clientSecret = process.env.VITE_DISCORD_CLIENT_SECRET!;

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:5173/callback',
    })
  })

  const data = await response.json()
  res.json(data)
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
