const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const migrateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const usersCollection = mongoose.connection.collection("users");

        const users = await usersCollection.find({}).toArray();

        for (const user of users) {
            let branchIds = [];

            if (
                user.role !== "admin" &&
                user.branchId
            ) {
                branchIds = [user.branchId];
            }

            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        branchIds
                    },
                    $unset: {
                        branchId: ""
                    }
                }
            );

            console.log(
                `Migrated: ${user.email} (${user.role})`
            );
        }

        console.log("User migration completed");

        process.exit(0);
    } catch (error) {
        console.error(
            "User migration failed:",
            error.message
        );

        process.exit(1);
    }
};

migrateUsers();