import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * NOTE: Ensure MONGODB_URI is correctly set in your .env file
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Options can be added here if needed for older mongoose versions
        });

        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        // Exit process if DB connection fails
        process.exit(1);
    }
};

export default connectDB;
