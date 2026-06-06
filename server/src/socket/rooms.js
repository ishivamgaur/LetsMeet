class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId → { user1, user2, createdAt }
    this.userToRoom = new Map(); // socketId → roomId
  }

  createRoom(roomId, user1, user2) {
    this.rooms.set(roomId, { user1, user2, createdAt: Date.now() });
    this.userToRoom.set(user1, roomId);
    this.userToRoom.set(user2, roomId);
  }

  getRoomByUser(socketId) {
    const roomId = this.userToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return { roomId, ...room };
  }

  getPartner(socketId) {
    const room = this.getRoomByUser(socketId);
    if (!room) return null;
    return room.user1 === socketId ? room.user2 : room.user1;
  }

  removeRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.userToRoom.delete(room.user1);
      this.userToRoom.delete(room.user2);
      this.rooms.delete(roomId);
    }
  }

  removeUserFromRoom(socketId) {
    const roomId = this.userToRoom.get(socketId);
    if (roomId) this.removeRoom(roomId);
  }

  getActiveRoomCount() {
    return this.rooms.size;
  }
}

export default RoomManager;
