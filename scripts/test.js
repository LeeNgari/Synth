import mongoose from 'mongoose';

const uri = "mongodb+srv://leengari76:4nGrnkJAznFGGBfN@cluster0.mwhdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Your actual URI

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Connected");
        console.log("ReadyState:", mongoose.connection.readyState); // Should be 1
        process.exit();
    })
    .catch((err) => {
        console.error("❌ Failed:", err.message);
        process.exit(1);
    });
