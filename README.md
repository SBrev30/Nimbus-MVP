# WritersBlock2 - Import System MVP

A visual writing platform with document import capabilities, built with React, TypeScript, Supabase, and React Flow.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/Sbrev30/writersblock2.git
cd writersblock2
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:5173`

## ✨ Features

### Core Features (✅ Complete)
- **Rich Text Editor** - Full-featured writing environment with auto-save
- **Visual Canvas** - Interactive mind-mapping with drag-and-drop nodes
- **Project Management** - Kanban-style project organization
- **Document Import** - Import .docx and .txt files with smart categorization
- **Content Library** - Organize imported content with search and filtering
- **Canvas Integration** - Add imported content as visual nodes
- **Notes System** - Categorized note-taking with real-time sync
- **Responsive Design** - Works on all screen sizes

### Import System MVP (🆕 New)
- **File Processing** - Supports .docx and .txt files up to 10MB
- **Smart Categorization** - Automatically suggests content types (Character, Plot, Research, Chapter)
- **Tagging System** - Add custom tags for organization
- **Library Management** - Search, filter, and manage imported content
- **Canvas Nodes** - Imported content appears as connected nodes on canvas
- **Database Storage** - Efficient Supabase integration

## 🗄️ Database Setup

The app uses Supabase with the following tables:
- `imported_items` - Stores imported document content
- `item_tags` - Flat tagging system for organization
- `canvas_items` - Links imported content to canvas positions
- `ai_usage_simple` - Tracks AI feature usage

Database migrations are automatically applied via Supabase.

## 📱 How to Use

### Import Workflow
1. **Access Library** - Click "Library" in the sidebar
2. **Import Content** - Click "Import Content" button
3. **Upload Files** - Drag & drop or select .docx/.txt files
4. **Categorize** - Review auto-suggested categories and add tags
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

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **React Flow** for infinite canvas functionality
- **Tailwind CSS** for responsive UI design
- **Vite** for fast development and building

### Backend & Database
- **Supabase** as backend service
  - PostgreSQL database for structured data
  - Real-time subscriptions
  - Row Level Security (RLS)
  - File processing capabilities

### File Processing
- **Mammoth.js** for .docx file conversion
- **Smart content detection** for categorization
- **Error handling** with user-friendly messages

## 📊 Data Efficiency

This MVP is designed to stay within Supabase free tier limits:
- **Storage**: Text-only content (no images/heavy files)
- **Database**: ~500MB limit - can handle thousands of documents
- **Bandwidth**: Efficient queries and minimal data transfer
- **Rows**: Optimized schema for minimal row usage

## 🎯 MVP Scope

**Included in MVP:**
- File upload (.docx/.txt)
- Content categorization (4 types)
- Basic tagging system
- Library management with search
- Canvas integration
- Responsive design

**Not included (future features):**
- Google Docs integration
- Advanced AI analysis
- Collaboration features
- Image/media support
- Export functionality

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── ImportWizard.tsx      # File import workflow
│   ├── Library.tsx           # Content library management
│   ├── ImportedContentNode.tsx # Canvas node component
│   └── ...
├── hooks/
│   ├── useCanvasImports.ts   # Canvas integration logic
│   └── ...
├── lib/
│   └── supabase.ts          # Database configuration
├── utils/
│   └── fileProcessor.ts     # File processing utilities
└── ...
```

### Key Components
- **ImportWizard** - Multi-step import process
- **Library** - Content management interface
- **useCanvasImports** - Hook for canvas integration
- **ImportedContentNode** - Custom React Flow node

## 🚀 Deployment

The app is designed to deploy easily to:
- **Vercel** (recommended for frontend)
- **Netlify** 
- **Supabase Edge Functions** (for any server-side logic)

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

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check the troubleshooting guide above
- Review the code comments for implementation details

---

**Built with ❤️ for writers who think visually**
