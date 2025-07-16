/**
 * Test script for database connection and basic operations
 * Run this after setting up your Supabase credentials
 */

import { testConnection, getConnectionStatus, initializeDatabase } from './supabase.js';
import { getAllCategories, getAllInventoryItems } from './database.js';

/**
 * Run basic connection tests
 */
export async function runConnectionTests() {
	console.log('🔍 Testing Supabase connection...');
	
	try {
		// Test basic connection
		const isConnected = await testConnection();
		console.log('✅ Connection test:', isConnected ? 'PASSED' : 'FAILED');
		
		// Get detailed status
		const status = await getConnectionStatus();
		console.log('📊 Connection status:', status);
		
		// Initialize database
		const initResult = await initializeDatabase();
		console.log('🚀 Database initialization:', initResult);
		
		// Test basic queries
		console.log('📋 Testing basic queries...');
		
		const categoriesResult = await getAllCategories();
		if (categoriesResult.error) {
			console.log('❌ Categories query failed:', categoriesResult.error.message);
		} else {
			console.log('✅ Categories query successful:', categoriesResult.data?.length || 0, 'categories found');
		}
		
		const itemsResult = await getAllInventoryItems();
		if (itemsResult.error) {
			console.log('❌ Items query failed:', itemsResult.error.message);
		} else {
			console.log('✅ Items query successful:', itemsResult.data?.length || 0, 'items found');
		}
		
		console.log('🎉 Connection tests completed!');
		
	} catch (error) {
		console.error('💥 Connection test failed:', error);
	}
}

// Export for use in other files
export default runConnectionTests;