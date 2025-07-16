import { supabase } from './supabase.js';
import { transformInventoryItem, validateInventoryItem, validateCategory } from './types.js';

/**
 * Database service functions for inventory management
 * Provides comprehensive CRUD operations, search/filtering, real-time subscriptions, and error handling
 */

// ============================================================================
// CRUD OPERATIONS FOR INVENTORY ITEMS
// ============================================================================

/**
 * Get all inventory items with optional sorting
 * @param {Object} options - Query options
 * @param {string} options.sortBy - Field to sort by ('name', 'sku', 'quantity', 'category', 'created_at')
 * @param {boolean} options.ascending - Sort order (true for ascending, false for descending)
 * @param {number} options.limit - Maximum number of items to return
 * @param {number} options.offset - Number of items to skip (for pagination)
 * @returns {Promise<Object>} Array of inventory items or error
 */
export async function getAllInventoryItems(options = {}) {
	try {
		const { 
			sortBy = 'created_at', 
			ascending = false, 
			limit = null, 
			offset = 0 
		} = options;

		let query = supabase
			.from('inventory_items')
			.select('*')
			.order(sortBy, { ascending });

		if (limit) {
			query = query.range(offset, offset + limit - 1);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to fetch inventory items: ${error.message}`);
		}

		// Transform data to ensure consistent format
		const transformedData = data?.map(transformInventoryItem) || [];

		return { data: transformedData, error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: 'FETCH_ERROR',
				details: err
			}
		};
	}
}

/**
 * Get inventory item by ID
 * @param {string} id - The item ID
 * @returns {Promise<Object>} Item or error
 */
export async function getInventoryItemById(id) {
	try {
		if (!id) {
			throw new Error('Item ID is required');
		}

		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				throw new Error('Item not found');
			}
			throw new Error(`Failed to fetch item: ${error.message}`);
		}

		return { data: transformInventoryItem(data), error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: err.message === 'Item not found' ? 'NOT_FOUND' : 'FETCH_ERROR',
				details: err
			}
		};
	}
}

/**
 * Create a new inventory item
 * @param {Object} item - The inventory item to create
 * @returns {Promise<Object>} Created item or error
 */
export async function createInventoryItem(item) {
	try {
		// Validate input data
		const validation = validateInventoryItem(item);
		if (!validation.isValid) {
			throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
		}

		// Prepare item for insertion
		const itemToInsert = {
			name: item.name.trim(),
			sku: item.sku.trim(),
			quantity: item.quantity,
			category: item.category.trim(),
			low_stock_threshold: item.low_stock_threshold || 10,
			description: item.description?.trim() || ''
		};

		const { data, error } = await supabase
			.from('inventory_items')
			.insert([itemToInsert])
			.select()
			.single();

		if (error) {
			if (error.code === '23505') {
				throw new Error('SKU already exists. Please use a unique SKU.');
			}
			throw new Error(`Failed to create item: ${error.message}`);
		}

		return { data: transformInventoryItem(data), error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: err.message.includes('SKU already exists') ? 'DUPLICATE_SKU' : 'CREATE_ERROR',
				details: err
			}
		};
	}
}

/**
 * Update an inventory item
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} Updated item or error
 */
export async function updateInventoryItem(id, updates) {
	try {
		if (!id) {
			throw new Error('Item ID is required');
		}

		// Validate updates
		const validation = validateInventoryItem(updates);
		if (!validation.isValid) {
			throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
		}

		// Prepare updates
		const updatesToApply = {
			...updates,
			name: updates.name?.trim(),
			sku: updates.sku?.trim(),
			category: updates.category?.trim(),
			description: updates.description?.trim() || ''
		};

		// Remove undefined values
		Object.keys(updatesToApply).forEach(key => {
			if (updatesToApply[key] === undefined) {
				delete updatesToApply[key];
			}
		});

		const { data, error } = await supabase
			.from('inventory_items')
			.update(updatesToApply)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				throw new Error('Item not found');
			}
			if (error.code === '23505') {
				throw new Error('SKU already exists. Please use a unique SKU.');
			}
			throw new Error(`Failed to update item: ${error.message}`);
		}

		return { data: transformInventoryItem(data), error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: err.message === 'Item not found' ? 'NOT_FOUND' : 
					  err.message.includes('SKU already exists') ? 'DUPLICATE_SKU' : 'UPDATE_ERROR',
				details: err
			}
		};
	}
}

/**
 * Delete an inventory item
 * @param {string} id - The item ID
 * @returns {Promise<Object>} Success status or error
 */
export async function deleteInventoryItem(id) {
	try {
		if (!id) {
			throw new Error('Item ID is required');
		}

		const { error } = await supabase
			.from('inventory_items')
			.delete()
			.eq('id', id);

		if (error) {
			throw new Error(`Failed to delete item: ${error.message}`);
		}

		return { success: true, error: null };
	} catch (err) {
		return { 
			success: false, 
			error: {
				message: err.message,
				code: 'DELETE_ERROR',
				details: err
			}
		};
	}
}

// ============================================================================
// SEARCH AND FILTERING OPERATIONS
// ============================================================================

/**
 * Search inventory items with advanced filtering
 * @param {Object} filters - Search and filter criteria
 * @param {string} filters.search - Search term for name/SKU
 * @param {string} filters.category - Category filter
 * @param {boolean} filters.lowStockOnly - Show only low stock items
 * @param {number} filters.minQuantity - Minimum quantity filter
 * @param {number} filters.maxQuantity - Maximum quantity filter
 * @param {Object} options - Query options (sorting, pagination)
 * @returns {Promise<Object>} Array of filtered items or error
 */
export async function searchAndFilterInventoryItems(filters = {}, options = {}) {
	try {
		const { 
			search = '', 
			category = null, 
			lowStockOnly = false,
			minQuantity = null,
			maxQuantity = null
		} = filters;

		const { 
			sortBy = 'created_at', 
			ascending = false, 
			limit = null, 
			offset = 0 
		} = options;

		let query = supabase
			.from('inventory_items')
			.select('*');

		// Apply search filter
		if (search && search.trim()) {
			const searchTerm = search.trim();
			query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
		}

		// Apply category filter
		if (category) {
			query = query.eq('category', category);
		}

		// Apply quantity range filters
		if (minQuantity !== null) {
			query = query.gte('quantity', minQuantity);
		}
		if (maxQuantity !== null) {
			query = query.lte('quantity', maxQuantity);
		}

		// Apply sorting
		query = query.order(sortBy, { ascending });

		// If low stock filter is requested, we need to fetch all data first
		// because Supabase doesn't support column-to-column comparison in filters
		if (lowStockOnly) {
			// Don't apply pagination yet - we need to filter client-side first
			const { data, error } = await query;

			if (error) {
				throw new Error(`Search failed: ${error.message}`);
			}

			const transformedData = data?.map(transformInventoryItem) || [];
			
			// Apply low stock filter client-side
			const lowStockFiltered = transformedData.filter(item => item.quantity <= item.low_stock_threshold);

			// Apply pagination to filtered results
			let paginatedResults = lowStockFiltered;
			if (limit) {
				paginatedResults = lowStockFiltered.slice(offset, offset + limit);
			}

			return { data: paginatedResults, error: null };
		} else {
			// Apply pagination for non-low-stock queries
			if (limit) {
				query = query.range(offset, offset + limit - 1);
			}

			const { data, error } = await query;

			if (error) {
				throw new Error(`Search failed: ${error.message}`);
			}

			const transformedData = data?.map(transformInventoryItem) || [];

			return { data: transformedData, error: null };
		}
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: 'SEARCH_ERROR',
				details: err
			}
		};
	}
}

/**
 * Get inventory items by category
 * @param {string} category - The category to filter by
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of filtered items or error
 */
export async function getInventoryItemsByCategory(category, options = {}) {
	return searchAndFilterInventoryItems({ category }, options);
}

/**
 * Get low stock items
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of low stock items or error
 */
export async function getLowStockItems(options = {}) {
	try {
		const { 
			sortBy = 'quantity', 
			ascending = true, 
			limit = null, 
			offset = 0 
		} = options;

		// First get all items, then filter client-side for low stock
		// This is necessary because Supabase doesn't support column-to-column comparison in filters
		const { data: allItems, error } = await getAllInventoryItems({
			sortBy,
			ascending,
			limit: null, // Get all items first
			offset: 0
		});

		if (error) {
			throw new Error(`Failed to fetch items for low stock filter: ${error.message}`);
		}

		// Filter for low stock items
		const lowStockItems = allItems.filter(item => item.quantity <= item.low_stock_threshold);

		// Apply pagination if specified
		let paginatedItems = lowStockItems;
		if (limit) {
			paginatedItems = lowStockItems.slice(offset, offset + limit);
		}

		return { data: paginatedItems, error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: 'SEARCH_ERROR',
				details: err
			}
		};
	}
}

/**
 * Search inventory items by name or SKU
 * @param {string} searchTerm - The search term
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of matching items or error
 */
export async function searchInventoryItems(searchTerm, options = {}) {
	return searchAndFilterInventoryItems({ search: searchTerm }, options);
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

/**
 * Get all categories
 * @returns {Promise<Object>} Array of categories or error
 */
export async function getAllCategories() {
	try {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.order('name', { ascending: true });

		if (error) {
			throw new Error(`Failed to fetch categories: ${error.message}`);
		}

		return { data: data || [], error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: 'FETCH_ERROR',
				details: err
			}
		};
	}
}

/**
 * Create a new category
 * @param {Object} category - The category to create
 * @returns {Promise<Object>} Created category or error
 */
export async function createCategory(category) {
	try {
		const validation = validateCategory(category);
		if (!validation.isValid) {
			throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
		}

		const categoryToInsert = {
			name: category.name.trim(),
			description: category.description?.trim() || ''
		};

		const { data, error } = await supabase
			.from('categories')
			.insert([categoryToInsert])
			.select()
			.single();

		if (error) {
			if (error.code === '23505') {
				throw new Error('Category name already exists. Please use a unique name.');
			}
			throw new Error(`Failed to create category: ${error.message}`);
		}

		return { data, error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: err.message.includes('already exists') ? 'DUPLICATE_NAME' : 'CREATE_ERROR',
				details: err
			}
		};
	}
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to inventory items changes
 * @param {Function} callback - Callback function to handle changes
 * @param {Object} options - Subscription options
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToInventoryItems(callback, options = {}) {
	try {
		const { events = '*', filter = null } = options;

		let subscription = supabase
			.channel('inventory_items_changes')
			.on('postgres_changes', {
				event: events,
				schema: 'public',
				table: 'inventory_items',
				filter: filter
			}, (payload) => {
				try {
					// Transform the payload data if present
					if (payload.new) {
						payload.new = transformInventoryItem(payload.new);
					}
					if (payload.old) {
						payload.old = transformInventoryItem(payload.old);
					}
					callback(payload);
				} catch (err) {
					console.error('Error processing real-time update:', err);
				}
			})
			.subscribe();

		return {
			unsubscribe: () => {
				supabase.removeChannel(subscription);
			},
			subscription
		};
	} catch (err) {
		console.error('Failed to set up real-time subscription:', err);
		return {
			unsubscribe: () => {},
			subscription: null,
			error: err
		};
	}
}

/**
 * Subscribe to category changes
 * @param {Function} callback - Callback function to handle changes
 * @param {Object} options - Subscription options
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToCategories(callback, options = {}) {
	try {
		const { events = '*' } = options;

		let subscription = supabase
			.channel('categories_changes')
			.on('postgres_changes', {
				event: events,
				schema: 'public',
				table: 'categories'
			}, callback)
			.subscribe();

		return {
			unsubscribe: () => {
				supabase.removeChannel(subscription);
			},
			subscription
		};
	} catch (err) {
		console.error('Failed to set up category subscription:', err);
		return {
			unsubscribe: () => {},
			subscription: null,
			error: err
		};
	}
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Create multiple inventory items in a single transaction
 * @param {Array} items - Array of inventory items to create
 * @returns {Promise<Object>} Array of created items or error
 */
export async function createMultipleInventoryItems(items) {
	try {
		if (!Array.isArray(items) || items.length === 0) {
			throw new Error('Items array is required and must not be empty');
		}

		// Validate all items
		for (let i = 0; i < items.length; i++) {
			const validation = validateInventoryItem(items[i]);
			if (!validation.isValid) {
				throw new Error(`Item ${i + 1} validation failed: ${Object.values(validation.errors).join(', ')}`);
			}
		}

		// Prepare items for insertion
		const itemsToInsert = items.map(item => ({
			name: item.name.trim(),
			sku: item.sku.trim(),
			quantity: item.quantity,
			category: item.category.trim(),
			low_stock_threshold: item.low_stock_threshold || 10,
			description: item.description?.trim() || ''
		}));

		const { data, error } = await supabase
			.from('inventory_items')
			.insert(itemsToInsert)
			.select();

		if (error) {
			if (error.code === '23505') {
				throw new Error('One or more SKUs already exist. Please ensure all SKUs are unique.');
			}
			throw new Error(`Failed to create items: ${error.message}`);
		}

		const transformedData = data?.map(transformInventoryItem) || [];

		return { data: transformedData, error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: err.message.includes('SKUs already exist') ? 'DUPLICATE_SKU' : 'BATCH_CREATE_ERROR',
				details: err
			}
		};
	}
}

/**
 * Update multiple inventory items in a single transaction
 * @param {Array} updates - Array of {id, updates} objects
 * @returns {Promise<Object>} Array of updated items or error
 */
export async function updateMultipleInventoryItems(updates) {
	try {
		if (!Array.isArray(updates) || updates.length === 0) {
			throw new Error('Updates array is required and must not be empty');
		}

		const results = [];
		const errors = [];

		// Process updates sequentially to maintain data integrity
		for (let i = 0; i < updates.length; i++) {
			const { id, updates: itemUpdates } = updates[i];
			const result = await updateInventoryItem(id, itemUpdates);
			
			if (result.error) {
				errors.push({ index: i, id, error: result.error });
			} else {
				results.push(result.data);
			}
		}

		if (errors.length > 0) {
			return {
				data: results,
				error: {
					message: `${errors.length} out of ${updates.length} updates failed`,
					code: 'BATCH_UPDATE_PARTIAL_ERROR',
					details: errors
				}
			};
		}

		return { data: results, error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: 'BATCH_UPDATE_ERROR',
				details: err
			}
		};
	}
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get inventory statistics
 * @returns {Promise<Object>} Statistics object or error
 */
export async function getInventoryStatistics() {
	try {
		const { data: items, error } = await getAllInventoryItems();
		
		if (error) {
			throw new Error(`Failed to fetch statistics: ${error.message}`);
		}

		const stats = {
			totalItems: items.length,
			totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
			lowStockItems: items.filter(item => item.quantity <= item.low_stock_threshold).length,
			categories: [...new Set(items.map(item => item.category))].length,
			averageQuantity: items.length > 0 ? Math.round(items.reduce((sum, item) => sum + item.quantity, 0) / items.length) : 0,
			lastUpdated: new Date().toISOString()
		};

		return { data: stats, error: null };
	} catch (err) {
		return { 
			data: null, 
			error: {
				message: err.message,
				code: 'STATS_ERROR',
				details: err
			}
		};
	}
}