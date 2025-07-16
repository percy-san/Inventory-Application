# Database Setup Instructions

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## Environment Variables

Update your `.env` file with your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script to create tables, indexes, and policies

## Verification

After running the schema, you should have:

- `inventory_items` table with proper structure
- `categories` table with default categories
- Proper indexes for performance
- Row Level Security policies
- Automatic timestamp updates

## Default Data

The schema includes some default categories:
- Electronics
- Clothing
- Books
- Home & Garden
- Sports

You can modify these or add more categories as needed.

## Testing Connection

Use the database utility functions in `src/lib/supabase.js` to test your connection:

```javascript
import { testConnection, getConnectionStatus } from '$lib/supabase.js';

// Test connection
const isConnected = await testConnection();
console.log('Connected:', isConnected);

// Get detailed status
const status = await getConnectionStatus();
console.log('Status:', status);
```