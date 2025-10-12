const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
    const user = await User.create({...req.body});
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({user: { name: user.name },token});//201 status
}

const login = async (req, res) => {
   const { email, password } = req.body;
   if (!email || !password) {
        throw new BadRequestError('Please provide an email and password');
   };
   const user = await User.findOne({email});
   // compare password
   if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
   } 
   // compare user to password
   const isPasswordCorrect = await user.comparePassword(password);

   if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
   } 
   // create token if login's successful
   const token = user.createJWT();
   res.status(StatusCodes.OK).json({ user: {name: user.name}, token })
};

module.exports = { register, login } 