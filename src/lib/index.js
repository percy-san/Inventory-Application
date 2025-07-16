// place files you want to import through the `$lib` alias in this folder.

// Export Supabase client and utilities
export { supabase, testConnection, getConnectionStatus, initializeDatabase } from './supabase.js';

// Export database service functions
export {
	getAllInventoryItems,
	getAllCategories,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	getInventoryItemById,
	searchInventoryItems,
	getInventoryItemsByCategory,
	getLowStockItems
} from './database.js';

// Export types and validation functions
export {
	validateInventoryItem,
	validateCategory,
	transformInventoryItem,
	isLowStock
} from './types.js';
