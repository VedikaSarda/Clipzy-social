import dotenv from 'dotenv'
import connectDb from './db/db.js'
import  {app } from './app.js'
dotenv.config({ path: '../.env' })
const port = process.env.Port || 8000
connectDb()
.then(() => {
app.on('error', (error) => {
console.log(error)
throw error
    })

    app.listen(port , () => {
        console.log(`Server is listening on port ${port}`)
    })
})
.catch((error) => {
    console.log(`MONGODB CONNECTION FAILED ${error}`)
})