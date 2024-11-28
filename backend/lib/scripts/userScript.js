const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const giveDB = async () =>{
    const db = await open({
        filename: './lib/db/ride-share.db',
        driver: sqlite3.Database,
    });
    return db;
}

const createDB = async () =>{
    const db = await giveDB();

    await db.exec(
        'CREATE TABLE IF NOT EXISTS USERS(ID INTEGER PRIMARY KEY AUTOINCREMENT, USERNAME TEXT, TYPE TEXT, LNG FLOAT, LAT FLOAT, DROP_LNG FLOAT, DROP_LAT FLOAT, EMAIL TEXT,PHNO INTEGER)'
    );

};

const userExists = async (email) => {
    const db = await giveDB();
    const user = await db.get(`SELECT * FROM USERS WHERE EMAIL = ?`, [email]);
    return !!user;
};


const addUser = async (username, email, phno) => {
    const db = await giveDB();
    try {
        const result = await db.run(
            `INSERT INTO USERS (USERNAME, EMAIL, PHNO) VALUES (?, ?, ?)`,
            [username, email, phno]
        );
        console.log('Insertion successful:', result);
    } catch (error) {
        console.error('Error inserting user:', error.message);
    }
};

const setUserType = async (email, type) =>{
    const db = await giveDB();
    try {
        await db.run(`UPDATE USERS SET TYPE = ? WHERE EMAIL = ?`, type, email);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const setLocation = async(email, lng, lat)=>{
    const db = await giveDB();
    try{
        await db.run(`UPDATE USERS SET LAT = ?, LNG = ? WHERE EMAIL = ?`, lat, lng, email);
    }catch(err){
        console.log('Error: '+ err.message);
    }
}

const setDropoffLocation = async(email, lng, lat) =>{
    const db = await giveDB();
    try{
        await db.run(`UPDATE USERS SET DROP_LNG = ? , DROP_LAT = ?  WHERE EMAIL = ?`,lng, lat, email);
    }catch(err){
        console.log('Error:', err);
    }
}

const getPassengerCoords = async () => {
    const db = await giveDB();
    try {
        const passengers = await db.all(`SELECT LNG, LAT FROM USERS WHERE TYPE = 'passenger'`);
        return passengers;
    } catch (err) {
        console.error('Error fetching passenger coordinates:', err.message);
        return [];
    }
};

const getUserCoords = async (email) => {
    const db = await giveDB();
    try {
        const coords = await db.get(`SELECT LNG, LAT FROM USERS WHERE EMAIL = ?`, [email]);
        if (!coords) {
            throw new Error(`No user found with email: ${email}`);
        }
        return coords;
    } catch (err) {
        console.error('Error fetching user coordinates:', err.message);
        return null;
    }
};


module.exports = {getUserCoords, getPassengerCoords, createDB, userExists, addUser, setUserType, setLocation, setDropoffLocation};