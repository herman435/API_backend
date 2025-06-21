import { sequelize } from '../config/database';
import { User } from '../models/User';
import { Hotel } from '../models/Hotel';
import { Favorite } from '../models/Favorite';
import { Booking } from '../models/Booking';
import bcrypt from 'bcrypt';

async function initDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database tables recreated');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const operator = await User.create({
      email: 'operator@wanderlust.com',
      password: hashedPassword,
      role: 'operator'
    });
    console.log('Test operator account created');

    const user = await User.create({
      email: 'user@wanderlust.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('Test user account created');


    const hotels = await Hotel.bulkCreate([
      {
        name: 'The Ritz-Carlton Beijing',
        address: '83 Jianguomen Outer St, Chaoyang, Beijing',
        description: 'Located in the heart of Beijing CBD, adjacent to the World Trade Center. A luxury five-star hotel with modern rooms and suites, equipped with advanced facilities and services.',
        price: 1288,
        availableRooms: 15,
        operatorId: operator.id
      },
      {
        name: 'Waldorf Astoria Shanghai on the Bund',
        address: 'No.2 Zhongshan Dong Yi Road, Huangpu, Shanghai',
        description: 'Situated among the historic buildings of the Bund, with magnificent views of the Huangpu River and Lujiazui skyline. The hotel blends classical and modern design.',
        price: 1688,
        availableRooms: 8,
        operatorId: operator.id
      },
      {
        name: 'White Swan Hotel Guangzhou',
        address: 'No.1 Shamian South St, Liwan, Guangzhou',
        description: 'Located on picturesque Shamian Island, the first five-star hotel in China. Beautiful environment and top-notch service, ideal for business and leisure.',
        price: 988,
        availableRooms: 22,
        operatorId: operator.id
      },
      {
        name: 'Shangri-La Hotel Shenzhen Futian',
        address: '4088 Yitian Rd, Futian, Shenzhen',
        description: 'Located in the center of Futian, Shenzhen, next to Shopping Park Metro Station. Offers luxurious accommodation and excellent service for business and leisure travelers.',
        price: 1188,
        availableRooms: 12,
        operatorId: operator.id
      },
      {
        name: 'Banyan Tree Hangzhou',
        address: '21 Zijin Harbor Rd, Xihu, Hangzhou',
        description: 'Nestled in Xixi Wetland Park, tranquil and scenic. The hotel features Jiangnan garden-style design and offers a unique resort experience.',
        price: 1588,
        availableRooms: 6,
        operatorId: operator.id
      },
      {
        name: 'The Temple House Chengdu',
        address: 'No.8 Zhongshamao St, Jinjiang, Chengdu',
        description: 'Located in downtown Chengdu, next to Taikoo Li shopping area. The hotel combines traditional Sichuan architecture with modern design for a unique stay.',
        price: 1388,
        availableRooms: 18,
        operatorId: operator.id
      },
      {
        name: "The Westin Xi'an",
        address: "No.66 Ci'en Rd, Yanta, Xi'an",
        description: "Near the Big Wild Goose Pagoda and Datang Everbright City. Prime location for exploring the ancient capital of Xi'an.",
        price: 1088,
        availableRooms: 25,
        operatorId: operator.id
      },
      {
        name: 'Seaview Garden Hotel Qingdao',
        address: 'No.76 Hong Kong Middle Rd, Shinan, Qingdao',
        description: 'Located on the Qingdao coast with beautiful sea views. Comfortable accommodation and quality service, ideal for seaside vacations.',
        price: 888,
        availableRooms: 30,
        operatorId: operator.id
      },
      {
        name: 'Seaview Resort Xiamen',
        address: 'No.3999 Huandao South Rd, Siming, Xiamen',
        description: 'Located on Huandao Road, next to Baicheng Beach. Beautiful environment and attentive service, perfect for a beach holiday.',
        price: 1288,
        availableRooms: 14,
        operatorId: operator.id
      },
      {
        name: 'InterContinental Sanya Haitang Bay Resort',
        address: 'No.128 Haitang North Rd, Haitang, Sanya',
        description: 'Located in Haitang Bay with a private beach and tropical gardens. Offers a luxurious resort experience for enjoying the sun and sea.',
        price: 1888,
        availableRooms: 10,
        operatorId: operator.id
      }
    ]);
    console.log(`${hotels.length} mock hotels created`);

    await Favorite.bulkCreate([
      { userId: user.id, hotelId: hotels[0].id },
      { userId: user.id, hotelId: hotels[2].id },
      { userId: user.id, hotelId: hotels[4].id }
    ]);
    console.log('Test favorites created');

    await Booking.bulkCreate([
      {
        userId: user.id,
        hotelId: hotels[1].id,
        checkInDate: new Date('2024-12-25'),
        checkOutDate: new Date('2024-12-27'),
        guestCount: 2,
        totalPrice: 3376,
        status: 'confirmed',
        specialRequests: 'High floor room needed'
      },
      {
        userId: user.id,
        hotelId: hotels[3].id,
        checkInDate: new Date('2024-12-30'),
        checkOutDate: new Date('2025-01-02'),
        guestCount: 3,
        totalPrice: 3564,
        status: 'pending',
        specialRequests: 'Connecting rooms required'
      }
    ]);
    console.log('Test bookings created');

    console.log('Database initialization complete!');
    console.log('\nTest account info:');
    console.log('Operator: operator@wanderlust.com / password123');
    console.log('User: user@wanderlust.com / password123');

  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  initDatabase();
}

export default initDatabase; 