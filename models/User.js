// Sample User model
// This can be expanded later with actual database integration

class User {
  constructor(id, name, email, createdAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt || new Date();
  }

  static getAll() {
    // This would typically query a database
    // For now, return mock data
    return [
      new User(1, 'John Doe', 'john@example.com'),
      new User(2, 'Jane Smith', 'jane@example.com'),
    ];
  }

  static findById(id) {
    const users = this.getAll();
    return users.find(user => user.id === parseInt(id));
  }

  static create(userData) {
    // This would typically save to a database
    const newUser = new User(
      Date.now(), // Simple ID generation
      userData.name,
      userData.email
    );
    return newUser;
  }
}

module.exports = User; 