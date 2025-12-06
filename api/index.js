// // api/index.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const serverless = require('serverless-http');

// const Employee = require('../models/Employee');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Mongoose connection with caching for serverless (prevents creating many connections)
// const MONGODB_URL = process.env.MONGODB_URL;
// if (!MONGODB_URL) {
//   console.error('MONGODB_URL is not set. Set it in .env or in Vercel env vars.');
// }

// let conn = global.mongoose; // cached connection object

// async function connectToDB() {
//   if (conn && conn.readyState === 1) {
//     return conn;
//   }
//   if (!conn) {
//     conn = {};
//     global.mongoose = conn;
//   }

//   // Use mongoose.connect for first time
//   await mongoose.connect(MONGODB_URL, {
//     // options are optional with modern mongoose versions, but set a few safe defaults
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });

//   conn = mongoose.connection;
//   global.mongoose = conn;
//   conn.on('error', (err) => console.error('Mongo connection error:', err));
//   conn.once('open', () => console.log('MongoDB connected'));
//   return conn;
// }

// // Basic healthcheck
// app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// // Create employee
// app.post('/api/employees', async (req, res) => {
//   try {
//     await connectToDB();
//     const { ecode, ename, esal } = req.body;
//     if (!ecode || !ename || esal == null) {
//       return res.status(400).json({ error: 'ecode, ename and esal are required' });
//     }
//     // optional: ensure ecode uniqueness at DB level (see model)
//     const emp = new Employee({ ecode, ename, esal });
//     await emp.save();
//     res.status(201).json(emp);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error', message: err.message });
//   }
// });

// // List all employees
// app.get('/api/employees', async (req, res) => {
//   try {
//     await connectToDB();
//     const list = await Employee.find().sort({ ecode: 1 });
//     res.json(list);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error', message: err.message });
//   }
// });

// // Get employee by ecode
// app.get('/api/employees/:ecode', async (req, res) => {
//   try {
//     await connectToDB();
//     const emp = await Employee.findOne({ ecode: req.params.ecode });
//     if (!emp) return res.status(404).json({ error: 'Not found' });
//     res.json(emp);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error', message: err.message });
//   }
// });

// // Optional: delete by ecode
// app.delete('/api/employees/:ecode', async (req, res) => {
//   try {
//     await connectToDB();

//     const r = await Employee.findOneAndDelete({ ecode: req.params.ecode });
//     if (!r) return res.status(404).json({ error: 'Not found' });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error', message: err.message });
//   }
// });

// // If running locally (node api/index.js), start listening
// if (process.env.NODE_ENV !== 'production' && require.main === module) {
//   const PORT = process.env.PORT || 3000;
//   connectToDB().then(() => {
//     app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
//   });
// }

// // Export handler for Vercel / serverless
// module.exports = app;
// module.exports.handler = serverless(app);


// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Employee = require('../models/Employee');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || '';

if (!MONGODB_URL) {
  console.warn('⚠️  Warning: MONGODB_URL is not set. Requests that need DB will fail, but server will still start.');
}

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, startedAt: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// Create employee
app.post('/api/employees', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      // try connecting if not connected
      await tryConnectDB();
    }
    const { ecode, ename, esal } = req.body;
    if (!ecode || !ename || esal == null) return res.status(400).json({ error: 'ecode, ename and esal are required' });
    const emp = new Employee({ ecode, ename, esal });
    await emp.save();
    res.status(201).json(emp);
  } catch (err) {
    console.error('POST /api/employees error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// List employees
app.get('/api/employees', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      await tryConnectDB();
    }
    const list = await Employee.find().sort({ ecode: 1 });
    res.json(list);
  } catch (err) {
    console.error('GET /api/employees error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Start HTTP server immediately so curl won't be refused
const server = app.listen(PORT, () => {
  console.log(`✅ Express server listening on http://localhost:${PORT}`);
  // attempt DB connect (won't block server start)
  tryConnectDB();
});

// DB connect helper with retry
async function tryConnectDB(retries = 3, delayMs = 2000) {
  if (!MONGODB_URL) {
    console.warn('No MONGODB_URL provided; skipping DB connect.');
    return;
  }
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected.');
    return;
  }
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempting MongoDB connect (try ${i+1}/${retries+1})...`);
      await mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('🟢 MongoDB connected.');
      return;
    } catch (err) {
      console.error(`MongoDB connect failed (try ${i+1}):`, err.message || err);
      if (i < retries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        console.error('All MongoDB connect attempts failed. The server will keep running, but DB routes will error until DB is reachable.');
      }
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received. Closing server.');
  server.close(() => {
    mongoose.disconnect().finally(() => process.exit(0));
  });
});
