import mongoose from 'mongoose';
import dns from 'dns';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alexvest_db_user:CtjaDgKqTnC724ly@cluster1.7bvwja7.mongodb.net/green_shift_db?retryWrites=true&w=majority&appName=Cluster1';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:]*@/, ':***@')); // Hide password

// Try different DNS resolvers
console.log('\n1. Testing DNS resolution...');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS
dns.resolveSrv('_mongodb._tcp.cluster1.7bvwja7.mongodb.net', (err, addresses) => {
    if (err) {
        console.log('✗ DNS SRV lookup failed:', err.message);
        console.log('Trying connection anyway with different settings...\n');
    } else {
        console.log('✓ DNS SRV lookup succeeded');
        console.log('Found servers:', addresses.map(a => `${a.name}:${a.port}`).join(', '));
    }

    console.log('\n2. Attempting MongoDB connection...');
    mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        family: 4, // Force IPv4
        directConnection: false,
    })
        .then(() => {
            console.log('✓ Successfully connected to MongoDB!');
            console.log('✓ Database is accessible');
            mongoose.disconnect();
            process.exit(0);
        })
        .catch(err => {
            console.log('\n✗ Connection failed');
            console.log('Error:', err.message);
            console.log('\n⚠️  This looks like a local network/firewall issue.');
            console.log('\nTroubleshooting steps:');
            console.log('1. Check if antivirus/firewall is blocking Node.js');
            console.log('2. Try disabling VPN if you have one');
            console.log('3. Test connection with MongoDB Compass');
            console.log('4. Check if corporate network blocks MongoDB (port 27017)');
            process.exit(1);
        });
});
