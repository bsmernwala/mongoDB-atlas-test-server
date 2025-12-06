// // // api/employees.js
// // require('dotenv').config();
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const serverless = require('serverless-http');
// // const cors = require('cors');

// // const Employee = require('../models/Employee'); // keep your existing model file

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // // DB connect helper (doesn't block server start)
// // const MONGODB_URL = process.env.MONGODB_URL || '';
// // let connected = false;
// // async function connectToDB() {
// //   if (connected || mongoose.connection.readyState === 1) return;
// //   if (!MONGODB_URL) {
// //     console.warn('MONGODB_URL not set; DB routes will fail until set.');
// //     return;
// //   }
// //   try {
// //     await mongoose.connect(MONGODB_URL, {
// //       // modern mongoose doesn't require these, but safe to include
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     });
// //     connected = true;
// //     console.log('MongoDB connected (employees function).');
// //   } catch (err) {
// //     console.error('MongoDB connect failed (employees function):', err.message || err);
// //     // keep function up; errors will show in logs when route used
// //   }
// // }

// // // Immediately try to connect (non-blocking)
// // connectToDB().catch(() => {});

// // // ROUTES (these are relative to /api/employees)

// // // GET /api/employees  -> list all
// // app.get('/', async (req, res) => {
// //   try {
// //     if (!connected) await connectToDB();
// //     const list = await Employee.find().sort({ ecode: 1 });
// //     res.json(list);
// //   } catch (err) {
// //     console.error('GET /api/employees error:', err);
// //     res.status(500).json({ error: 'Server error', message: err.message });
// //   }
// // });

// // // POST /api/employees -> create
// // app.post('/', async (req, res) => {
// //   try {
// //     if (!connected) await connectToDB();
// //     const { ecode, ename, esal } = req.body;
// //     if (!ecode || !ename || esal == null) {
// //       return res.status(400).json({ error: 'ecode, ename and esal are required' });
// //     }
// //     const emp = new Employee({ ecode, ename, esal });
// //     await emp.save();
// //     return res.status(201).json(emp);
// //   } catch (err) {
// //     if (err.code === 11000) return res.status(409).json({ error: 'ecode must be unique' });
// //     console.error('POST /api/employees error:', err);
// //     return res.status(500).json({ error: 'Server error', message: err.message });
// //   }
// // });

// // // GET /api/employees/:ecode -> get one
// // app.get('/:ecode', async (req, res) => {
// //   try {
// //     if (!connected) await connectToDB();
// //     const emp = await Employee.findOne({ ecode: req.params.ecode });
// //     if (!emp) return res.status(404).json({ error: 'Not found' });
// //     res.json(emp);
// //   } catch (err) {
// //     console.error('GET /api/employees/:ecode error:', err);
// //     res.status(500).json({ error: 'Server error', message: err.message });
// //   }
// // });

// // // DELETE /api/employees/:ecode -> delete
// // app.delete('/:ecode', async (req, res) => {
// //   try {
// //     if (!connected) await connectToDB();
// //     const r = await Employee.findOneAndDelete({ ecode: req.params.ecode });
// //     if (!r) return res.status(404).json({ error: 'Not found' });
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('DELETE /api/employees/:ecode error:', err);
// //     res.status(500).json({ error: 'Server error', message: err.message });
// //   }
// // });

// // // export handler for Vercel
// // module.exports = app;
// // module.exports.handler = serverless(app);


// // api/employees.js
// require('dotenv').config();
// const express = require('express');
// const serverless = require('serverless-http');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const Employee = require('../models/Employee');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const MONGODB_URL = process.env.MONGODB_URL || '';
// let dbConnected = false;

// async function connectToDB() {
//   if (dbConnected || mongoose.connection.readyState === 1) return;
//   if (!MONGODB_URL) {
//     console.warn('MONGODB_URL not set in env — DB routes will fail.');
//     return;
//   }
//   try {
//     await mongoose.connect(MONGODB_URL);
//     dbConnected = true;
//     console.log('MongoDB connected (deployed function).');
//   } catch (err) {
//     console.error('Mongo connect error (deployed function):', err && err.message);
//   }
// }
// connectToDB().catch(()=>{});

// // GET /api/employees
// app.get('/', async (req, res) => {
//   if (!dbConnected) await connectToDB();
//   try {
//     const list = await Employee.find().sort({ ecode: 1 });
//     res.json(list);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error', message: err.message });
//   }
// });

// // POST /api/employees
// app.post('/', async (req, res) => {
//   if (!dbConnected) await connectToDB();
//   try {
//     const { ecode, ename, esal } = req.body;
//     if (!ecode || !ename || esal == null) return res.status(400).json({ error: 'ecode, ename and esal required' });
//     const emp = new Employee({ ecode, ename, esal });
//     await emp.save();
//     res.status(201).json(emp);
//   } catch (err) {
//     if (err.code === 11000) return res.status(409).json({ error: 'ecode must be unique' });
//     console.error(err);
//     res.status(500).json({ error: 'Server error', message: err.message });
//   }
// });

// module.exports = app;
// module.exports.handler = serverless(app);

// api/employees.js
require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');

const Employee = require('../models/Employee'); // ensure this path exists

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URL = "mongodb+srv://bsmernwala_db_user:POOmV6l3ErS0nbBK@cluster0.r2chbyu.mongodb.net/ecommerceDB?authSource=admin&replicaSet=atlas-e299sp-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";//process.env.MONGODB_URL || '';
let dbConnected = false;

async function connectToDB() {
  if (dbConnected || mongoose.connection.readyState === 1) return;
  if (!MONGODB_URL) {
    console.warn('MONGODB_URL not set in env — DB routes will fail.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URL);
    dbConnected = true;
    console.log('MongoDB connected (deployed function).');
  } catch (err) {
    console.error('Mongo connect error (deployed function):', err && err.message);
  }
}

// try to connect in background
connectToDB().catch(()=>{});

app.get('/', async (req, res) => {
  if (!dbConnected) await connectToDB();
  try {
    const list = await Employee.find().sort({ ecode: 1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

app.post('/', async (req, res) => {
  if (!dbConnected) await connectToDB();
  try {
    const { ecode, ename, esal } = req.body;
    if (!ecode || !ename || esal == null) return res.status(400).json({ error: 'ecode, ename and esal required' });
    const emp = new Employee({ ecode, ename, esal });
    await emp.save();
    res.status(201).json(emp);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'ecode must be unique' });
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

