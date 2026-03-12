const mongoose = require("mongoose");

const reportLimitSchema = new mongoose.Schema({
userId: String,
reportCount: Number,
resetTime: Number
});

module.exports = mongoose.model("ReportLimit", reportLimitSchema);
