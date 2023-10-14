const PORT = 8000

const express = require('express')
const { MongoClient } = require('mongodb')
const { v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')
const {google}=require('googleapis');
const uri = 'mongodb://0.0.0.0:27017'


const app = express()
app.use(cors())
app.use(express.json())

//api configuration and creadential's to be changed according to use case
const scopes=['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email','https://www.googleapis.com/auth/profile.emails.read']
const clienid="231065169890-l55sbl2ij802t79ukp11po6eidc1ii16.apps.googleusercontent.com"
const clientsecret="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"
const redirecturi="http://localhost:8000/google";
const oauthclient=new google.auth.OAuth2(clienid,clientsecret,redirecturi);


app.get('/authgoogle',(req,res)=>{
    const authurl=oauthclient.generateAuthUrl({access_type:'offline',scope:scopes})
    res.redirect(authurl)   //handles the auth request from frontend and redirect's to google
})
app.get('/google',async(req,res)=>{ //handles the callback from google
    const {code}=req.query
    try {
       
        const { tokens } = await oauthclient.getToken(code);
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token; //keeping the token's open incase more type of data is required
        var auth=oauthclient;
        auth.credentials=tokens;

        const people = google.people({ version: 'v1', auth:auth });
        
        var googleid;
        people.people.get({
          resourceName: 'people/me',
          personFields: 'emailAddresses'
        })
        .then(async(response) => {
            const client = new MongoClient(uri)
            const generateUserId = uuidv4() //create the user in database
            
            await client.connect()
            const database = client.db('app-data')
            const users = database.collection('users')


          const email=response.data.emailAddresses[0].value;
          const sanitizedEmail = email.toLowerCase()
          const existingUser = await users.findOne( { email })
          if(existingUser) {
            const token = jwt.sign(existingUser, sanitizedEmail, {
                expiresIn: 60*24,   //sign the token and send it
            })
            
            const resobject=JSON.stringify({token:token,userId:existingUser.user_id,logged:'true'});
            res.redirect('http://localhost:3000/oauthlogger/'+resobject)
            return;
        }
      
         

        const data = {
            user_id: generateUserId,
            email: sanitizedEmail,
         
        }
        const insertedUser = await users.insertOne(data)

        const token = jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60*24,
        })

        const resobject=JSON.stringify({token:token,userId:generateUserId,logged:'false'});
        res.redirect('http://localhost:3000/oauthlogger/'+resobject)
        
         
        })
       
        
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error during authentication');
      }
})
app.post('/abandon',async (req,res)=>{
    const client = new MongoClient(uri);
    console.log('called')
    await client.connect();
    const database = client.db('app-data')
    const users = database.collection('users')
    const data= req.body;
    try{ 
           await users.deleteOne({user_id:data.user_id})   
    }
    catch(e){
        console.log(e);
    }
    res.send('done')
})
app.get('/exist',async (req,res)=>{
    const id = req.query.user_id;
    const client = new MongoClient(uri);
    console.log('exist called')
    try{
        await client.connect();
        const database = client.db('app-data')
        const users = database.collection('users')

        const existingUser = await users.findOne({user_id:id})
        if(existingUser==null){
            res.send('noUser');

        }
        else{
            res.send('exist');
        }
    }
    catch(e){
        console.log(e);
    }
})
app.get('/', (req, res) => {
    res.json('Hello to my app')
})


app.post('/signup', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, password } = req.body

    const generateUserId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const existingUser = await users.findOne( { email })

        if(existingUser) {
            return res.status(409).send('User already exists. Please login')
        }

        const sanitizedEmail = email.toLowerCase()

        const data = {
            user_id: generateUserId,
            email: sanitizedEmail,
            hashed_password: hashedPassword
        }
        const insertedUser = await users.insertOne(data)

        const token = jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60*24,
        })

        res.status(201).json({ token, userId: generateUserId })

    } catch (err) {
        console.log(err)
    }

})


app.post('/login', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, password } = req.body

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const user = await users.findOne({ email })

        const correctPassword = await bcrypt.compare(password, user.hashed_password)

        if(user && correctPassword) {
            const token = jwt.sign(user, email, {
                expiresIn: 60 * 24
            })
            res.status(201).json({ token, userId: user.user_id })
        }
        res.status(400).json('Invalid Credentials')
    } catch (err) {
        console.log(err)
    }
})







app.get('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const userId = req.query.userId




    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: userId }
        const user = await users.findOne(query)
        res.send(user)
    } finally {
        await client.close()
    }
})




app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)
    const userIds = JSON.parse(req.query.userIds)


    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const pipeline =
            [
                {
                    '$match' : {
                        'user_id': {
                            '$in': userIds
                        }
                    }
                }
            ]

        const foundUsers = await users.aggregate(pipeline).toArray()

        res.send(foundUsers)


    } finally {
        await client.close()
    }
})






app.get('/gendered-users', async (req, res) => {
   const client = new MongoClient(uri)
    const gender = req.query.gender



    try {
       await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')
        const query = { gender_identity: { $eq : gender}}
        const foundUsers = await users.find(query).toArray()


        res.send(foundUsers)
    } finally {
        await client.close()
    }
})





app.put('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const formData = req.body.formData

    console.log(formData)

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')


        const query = { user_id: formData.user_id}
        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                dob_day: formData.dob_day,
                dob_month: formData.dob_month,
                dob_year: formData.dob_year,
                show_gender: formData.show_gender,
                gender_identity: formData.gender_identity,
                gender_interest: formData.gender_interest,
                url: formData.url,
                about: formData.about,
                matches: formData.matches
            },
        }
        const insertedUser = await users.updateOne(query, updateDocument)
        res.send(insertedUser)
    } finally {
        await client.close()
    }
})



app.put('/addmatch', async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, matchedUserId } = req.body

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: userId}
        const updateDocument = {
            $push: { matches: {user_id: matchedUserId}}
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } finally {
        await client.close()
    }
})





app.get('/messages', async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, correspondingUserId } = req.query


    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const query = {
            from_userId: userId, to_userId: correspondingUserId
        }
        const foundMessages = await messages.find(query).toArray()
        res.send(foundMessages)
    } finally {
        await client.close()
    }
})







app.post('/message', async (req, res) => {
    const client = new MongoClient(uri)
    const message = req.body.message

    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const insertedMessage = await messages.insertOne(message)
        res.send(insertedMessage)
    } finally {
        await client.close()
    }
})









app.listen(PORT, () => console.log('Server running on PORT ' + PORT))
