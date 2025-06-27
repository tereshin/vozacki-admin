# Categories Management

## Overview

The Categories Management system allows administrators to create, edit, and organize content categories within the Vozacki Admin application. Categories are language-specific and can have hierarchical relationships (parent-child).

## Features

### ✅ Implemented Features

1. **Category List View** (`/categories`)
   - Filterable table with search, language, and parent category filters
   - Sortable columns (name, slug, language, parent, description)
   - Pagination support
   - Real-time data refresh

2. **Category Form Dialog**
   - Create new categories
   - Edit existing categories
   - Form validation with error handling
   - Auto-slug generation from category name
   - Language-specific parent category loading

3. **Category Management**
   - Full CRUD operations (Create, Read, Update, Delete)
   - Hierarchical structure support (parent-child relationships)
   - Language-specific categories
   - Unique UID generation for content management

## Database Schema

```sql
categories: {
  id: string (UUID)
  name: string (required)
  slug: string (required)
  description: string (optional)
  language_id: string (required, FK to languages.id)
  parent_category_uid: string (optional, FK to content_uids.uid)
  uid: string (required, FK to content_uids.uid)
  created_at: string (timestamp)
}
```

## API Endpoints

The application uses Supabase directly through `useCategoriesApi` composable:

- `getCategories(params)` - List categories with filtering
- `getSingleCategory(id)` - Get single category by ID
- `createCategory(data)` - Create new category
- `updateCategory(id, data)` - Update existing category
- `deleteCategory(id)` - Delete category

## Usage

### Accessing Categories

1. Navigate to the Categories page via the sidebar menu
2. Use filters to find specific categories:
   - **Search**: Filter by name or slug
   - **Language**: Show categories for specific language only
   - **Parent**: Filter by parent category

### Creating a Category

1. Click "Create Category" button in the header
2. Fill in the required fields:
   - **Name**: Category display name (required)
   - **Slug**: URL-friendly identifier (auto-generated, required)
   - **Description**: Optional category description
   - **Language**: Target language (required)
   - **Parent Category**: Optional parent for hierarchical organization

3. Click "Create" to save

### Editing a Category

1. Click on a category name or use the "Edit" action button
2. Modify the fields as needed
3. Click "Update" to save changes

### Deleting a Category

1. Use the "Delete" option from the actions menu
2. Confirm the deletion in the dialog
3. Category will be permanently removed

## Features by Language

Categories are language-specific, meaning:
- Each category belongs to exactly one language
- Parent categories must be in the same language
- When changing language filter, parent category options are updated
- Categories can have the same name/slug across different languages

## Validation Rules

1. **Name**: Required, cannot be empty
2. **Slug**: Required, auto-generated from name but can be customized
3. **Language**: Required, must be selected (cannot be changed after creation)
4. **Parent Category**: Optional, must be from the same language
5. **Self-referencing**: Cannot set a category as its own parent

### Language Immutability

For data integrity reasons, the language of a category cannot be changed after creation:
- The language field is disabled in edit mode
- Backend API explicitly excludes `language_id` from update operations
- This prevents breaking relationships with articles and other content

## Hierarchical Structure

Categories support unlimited nesting levels:
- Root categories have no parent
- Child categories reference their parent via `parent_category_uid`
- Circular references are prevented in the UI
- Parent categories are filtered by selected language

## Integration with Articles

Categories are integrated with the Articles system:
- Articles can be assigned to categories
- Category selection in article forms is filtered by language
- When language changes in article forms, category options are refreshed

## Localization

The interface supports multiple languages:
- **English** (`en`)
- **Russian** (`ru`) 
- **Serbian** (`sr`)

All form labels, error messages, and UI text are properly localized.

## Technical Implementation

### Components

- `CategoriesIndexPage.vue` - Main categories list and management page
- `CategoriesFormDialog.vue` - Modal form for creating/editing categories

### Store

- `useCategoriesStore()` - Pinia store for categories state management

### API

- `useCategoriesApi()` - Composable for Supabase database operations

### Types

- `CategoryResource` - Database row type
- `CategoryRequest` - Create request type (includes language_id)
- `CategoryUpdateRequest` - Update request type (excludes language_id for immutability)

## Security

- Authentication required to access categories management
- Content management permissions control access
- Server-side validation through Supabase RLS (Row Level Security)

## Performance Considerations

- Categories are loaded with pagination (configurable page size)
- Parent category options are loaded separately when language is selected
- Filters are applied server-side to reduce data transfer
- Language filter triggers reload of parent categories to maintain consistency 