import dotenv from 'dotenv'

// Load environment variables before initializing the application
dotenv.config()

import app from './app'

const PORT = parseInt(process.env.PORT || '5000', 10)

const server = app.listen(PORT, () => {
  console.log(`Lumina Finance API running on: http://localhost:${PORT}`)
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`)
})

export default server
