import { supabase } from './supabase.js';

/**
 * Database service functions for inventory management
 */

/**
 * Get all inventory items
 * @returns {Promise<Object>} Array of inventory items or error
 */
export async function getAllInventoryItems() {
	try {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

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
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

/**
 * Create a new inventory item
 * @param {Object} item - The inventory item to create
 * @returns {Promise<Object>} Created item or error
 */
export async function createInventoryItem(item) {
	try {
		const { data, error } = await supabase
			.from('inventory_items')
			.insert([item])
			.select()
			.single();

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
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
		const { data, error } = await supabase
			.from('inventory_items')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

/**
 * Delete an inventory item
 * @param {string} id - The item ID
 * @returns {Promise<Object>} Success status or error
 */
export async function deleteInventoryItem(id) {
	try {
		const { error } = await supabase
			.from('inventory_items')
			.delete()
			.eq('id', id);

		if (error) {
			throw error;
		}

		return { success: true, error: null };
	} catch (err) {
		return { success: false, error: err };
	}
}

/**
 * Get inventory item by ID
 * @param {string} id - The item ID
 * @returns {Promise<Object>} Item or error
 */
export async function getInventoryItemById(id) {
	try {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

/**
 * Search inventory items by name or SKU
 * @param {string} searchTerm - The search term
 * @returns {Promise<Object>} Array of matching items or error
 */
export async function searchInventoryItems(searchTerm) {
	try {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

/**
 * Filter inventory items by category
 * @param {string} category - The category to filter by
 * @returns {Promise<Object>} Array of filtered items or error
 */
export async function getInventoryItemsByCategory(category) {
	try {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.eq('category', category)
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

/**
 * Get low stock items
 * @returns {Promise<Object>} Array of low stock items or error
 */
export async function getLowStockItems() {
	try {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.filter('quantity', 'lte', 'low_stock_threshold')
			.order('quantity', { ascending: true });

		if (error) {
			throw error;
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}