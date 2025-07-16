import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Create a single supabase client for interacting with your database
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

/**
 * Database utility functions for connection management
 */

/**
 * Test the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
	try {
		const { data, error } = await supabase.from('inventory_items').select('count', { count: 'exact', head: true });
		if (error) {
			console.error('Database connection test failed:', error);
			return false;
		}
		return true;
	} catch (err) {
		console.error('Database connection test failed:', err);
		return false;
	}
}

/**
 * Get database connection status
 * @returns {Promise<Object>} Connection status information
 */
export async function getConnectionStatus() {
	try {
		const isConnected = await testConnection();
		return {
			connected: isConnected,
			timestamp: new Date().toISOString(),
			url: PUBLIC_SUPABASE_URL ? 'configured' : 'not configured'
		};
	} catch (err) {
		return {
			connected: false,
			timestamp: new Date().toISOString(),
			error: err.message
		};
	}
}

/**
 * Initialize database connection with error handling
 * @returns {Promise<Object>} Initialization result
 */
export async function initializeDatabase() {
	try {
		if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
			throw new Error('Supabase configuration missing. Please check your environment variables.');
		}

		const status = await getConnectionStatus();
		
		if (!status.connected) {
			throw new Error('Failed to connect to Supabase database');
		}

		return {
			success: true,
			message: 'Database connection initialized successfully',
			status
		};
	} catch (err) {
		return {
			success: false,
			message: err.message,
			error: err
		};
	}
}