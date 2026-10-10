const mongoose = require("mongoose");                    // mongo library
const bcrypt = require("bcryptjs");                      // password hashing

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: [true, "Email is required"],           // [condition, error message]
        unique: true,                                    // no duplicate emails
        trim: true,                                      // remove extra spaces
        lowercase: true,                                 // store as lowercase
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid email address"                      // regex validation
        ]
    },

    name: {
        type: String,
        required: [true, "Name is required"]
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        select: false                                    // never returned by default
        // note: minlength check belongs in the controller
        // (here it would check the hash, not the real password)
    },

    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,                                 // can't be changed after creation
        select: false                                    // hidden by default
    }

}, {
    timestamps: true                                     // adds createdAt + updatedAt
});

// hash password before saving (only if changed)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;                                          // password not changed - skip
    }
    const hash = await bcrypt.hash(this.password, 10);   // hash with 10 rounds
    this.password = hash;
});

// helper method to compare plain password with hash
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;