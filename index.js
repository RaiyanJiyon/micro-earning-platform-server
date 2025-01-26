const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5qizv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();

        const userCollection = client.db('microDB').collection('users');
        const taskCollection = client.db('microDB').collection('tasks');
        const submissionCollection = client.db('microDB').collection('submissions');
        const paymentCollection = client.db('microDB').collection('payments');
        const withdrawalCollection = client.db('microDB').collection('withdrawals');
        const notificationCollection = client.db('microDB').collection('notifications');
        const adminActivityCollection = client.db('microDB').collection('adminActivity');

        // Users related APIs
        app.get('/users', async (req, res) => {
            try {
                const result = await userCollection.find().toArray();
                res.status(200).send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch users data' });
            }
        });

        // Check if a user exists by email
        app.get('/users/email/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const user = await userCollection.findOne({ email });

                if (user) {
                    res.status(200).send({ exists: true });
                } else {
                    res.status(200).send({ exists: false });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to check user existence' });
            }
        });

        app.get('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = {_id : new ObjectId(id)};
                const result = await userCollection.findOne(query);
                res.status(200).send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch user data' });
            }
        })

        // Add a new user
        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;

                // Check if the user already exists
                const existingUser = await userCollection.findOne({ email: newUser.email });

                if (existingUser) {
                    return res.status(400).send({ message: 'User already exists' });
                }

                // Insert new user into the collection
                const result = await userCollection.insertOne(newUser);

                if (result.insertedId) {
                    res.status(201).send(result);
                } else {
                    res.status(400).send({ message: 'Failed to add new user' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to add new user' });
            }
        });

        // Delete a user by ID
        app.delete('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await userCollection.deleteOne(query);

                if (result.deletedCount > 0) {
                    res.status(204).send();
                } else {
                    res.status(404).send({ message: 'User not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to delete user' });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

// Basic API
app.get('/', (req, res) => {
    res.send('Hello Micro Earning Pro');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});