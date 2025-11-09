const mongoose = require("mongoose");
// mongoose ek ODM (Object Data Modeling) library hai — ye MongoDB ke saath kaam karna easy banata hai.

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to DB");
  });
  // Ye command(process.env.MONGO_URI) .env file me defined MONGO_URI variable padhta hai aur MongoDB se connection
  //establish karta hai.
}

module.exports = connectToDB;

/*hamne db ko backend se connect krne ke liyw .. npm i dotenv ko terminal mai chalaya then .env file banayi
and usme ek variable banakr ye store karaya(mongodb://0.0.0.0/men-drive) issey kya hua hamara connection secure hua ek
file mai kionki .env file github par nahi jaati so users ke sath share nhi hota, how you connected db.
*/
