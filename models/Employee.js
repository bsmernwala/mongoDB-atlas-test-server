// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  ecode: { type: String, required: true, unique: true, index: true },
  ename: { type: String, required: true },
  esal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
