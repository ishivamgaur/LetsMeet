import crypto from "node:crypto";

class MatchmakingQueue {
  constructor() {
    this.waitingUsers = new Map(); // socketId → { mode, interests, joinedAt, name, gender, country }
  }

  addToQueue(socketId, { mode = "video", interests = [], name = "Stranger", gender = "Any", country = "Any Country" }) {
    // Try to find a match before adding to queue
    const match = this.findMatch(socketId, { mode, interests });

    if (match) {
      const roomId = crypto.randomUUID();
      return { 
        matched: true, 
        partnerId: match.socketId, 
        roomId,
        partnerInfo: { name: match.name, gender: match.gender, country: match.country } 
      };
    }

    // No match — sit in queue
    this.waitingUsers.set(socketId, { mode, interests, name, gender, country, joinedAt: Date.now() });
    return { matched: false };
  }

  findMatch(socketId, { mode, interests }) {
    // Pass 1: match by shared interests
    if (interests.length > 0) {
      for (const [candidateId, candidate] of this.waitingUsers) {
        if (candidateId === socketId) continue;
        if (candidate.mode !== mode) continue;

        const hasCommon = candidate.interests.some((tag) =>
          interests.includes(tag)
        );
        if (hasCommon) {
          this.waitingUsers.delete(candidateId);
          return { socketId: candidateId, ...candidate };
        }
      }
    }

    // Pass 2: match anyone with same mode (FIFO order via Map insertion)
    for (const [candidateId, candidate] of this.waitingUsers) {
      if (candidateId === socketId) continue;
      if (candidate.mode !== mode) continue;

      this.waitingUsers.delete(candidateId);
      return { socketId: candidateId, ...candidate };
    }

    return null;
  }

  removeFromQueue(socketId) {
    this.waitingUsers.delete(socketId);
  }

  getQueueSize(mode) {
    let count = 0;
    for (const [, user] of this.waitingUsers) {
      if (!mode || user.mode === mode) count++;
    }
    return count;
  }

  isInQueue(socketId) {
    return this.waitingUsers.has(socketId);
  }
}

export default MatchmakingQueue;
