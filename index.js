const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Data storage (in-memory)
const rooms = [];
const bookings = [];

// Helper function to check availability
const isRoomAvailable = (roomId, date, startTime, endTime) => {
  return !bookings.some(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
  );
};

// Endpoints
// 1. Create a Room
app.post('/create-room', (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;

  const room = {
    id: rooms.length + 1,
    roomName,
    seats,
    amenities,
    pricePerHour,
  };

  rooms.push(room);
  res.status(201).json({ message: 'Room created successfully!', room });
});

// 2. Book a Room
app.post('/book-room', (req, res) => {
  const { customerName, roomId, date, startTime, endTime } = req.body;

  // Validate room existence
  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found!' });
  }

  // Check availability
  if (!isRoomAvailable(roomId, date, startTime, endTime)) {
    return res.status(400).json({ message: 'Room is already booked for the selected time.' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    roomId,
    roomName: room.roomName,
    date,
    startTime,
    endTime,
    status: 'Booked',
  };

  bookings.push(booking);
  res.status(201).json({ message: 'Room booked successfully!', booking });
});

// 3. List All Booked Rooms
app.get('/booked-rooms', (req, res) => {
  const bookedRooms = bookings.map((booking) => ({
    roomName: booking.roomName,
    customerName: booking.customerName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
  }));

  res.json({ bookedRooms });
});

// 4. List All Customers with Booking Data
app.get('/customer-bookings', (req, res) => {
  const customerBookings = bookings.map((booking) => ({
    customerName: booking.customerName,
    roomName: booking.roomName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  }));

  res.json({ customerBookings });
});

// 5. Booking Statistics
app.get('/customer-statistics', (req, res) => {
  const statistics = {};

  bookings.forEach((booking) => {
    if (!statistics[booking.customerName]) {
      statistics[booking.customerName] = {
        bookings: [],
        count: 0,
      };
    }

    statistics[booking.customerName].bookings.push(booking);
    statistics[booking.customerName].count += 1;
  });

  res.json({ statistics });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
