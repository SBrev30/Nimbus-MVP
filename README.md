# Nimbus MVP - Visual Writing Assistant

A minimal viable product for visual thinking writers who need to organize and manage their creative content. Nimbus MVP provides file import, content categorization, and visual canvas organization without AI dependencies.

## 🎯 Current MVP Features

### ✅ Implemented Core Features

**File Import System**
- Upload and process `.docx` and `.txt` files
- Automatic content extraction using Mammoth.js
- Batch file processing with progress indicators

**Content Categorization**
- 4 content types: Character, Plot Outline, Research, Chapter
- Manual categorization with intuitive UI
- Tag-based organization system

**Library Management**
- Centralized content library with grid/list views
- Search functionality across all content
- Filter by content type and tags
- Responsive design for all devices

**Visual Canvas Integration**
- Add library items to React Flow canvas
- Drag-and-drop content organization
- Visual relationship mapping between content pieces
- Infinite canvas for large projects

**Data Persistence**
- Supabase integration for cloud storage
- Real-time synchronization
- Secure user authentication

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Canvas**: React Flow for visual organization
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **File Processing**: Mammoth.js for .docx parsing

## 📁 Project Structure

```
src/
├── components/
│   ├── ImportWizard.tsx         # File upload and processing
│   ├── ImportedContentNode.tsx  # Canvas node component
│   ├── Canvas.tsx              # React Flow canvas
│   ├── Library.tsx             # Content management
│   ├── Files.tsx               # File listing
│   ├── Sidebar.tsx             # Navigation
│   ├── Breadcrumb.tsx          # Navigation breadcrumbs
│   ├── Editor.tsx              # Content editing
│   └── KanbanApp.tsx           # Project management (lazy loaded)
├── hooks/
│   ├── useCanvasImports.ts      # Canvas integration logic
│   ├── useAutoSave.ts           # Auto-save functionality
│   └── useLocalStorage.ts       # Local storage utilities
├── contexts/
│   ├── ThemeContext.tsx         # Theme management
│   ├── AppDataContext.tsx       # Application state
│   └── SettingsContext.tsx      # User preferences
├── lib/
│   └── supabase.ts             # Database configuration
└── utils/
    └── fileProcessor.ts         # File processing utilities
```

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/SBrev30/Nimbus-MVP.git
   cd Nimbus-MVP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📊 Database Schema

The MVP uses a simplified schema focused on core functionality:

```sql
-- Import tracking
imported_items (
  id, user_id, file_name, content_type, 
  content, tags, created_at, updated_at
)

-- Canvas positioning
canvas_positions (
  id, imported_item_id, x, y, 
  created_at, updated_at
)

-- Tagging system
item_tags (
  id, imported_item_id, tag_name, created_at
)
```

## 🎨 User Workflow

1. **Import Content**: Upload .docx or .txt files through the import wizard
2. **Categorize**: Assign content types (Character, Plot, Research, Chapter)
3. **Organize**: Add tags and organize in the library
4. **Visualize**: Drag content to the canvas for visual planning
5. **Edit**: Modify content directly in the editor

## 📱 How to Use

### Import Workflow
1. **Access Library** - Click "Library" in the sidebar
2. **Import Content** - Click "Import Content" button
3. **Upload Files** - Drag & drop or select .docx/.txt files
4. **Categorize** - Review categories and add tags
5. **Import** - Click "Import to Library" to save content

### Canvas Integration
1. **View Imported Content** - Go to Library to see all imported items
2. **Add to Canvas** - Click "Add to Canvas" on any library item
3. **Visual Organization** - Go to Canvas to see imported content as nodes
4. **Connect Ideas** - Drag connections between nodes to show relationships

### Content Management
- **Search** - Use the search bar to find content by title, content, or tags
- **Filter** - Filter by content type (Character, Plot, Research, Chapter)
- **View** - Click the eye icon to read full content
- **Organize** - Add tags and categorize for better organization

## 📊 Data Efficiency

This MVP is designed to stay within Supabase free tier limits:
- **Storage**: Text-only content (no images/heavy files)
- **Database**: ~500MB limit - can handle thousands of documents
- **Bandwidth**: Efficient queries and minimal data transfer
- **Rows**: Optimized schema for minimal row usage

## 🚫 Not in MVP (Future Features)

- AI analysis and classification
- Google Docs/Notion integration
- Advanced collaboration features
- Export functionality
- Image/media support
- Edge Functions
- Master Canvas with advanced AI

## 📈 Roadmap

### Phase 1: AI Enhancement (In Development)
- Content analysis with OpenAI/Claude integration
- Smart categorization suggestions
- Character completeness scoring
- Plot hole detection

### Phase 2: Integration
- Google Docs import
- Notion workspace sync
- Real-time collaboration

### Phase 3: Advanced Features
- Export to various formats
- Publishing pipeline
- Advanced AI writing assistance

## 🛠 Development Notes

**Staying Within Free Tiers:**
- Supabase: 50,000 monthly active users limit
- Simple schema to minimize database usage
- No Edge Functions in MVP to avoid complexity

**Performance Considerations:**
- React Flow virtualization for large canvases
- Lazy loading for non-critical components
- Optimistic updates for better UX

**Code Quality:**
- TypeScript for type safety
- Consistent component naming
- Comprehensive error handling

## 🐛 Troubleshooting

### Common Issues

**Files not importing:**
- Check file size (max 10MB)
- Ensure file format is .docx or .txt
- Check browser console for errors

**Canvas nodes not appearing:**
- Click "Add to Canvas" in Library first
- Refresh the Canvas page
- Check database connection

**Search not working:**
- Clear search and try again
- Check if content was properly imported
- Refresh the Library page

### Performance Tips
- Import files in small batches (5 or fewer)
- Use specific search terms for better results
- Regular browser refresh if experiencing lag

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Project Board](https://github.com/SBrev30/Nimbus-MVP/projects)
- [Issues](https://github.com/SBrev30/Nimbus-MVP/issues)
- [Documentation](https://github.com/SBrev30/Nimbus-MVP/wiki)

---

**Built for visual thinking writers who need better tools to organize their creative process.**