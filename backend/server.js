const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const { createDB, userExists, addUser, setUserType, setLocation, setDropoffLocation, getPassengerCoords, getUserCoords } = require('./lib/scripts/userScript');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors:{
        origin:'http://localhost:3000',
        methods:['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    }
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
}));

//api routes
app.get('/api/', async(req, res) =>{
    res.send('Hello world');
})

//socket io stuff
io.on('connection', (socket) =>{

    console.log(socket.id + ' has connected the io server');

    socket.on('userConnected', async (user) => {
        console.log('User received:', user);
        await createDB();
        if (!(await userExists(user.primaryEmailAddress.emailAddress))) {
            await addUser(
                user.fullName,
                user.primaryEmailAddress.emailAddress,
                user.primaryPhoneNumber.phoneNumber
            );
            console.log(`User ${user.fullName} added to the database.`);
        } else {
            console.log(`User ${user.fullName} already exists.`);
        }
    });
    
    socket.on('setUserType', async (user , type) =>{
        console.log('User received:', user);
        if(await userExists(user.primaryEmailAddress.emailAddress)){
            await setUserType(user.primaryEmailAddress.emailAddress, type);
        }else{
            console.log('User type couldnt be update, no entry in database')
        }
    })

    socket.on('setStartingLocation', async (user, lng, lat) =>{
        console.log('set location caught on backend');
        if(await userExists(user.primaryEmailAddress.emailAddress)){
            await setLocation(user.primaryEmailAddress.emailAddress, lng, lat);
        }else{
            console.log('User Location couldnt be update, no entry in database')
        }
    })

    socket.on('setDropoffLocation', async (user, lng, lat)=>{
        console.log('dropp of console log');
        if(await userExists(user.primaryEmailAddress.emailAddress)){
            await setDropoffLocation(user.primaryEmailAddress.emailAddress, lng, lat);
        }else{
            console.log('User Location couldnt be update, no entry in database');
        }
    })

    socket.on('searchPassangers', async(user)=>{
        console.log('searchPassanger backend log');
        if(await userExists(user.primaryEmailAddress.emailAddress)){
            const passengers = await getPassengerCoords();
            const userCoords = await getUserCoords(user.primaryEmailAddress.emailAddress);
            const nearbyPassangers = passengers.filter(passenger =>{
                const distance = calculateDistance(userCoords.lat, userCoords.lng, passenger.LAT, passenger.LNG);
                return distance <=radius;
            });
            io.emit('updatePassangerList', nearbyPassangers);
        }
    })

})

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const PORT = 5000;
server.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})