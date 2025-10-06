const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    require: [true, "Please provide a valid email address"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      " Please provide a valid email address",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, " Please provide a pasword"],
    minlength: 6,
  },
});

// create user schema functions
// save password with hash
UserSchema.pre('save', async function() {
  /* hashes are a collection of random bytes -> gen salt
     hash passwords!!*/
  const salt = await bcrypt.genSalt(10); //the bigger the number, the more secure & random; takes more memory
  this.password = await bcrypt.hash(this.password, salt);
});

// compare incoming password to one saved in database
UserSchema.methods.comparePassword = async function (candidatePassword) {
   const isMatch = await bcrypt.compare(candidatePassword, this.password);
   return isMatch;
}
module.exports = mongoose.model('User', UserSchema);