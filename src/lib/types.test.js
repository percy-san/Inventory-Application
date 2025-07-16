import { describe, it, expect } from 'vitest';
import {
	validateInventoryItem,
	validateCategory,
	transformInventoryItem,
	isLowStock,
	transformFormToInventoryItem,
	createNewInventoryItem,
	filterInventoryItems,
	sortInventoryItems
} from './types.js';

describe('validateInventoryItem', () => {
	it('should validate a valid inventory item', () => {
		const validItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics',
			low_stock_threshold: 5
		};

		const result = validateInventoryItem(validItem);
		expect(result.isValid).toBe(true);
		expect(result.errors).toEqual({});
	});

	it('should require name field', () => {
		const invalidItem = {
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe('Name is required');
	});

	it('should reject empty name', () => {
		const invalidItem = {
			name: '   ',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe('Name is required');
	});

	it('should reject name longer than 255 characters', () => {
		const invalidItem = {
			name: 'a'.repeat(256),
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe('Name must be less than 255 characters');
	});

	it('should require SKU field', () => {
		const invalidItem = {
			name: 'Test Item',
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.sku).toBe('SKU is required');
	});

	it('should reject empty SKU', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: '   ',
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.sku).toBe('SKU is required');
	});

	it('should reject SKU longer than 100 characters', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'a'.repeat(101),
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.sku).toBe('SKU must be less than 100 characters');
	});

	it('should require quantity field', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.quantity).toBe('Quantity is required');
	});

	it('should reject negative quantity', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: -1,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.quantity).toBe('Quantity must be a non-negative integer');
	});

	it('should reject non-integer quantity', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10.5,
			category: 'Electronics'
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.quantity).toBe('Quantity must be a non-negative integer');
	});

	it('should accept zero quantity', () => {
		const validItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 0,
			category: 'Electronics'
		};

		const result = validateInventoryItem(validItem);
		expect(result.isValid).toBe(true);
		expect(result.errors.quantity).toBeUndefined();
	});

	it('should require category field', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.category).toBe('Category is required');
	});

	it('should reject empty category', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: '   '
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.category).toBe('Category is required');
	});

	it('should reject category longer than 100 characters', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'a'.repeat(101)
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.category).toBe('Category must be less than 100 characters');
	});

	it('should validate low_stock_threshold when provided', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics',
			low_stock_threshold: -1
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.low_stock_threshold).toBe('Low stock threshold must be a non-negative integer');
	});

	it('should reject non-integer low_stock_threshold', () => {
		const invalidItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics',
			low_stock_threshold: 5.5
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(result.errors.low_stock_threshold).toBe('Low stock threshold must be a non-negative integer');
	});

	it('should allow undefined low_stock_threshold', () => {
		const validItem = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics'
		};

		const result = validateInventoryItem(validItem);
		expect(result.isValid).toBe(true);
		expect(result.errors.low_stock_threshold).toBeUndefined();
	});

	it('should return multiple validation errors', () => {
		const invalidItem = {
			name: '',
			sku: '',
			quantity: -1,
			category: ''
		};

		const result = validateInventoryItem(invalidItem);
		expect(result.isValid).toBe(false);
		expect(Object.keys(result.errors)).toHaveLength(4);
		expect(result.errors.name).toBe('Name is required');
		expect(result.errors.sku).toBe('SKU is required');
		expect(result.errors.quantity).toBe('Quantity must be a non-negative integer');
		expect(result.errors.category).toBe('Category is required');
	});
});

describe('validateCategory', () => {
	it('should validate a valid category', () => {
		const validCategory = {
			name: 'Electronics',
			description: 'Electronic items'
		};

		const result = validateCategory(validCategory);
		expect(result.isValid).toBe(true);
		expect(result.errors).toEqual({});
	});

	it('should require name field', () => {
		const invalidCategory = {
			description: 'Some description'
		};

		const result = validateCategory(invalidCategory);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe('Name is required');
	});

	it('should reject empty name', () => {
		const invalidCategory = {
			name: '   ',
			description: 'Some description'
		};

		const result = validateCategory(invalidCategory);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe('Name is required');
	});

	it('should reject name longer than 100 characters', () => {
		const invalidCategory = {
			name: 'a'.repeat(101),
			description: 'Some description'
		};

		const result = validateCategory(invalidCategory);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe('Name must be less than 100 characters');
	});

	it('should allow category without description', () => {
		const validCategory = {
			name: 'Electronics'
		};

		const result = validateCategory(validCategory);
		expect(result.isValid).toBe(true);
		expect(result.errors).toEqual({});
	});
});

