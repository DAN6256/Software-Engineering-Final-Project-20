
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // to create/find users
require('dotenv').config();

const AuthService = {
  signUpUser: async ({ email, password, name, role, major, yearGroup }) => {
    const existing = await User.findOne({ where: { Email: email } });
    if (existing) {
      throw new Error('Email already taken');
    }

   
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  
    const newUser = await User.create({
      Name: name,
      Email: email,
      Role: role,
      Password: hashedPassword,
      major,     
      yearGroup 
    });

    return newUser; 
  },


  loginUser: async ({ email, password }) => {
    const user = await User.unscoped().findOne({ where: { Email: email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      throw new Error('Invalid credentials');
    }
    

    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        Role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '60m' } 
    );

    user.Password = undefined;

    return { token, user };
  },

  editUserDetails: async (userID, { name, major, yearGroup }) => {
    const user = await User.unscoped().findByPk(userID);
    if (!user) {
      throw new Error('User not found');
    }

    if (name !== undefined) user.Name = name;
    if (major !== undefined) user.major = major;
    if (yearGroup !== undefined) user.yearGroup = yearGroup;

    await user.save();

    return user; 
  }
};

module.exports = AuthService;
