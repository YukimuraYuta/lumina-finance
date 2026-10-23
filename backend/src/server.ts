import { config } from './config/env'
import app from './app'

const PORT = config.PORT

const server = app.listen(PORT, () => {
  console.log(`Lumina Finance API running on: http://localhost:${PORT}`)
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`)
})

export default server
