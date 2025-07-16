// place files you want to import through the `$lib` alias in this folder.

// Export Supabase client and utilities
export { supabase, testConnection, getConnectionStatus, initializeDatabase } from './supabase.js';

// Export database service functions
export {
	// Core CRUD operations
	getAllInventoryItems,
	getInventoryItemById,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	
	// Search and filtering
	searchAndFilterInventoryItems,
	searchInventoryItems,
	getInventoryItemsByCategory,
	getLowStockItems,
	
	// Category operations
	getAllCategories,
	createCategory,
	
	// Real-time subscriptions
	subscribeToInventoryItems,
	subscribeToCategories,
	
	// Batch operations
	createMultipleInventoryItems,
	updateMultipleInventoryItems,
	
	// Utility functions
	getInventoryStatistics
} from './database.js';

// Export types and validation functions
export {
	// Validation functions
	validateInventoryItem,
	validateCategory,
	
	// Data transformation utilities
	transformInventoryItem,
	transformFormToInventoryItem,
	createNewInventoryItem,
	
	// Utility functions
	isLowStock,
	filterInventoryItems,
	sortInventoryItems
} from './types.js';
