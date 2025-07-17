const { testDatabase, dbUtils, config } = require('./config/database');

async function runDatabaseTests() {
  console.log('🚀 Starting SQLite Database Tests\n');
  
  // Display database info
  console.log('📊 Database Configuration:');
  console.log(`   Type: ${config.database.type}`);
  console.log(`   File: ${config.database.filename}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

  // Run comprehensive database tests
  const testResults = await testDatabase();
  
  if (testResults) {
    console.log('\n✅ All database tests completed successfully!');
    
    // Additional tests for specific functionality
    console.log('\n🧪 Running additional functionality tests...');
    
    try {
      // Test user creation and retrieval
      const newUser = await dbUtils.run(`
        INSERT INTO users (name, email, password) 
        VALUES (?, ?, ?)
      `, ['John Doe', 'john@example.com', 'password123']);
      
      console.log('✅ User creation test passed', newUser);
      
      // Test user retrieval
      const user = await dbUtils.get(`
        SELECT id, name, email, created_at FROM users WHERE email = ?
      `, ['john@example.com']);
      
      console.log('✅ User retrieval test passed');
      console.log(`   Retrieved user: ${user.name} (${user.email})`);
      
      // Test session creation
      const session = await dbUtils.run(`
        INSERT INTO sessions (user_id, token, expires_at) 
        VALUES (?, ?, ?)
      `, [user.id, 'test-token-123', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()]);
      
      console.log('✅ Session creation test passed');
      
      // Test session retrieval
      const sessionData = await dbUtils.get(`
        SELECT s.*, u.name, u.email 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.token = ?
      `, ['test-token-123']);
      
      console.log('✅ Session retrieval test passed');
      console.log(`   Session for user: ${sessionData.name}`);
      
      // Test tool creation
      const tool = await dbUtils.run(`
        INSERT INTO tools (name, description, owner_id) 
        VALUES (?, ?, ?)
      `, ['Hammer', 'A sturdy hammer for construction work', user.id]);
      
      console.log('✅ Tool creation test passed');
      
      // Test tool retrieval
      const toolData = await dbUtils.get(`
        SELECT t.*, u.name as owner_name 
        FROM tools t 
        JOIN users u ON t.owner_id = u.id 
        WHERE t.id = ?
      `, [tool.lastID]);
      
      console.log('✅ Tool retrieval test passed');
      console.log(`   Tool: ${toolData.name} (owned by ${toolData.owner_name})`);
      
      // Test borrowing creation
      const borrowing = await dbUtils.run(`
        INSERT INTO borrowings (tool_id, borrower_id, due_date) 
        VALUES (?, ?, ?)
      `, [tool.lastID, user.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()]);
      
      console.log('✅ Borrowing creation test passed');
      
      // Test borrowing retrieval
      const borrowingData = await dbUtils.get(`
        SELECT b.*, t.name as tool_name, u.name as borrower_name
        FROM borrowings b 
        JOIN tools t ON b.tool_id = t.id 
        JOIN users u ON b.borrower_id = u.id 
        WHERE b.id = ?
      `, [borrowing.lastID]);
      
      console.log('✅ Borrowing retrieval test passed');
      console.log(`   Borrowing: ${borrowingData.tool_name} borrowed by ${borrowingData.borrower_name}`);
      
      // Clean up test data
      await dbUtils.run('DELETE FROM borrowings WHERE id = ?', [borrowing.lastID]);
      await dbUtils.run('DELETE FROM tools WHERE id = ?', [tool.lastID]);
      await dbUtils.run('DELETE FROM sessions WHERE token = ?', ['test-token-123']);
      await dbUtils.run('DELETE FROM users WHERE email = ?', ['john@example.com']);
      
      console.log('✅ Test data cleanup completed');
      
      console.log('\n🎉 All functionality tests passed!');
      console.log('📁 Database file created at: data/tooling_app.db');
      
    } catch (error) {
      console.error('❌ Functionality test failed:', error.message);
    }
    
  } else {
    console.log('\n❌ Database tests failed!');
    process.exit(1);
  }
}

// Run the tests
runDatabaseTests().catch(console.error); 