const { MongoClient, ObjectId } = require('mongodb');









const uri = "mongodb+srv://fwa:lozamaxim123@ida.qgq6c9a.mongodb.net/?retryWrites=true&w=majority";



const dbName = 'svid'; 
const collectionName = 'posts';



async function getAllData(s) {
    const client = new MongoClient(uri);
  
    try {
      await client.connect();
  
      const database = client.db(dbName);
      const collection = database.collection(s);
  
  
      const result = await collection.find({}).toArray();
  
  
      return result;
    } catch (error) {
      console.error(error);
      throw error; 
    } finally {
      await client.close();
    }
  }





  

module.exports = getAllData