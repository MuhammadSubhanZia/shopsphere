// Demo accounts. The plain passwords below exist only in this seed file:
// the seed script hashes them with bcrypt before anything is stored in MongoDB.
export const seedUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@shopsphere.pk',
    password: 'Admin@123',
    role: 'admin',
    phone: '0300-1000001',
    address: 'ShopSphere HQ, Gulberg III',
    city: 'Lahore',
  },
  {
    id: 2,
    name: 'Ayesha Khan',
    email: 'user@shopsphere.pk',
    password: 'User@1234',
    role: 'customer',
    phone: '0321-1234567',
    address: '12-B, Model Town',
    city: 'Lahore',
  },
  {
    id: 3,
    name: 'Bilal Ahmed',
    email: 'bilal@example.com',
    password: 'User@1234',
    role: 'customer',
    phone: '0333-7654321',
    address: 'Flat 4, Clifton Block 5',
    city: 'Karachi',
  },
  {
    id: 4,
    name: 'Sara Malik',
    email: 'sara@example.com',
    password: 'User@1234',
    role: 'customer',
    phone: '0345-1112233',
    address: 'House 21, F-8/3',
    city: 'Islamabad',
  },
];