describe('transformInventoryItem', () => {
	it('should transform raw database item to application format', () => {
		const rawItem = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: 'A test item',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		};

		const result = transformInventoryItem(rawItem);
		expect(result).toEqual({
			id: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: 'A test item',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		});
	});

	it('should use default low_stock_threshold when not provided', () => {
		const rawItem = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 15,
			category: 'Electronics',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		};

		const result = transformInventoryItem(rawItem);
		expect(result.low_stock_threshold).toBe(10);
	});

	it('should use empty string for description when not provided', () => {
		const rawItem = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: 5,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		};

		const result = transformInventoryItem(rawItem);
		expect(result.description).toBe('');
	});

	it('should handle null values gracefully', () => {
		const rawItem = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: null,
			description: null,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		};

		const result = transformInventoryItem(rawItem);
		expect(result.low_stock_threshold).toBe(10);
		expect(result.description).toBe('');
	});
});

describe('isLowStock', () => {
	it('should return true when quantity is below threshold', () => {
		const item = {
			id: '123',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 3,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		expect(isLowStock(item)).toBe(true);
	});

	it('should return true when quantity equals threshold', () => {
		const item = {
			id: '123',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 5,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		expect(isLowStock(item)).toBe(true);
	});

	it('should return false when quantity is above threshold', () => {
		const item = {
			id: '123',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		expect(isLowStock(item)).toBe(false);
	});

	it('should handle zero quantity', () => {
		const item = {
			id: '123',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 0,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		expect(isLowStock(item)).toBe(true);
	});

	it('should handle zero threshold', () => {
		const item = {
			id: '123',
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 1,
			category: 'Electronics',
			low_stock_threshold: 0,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		expect(isLowStock(item)).toBe(false);
	});
});

describe('transformFormToInventoryItem', () => {
	it('should transform form data to inventory item format', () => {
		const formData = {
			name: '  Test Item  ',
			sku: '  TEST-001  ',
			quantity: '15',
			category: '  Electronics  ',
			low_stock_threshold: '5',
			description: '  A test item  '
		};

		const result = transformFormToInventoryItem(formData);
		expect(result).toEqual({
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: 'A test item'
		});
	});

	it('should handle missing fields with defaults', () => {
		const formData = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: '10',
			category: 'Electronics'
		};

		const result = transformFormToInventoryItem(formData);
		expect(result).toEqual({
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 10,
			category: 'Electronics',
			low_stock_threshold: 10,
			description: ''
		});
	});

	it('should handle invalid numeric values', () => {
		const formData = {
			name: 'Test Item',
			sku: 'TEST-001',
			quantity: 'invalid',
			category: 'Electronics',
			low_stock_threshold: 'also invalid'
		};

		const result = transformFormToInventoryItem(formData);
		expect(result.quantity).toBe(0);
		expect(result.low_stock_threshold).toBe(10);
	});

	it('should handle empty strings', () => {
		const formData = {
			name: '',
			sku: '',
			quantity: '',
			category: '',
			description: ''
		};

		const result = transformFormToInventoryItem(formData);
		expect(result).toEqual({
			name: '',
			sku: '',
			quantity: 0,
			category: '',
			low_stock_threshold: 10,
			description: ''
		});
	});
});

describe('createNewInventoryItem', () => {
	it('should create a new inventory item with default values', () => {
		const result = createNewInventoryItem();
		expect(result).toEqual({
			name: '',
			sku: '',
			quantity: 0,
			category: '',
			low_stock_threshold: 10,
			description: ''
		});
	});
});

describe('filterInventoryItems', () => {
	const testItems = [
		{
			id: '1',
			name: 'Laptop Computer',
			sku: 'LAP-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: 'Gaming laptop',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		},
		{
			id: '2',
			name: 'Office Chair',
			sku: 'CHR-001',
			quantity: 3,
			category: 'Furniture',
			low_stock_threshold: 5,
			description: 'Ergonomic chair',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		},
		{
			id: '3',
			name: 'Wireless Mouse',
			sku: 'MOU-001',
			quantity: 25,
			category: 'Electronics',
			low_stock_threshold: 10,
			description: 'Bluetooth mouse',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		}
	];

	it('should filter by search term in name', () => {
		const filters = { search: 'laptop', category: null, lowStockOnly: false };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Laptop Computer');
	});

	it('should filter by search term in SKU', () => {
		const filters = { search: 'CHR', category: null, lowStockOnly: false };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].sku).toBe('CHR-001');
	});

	it('should filter by category', () => {
		const filters = { search: '', category: 'Electronics', lowStockOnly: false };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(2);
		expect(result.every(item => item.category === 'Electronics')).toBe(true);
	});

	it('should filter by low stock only', () => {
		const filters = { search: '', category: null, lowStockOnly: true };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Office Chair');
	});

	it('should combine multiple filters', () => {
		const filters = { search: 'electronics', category: 'Electronics', lowStockOnly: false };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(0); // No item has 'electronics' in name/SKU
	});

	it('should return all items when no filters applied', () => {
		const filters = { search: '', category: null, lowStockOnly: false };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(3);
	});

	it('should handle case insensitive search', () => {
		const filters = { search: 'LAPTOP', category: null, lowStockOnly: false };
		const result = filterInventoryItems(testItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Laptop Computer');
	});
});

describe('sortInventoryItems', () => {
	const testItems = [
		{
			id: '1',
			name: 'Zebra Printer',
			sku: 'ZEB-001',
			quantity: 15,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		},
		{
			id: '2',
			name: 'Apple Computer',
			sku: 'APP-001',
			quantity: 3,
			category: 'Electronics',
			low_stock_threshold: 5,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		},
		{
			id: '3',
			name: 'Office Chair',
			sku: 'CHR-001',
			quantity: 25,
			category: 'Furniture',
			low_stock_threshold: 10,
			description: '',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		}
	];

	it('should sort by name ascending by default', () => {
		const result = sortInventoryItems(testItems);
		expect(result[0].name).toBe('Apple Computer');
		expect(result[1].name).toBe('Office Chair');
		expect(result[2].name).toBe('Zebra Printer');
	});

	it('should sort by name descending', () => {
		const result = sortInventoryItems(testItems, 'name', 'desc');
		expect(result[0].name).toBe('Zebra Printer');
		expect(result[1].name).toBe('Office Chair');
		expect(result[2].name).toBe('Apple Computer');
	});

	it('should sort by SKU ascending', () => {
		const result = sortInventoryItems(testItems, 'sku', 'asc');
		expect(result[0].sku).toBe('APP-001');
		expect(result[1].sku).toBe('CHR-001');
		expect(result[2].sku).toBe('ZEB-001');
	});

	it('should sort by quantity ascending', () => {
		const result = sortInventoryItems(testItems, 'quantity', 'asc');
		expect(result[0].quantity).toBe(3);
		expect(result[1].quantity).toBe(15);
		expect(result[2].quantity).toBe(25);
	});

	it('should sort by quantity descending', () => {
		const result = sortInventoryItems(testItems, 'quantity', 'desc');
		expect(result[0].quantity).toBe(25);
		expect(result[1].quantity).toBe(15);
		expect(result[2].quantity).toBe(3);
	});

	it('should sort by category ascending', () => {
		const result = sortInventoryItems(testItems, 'category', 'asc');
		expect(result[0].category).toBe('Electronics');
		expect(result[1].category).toBe('Electronics');
		expect(result[2].category).toBe('Furniture');
	});

	it('should sort by low stock status', () => {
		const result = sortInventoryItems(testItems, 'lowStock', 'asc');
		// Low stock items should come first, then sorted by quantity
		expect(result[0].quantity).toBe(3); // Apple Computer (low stock)
		expect(result[1].quantity).toBe(15); // Zebra Printer (not low stock)
		expect(result[2].quantity).toBe(25); // Office Chair (not low stock)
	});

	it('should not mutate original array', () => {
		const originalOrder = testItems.map(item => item.name);
		sortInventoryItems(testItems, 'name', 'desc');
		const currentOrder = testItems.map(item => item.name);
		expect(currentOrder).toEqual(originalOrder);
	});

	it('should handle unknown sort criteria', () => {
		const result = sortInventoryItems(testItems, 'unknown', 'asc');
		// Should default to name sorting
		expect(result[0].name).toBe('Apple Computer');
		expect(result[1].name).toBe('Office Chair');
		expect(result[2].name).toBe('Zebra Printer');
	});
});