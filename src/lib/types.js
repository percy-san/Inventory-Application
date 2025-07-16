/**
 * TypeScript-style interfaces defined as JSDoc for JavaScript
 * These provide type hints and documentation for our data models
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} id - Unique identifier
 * @property {string} name - Item name
 * @property {string} sku - Stock Keeping Unit (unique)
 * @property {number} quantity - Current quantity in stock
 * @property {string} category - Item category
 * @property {number} low_stock_threshold - Threshold for low stock alerts
 * @property {string} [description] - Optional item description
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Unique identifier
 * @property {string} name - Category name (unique)
 * @property {string} [description] - Optional category description
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} SearchFilters
 * @property {string} search - Search term for name/SKU
 * @property {string|null} category - Selected category filter
 * @property {boolean} lowStockOnly - Show only low stock items
 */

/**
 * @typedef {Object} DatabaseResponse
 * @property {any} data - Response data
 * @property {Error|null} error - Error object if operation failed
 */

/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} connected - Connection status
 * @property {string} timestamp - Status check timestamp
 * @property {string} [url] - Database URL status
 * @property {string} [error] - Error message if connection failed
 */

/**
 * Validation schemas for form data
 */

/**
 * Validate inventory item data
 * @param {Partial<InventoryItem>} item - Item data to validate
 * @returns {Object} Validation result with errors
 */
export function validateInventoryItem(item) {
	const errors = {};

	if (!item.name || item.name.trim().length === 0) {
		errors.name = 'Name is required';
	} else if (item.name.length > 255) {
		errors.name = 'Name must be less than 255 characters';
	}

	if (!item.sku || item.sku.trim().length === 0) {
		errors.sku = 'SKU is required';
	} else if (item.sku.length > 100) {
		errors.sku = 'SKU must be less than 100 characters';
	}

	if (item.quantity === undefined || item.quantity === null) {
		errors.quantity = 'Quantity is required';
	} else if (!Number.isInteger(item.quantity) || item.quantity < 0) {
		errors.quantity = 'Quantity must be a non-negative integer';
	}

	if (!item.category || item.category.trim().length === 0) {
		errors.category = 'Category is required';
	} else if (item.category.length > 100) {
		errors.category = 'Category must be less than 100 characters';
	}

	if (item.low_stock_threshold !== undefined && item.low_stock_threshold !== null) {
		if (!Number.isInteger(item.low_stock_threshold) || item.low_stock_threshold < 0) {
			errors.low_stock_threshold = 'Low stock threshold must be a non-negative integer';
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Validate category data
 * @param {Partial<Category>} category - Category data to validate
 * @returns {Object} Validation result with errors
 */
export function validateCategory(category) {
	const errors = {};

	if (!category.name || category.name.trim().length === 0) {
		errors.name = 'Name is required';
	} else if (category.name.length > 100) {
		errors.name = 'Name must be less than 100 characters';
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Transform raw database data to application format
 * @param {Object} rawItem - Raw item from database
 * @returns {InventoryItem} Formatted inventory item
 */
export function transformInventoryItem(rawItem) {
	return {
		id: rawItem.id,
		name: rawItem.name,
		sku: rawItem.sku,
		quantity: rawItem.quantity,
		category: rawItem.category,
		low_stock_threshold: rawItem.low_stock_threshold || 10,
		description: rawItem.description || '',
		created_at: rawItem.created_at,
		updated_at: rawItem.updated_at
	};
}

/**
 * Check if an item is low stock
 * @param {InventoryItem} item - Inventory item to check
 * @returns {boolean} True if item is low stock
 */
export function isLowStock(item) {
	return item.quantity <= item.low_stock_threshold;
}

/**
 * Transform form data to inventory item format for database insertion
 * @param {Object} formData - Form data from user input
 * @returns {Partial<InventoryItem>} Formatted data for database
 */
export function transformFormToInventoryItem(formData) {
	const quantity = parseInt(formData.quantity);
	const threshold = parseInt(formData.low_stock_threshold);
	
	return {
		name: formData.name?.trim() || '',
		sku: formData.sku?.trim() || '',
		quantity: isNaN(quantity) ? 0 : quantity,
		category: formData.category?.trim() || '',
		low_stock_threshold: formData.low_stock_threshold && !isNaN(threshold) ? threshold : 10,
		description: formData.description?.trim() || ''
	};
}

/**
 * Create a new inventory item with default values
 * @returns {Partial<InventoryItem>} New item template
 */
export function createNewInventoryItem() {
	return {
		name: '',
		sku: '',
		quantity: 0,
		category: '',
		low_stock_threshold: 10,
		description: ''
	};
}

/**
 * Filter inventory items based on search criteria
 * @param {InventoryItem[]} items - Array of inventory items
 * @param {SearchFilters} filters - Search and filter criteria
 * @returns {InventoryItem[]} Filtered items
 */
export function filterInventoryItems(items, filters) {
	return items.filter(item => {
		// Search filter (name or SKU)
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			const matchesSearch = 
				item.name.toLowerCase().includes(searchTerm) ||
				item.sku.toLowerCase().includes(searchTerm);
			if (!matchesSearch) return false;
		}

		// Category filter
		if (filters.category && filters.category !== item.category) {
			return false;
		}

		// Low stock filter
		if (filters.lowStockOnly && !isLowStock(item)) {
			return false;
		}

		return true;
	});
}

/**
 * Sort inventory items by various criteria
 * @param {InventoryItem[]} items - Array of inventory items
 * @param {string} sortBy - Sort criteria ('name', 'sku', 'quantity', 'category', 'lowStock')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {InventoryItem[]} Sorted items
 */
export function sortInventoryItems(items, sortBy = 'name', sortOrder = 'asc') {
	const sortedItems = [...items].sort((a, b) => {
		let comparison = 0;

		switch (sortBy) {
			case 'name':
				comparison = a.name.localeCompare(b.name);
				break;
			case 'sku':
				comparison = a.sku.localeCompare(b.sku);
				break;
			case 'quantity':
				comparison = a.quantity - b.quantity;
				break;
			case 'category':
				comparison = a.category.localeCompare(b.category);
				break;
			case 'lowStock':
				// Sort by low stock status first, then by quantity
				const aLowStock = isLowStock(a);
				const bLowStock = isLowStock(b);
				if (aLowStock && !bLowStock) return -1;
				if (!aLowStock && bLowStock) return 1;
				comparison = a.quantity - b.quantity;
				break;
			default:
				comparison = a.name.localeCompare(b.name);
		}

		return sortOrder === 'desc' ? -comparison : comparison;
	});

	return sortedItems;
}