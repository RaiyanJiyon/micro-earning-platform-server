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

        // user role related API
        app.get('/users/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const query = { email: email };
                const result = await userCollection.findOne(query);

                if (result) {
                    // Include role-specific fields in the response
                    res.status(200).send({
                        ...result,
                        isAdmin: result.role === 'Admin',
                        isWorker: result.role === 'Worker',
                        isBuyer: result.role === 'Buyer',
                    });
                } else {
                    res.status(404).send({ message: 'User not found' });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                res.status(500).send({ message: 'Failed to fetch user data' });
            }
        });

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
        app.delete('/user/:id', async (req, res) => {
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

        // Reduce user's coins
        app.patch('/users/:userId/reduce-coins', async (req, res) => {
            try {
                const userId = req.params.userId;
                const { amount } = req.body;

                // Validate the amount
                if (typeof amount !== 'number' || amount <= 0) {
                    return res.status(400).send({ message: 'Invalid amount' });
                }

                // Find the user
                const user = await userCollection.findOne({ _id: new ObjectId(userId) });

                if (!user) {
                    return res.status(404).send({ message: 'User not found' });
                }

                // Check if the user has enough coins
                if (user.coins < amount) {
                    return res.status(400).send({ message: 'Not enough coins' });
                }

                // Reduce the user's coins
                const updatedCoins = user.coins - amount;
                const result = await userCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { coins: updatedCoins } }
                );

                if (result.modifiedCount > 0) {
                    res.status(200).send({ message: 'Coins reduced successfully', coins: updatedCoins });
                } else {
                    res.status(400).send({ message: 'Failed to reduce coins' });
                }
            } catch (error) {
                console.error('Error reducing coins:', error);
                res.status(500).send({ message: 'Failed to reduce coins' });
            }
        });

        // Tasks related APIs
        app.get('/tasks', async (req, res) => {
            try {
                const result = await taskCollection.find().toArray();
                res.status(200).send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch tasks data' });
            }
        });

        app.get('/task/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await taskCollection.findOne(query);

                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'No task found for the given ID' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch task data' });
            }
        });

        app.get('/tasks/:buyer_id', async (req, res) => {
            try {
                const buyer_id = req.params.buyer_id;
                const query = { buyer_id: buyer_id };
                const result = await taskCollection.find(query).toArray();

                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'No task found for the given buyer ID' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch task data' });
            }
        });


        app.post('/tasks', async (req, res) => {
            try {
                const newTask = req.body;
                const result = await taskCollection.insertOne(newTask);

                if (result.insertedId) {
                    res.status(200).send(result);
                } else {
                    res.status(400).send({ message: 'Failed to add new task' })
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to add new task' })
            }
        });

        app.patch('/task/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updateTask = {
                    $set: {
                        task_title: req.body.task_title,
                        task_detail: req.body.task_detail,
                        submission_info: req.body.submission_info
                    },
                };

                const result = await taskCollection.updateOne(filter, updateTask);

                if (result.modifiedCount === 1) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Task not found or no changes made' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to update task data' });
            }
        });


        app.delete('/task/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };

                // Fetch the task to calculate the refill amount
                const task = await taskCollection.findOne(query);
                if (!task) {
                    return res.status(404).send({ message: 'Task not found' });
                }

                // Calculate refill amount
                const refillAmount = task.required_workers * task.payable_amount;

                // Update the user's available coin
                const userQuery = { _id: new ObjectId(task.buyer_id) };
                const userUpdate = { $inc: { available_coin: refillAmount } };
                await userCollection.updateOne(userQuery, userUpdate);

                // Delete the task
                const result = await taskCollection.deleteOne(query);

                if (result.deletedCount === 1) {
                    res.status(200).send({ message: 'Task deleted and coins refunded successfully' });
                } else {
                    res.status(404).send({ message: 'Task not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to delete task data', error: error.message });
            }
        });


        /*
        -------------------payment related API-------------------------
        */
        app.get('/payments', async (req, res) => {
            try {
                const result = await paymentCollection.find().toArray();

                if (result.length > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'No payments found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'An error occurred while retrieving payments' });
            }
        });

        app.get('/payments/:userId', async (req, res) => {
            try {
                const id = req.params.userId;
                const query = { userId: id };
                const result = await paymentCollection.find(query).toArray();

                if (result.length > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'No payments found for this user' });
                }
            } catch (error) {
                res.status(500).send({ message: 'An error occurred while retrieving payments' });
            }
        });


        /*
        -------------------Users related APIs-------------------------
        */
        app.get('/submissions', async (req, res) => {
            try {
                const result = await submissionCollection.find().toArray();
                if (result.length > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'No submissions data found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'An error occurred while retrieving submissions data' });
            }
        });

        app.post('/submissions', async (req, res) => {
            try {
                const newSubmission = req.body;
                const result = await submissionCollection.insertOne(newSubmission);
        
                if (result.insertedId) {
                    res.status(200).send(result);
                } else {
                    res.status(400).send({ message: 'Failed to add new submission' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to add new submission' });
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