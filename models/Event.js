const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  eligibility: {
    type: String,
    default: "NA",
  },
  mode: {
    type: String,
    default: "NA",
  },
  registrationDate: {
    type: Date,
    default: new Date(0000, 00, 00),
  },
  testDate: {
    type: Date,
    default: new Date(0000, 00, 00),
  },
});

const eventModel = mongoose.model("Event", eventSchema);

module.exports = eventModel;
