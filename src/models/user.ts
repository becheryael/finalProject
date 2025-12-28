const mongoose = require('mongoose');
export {};


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },  
    manager: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value: string) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "Password".');
            }
        }
    },
});


const User = mongoose.model('User', userSchema);

module.exports = User;