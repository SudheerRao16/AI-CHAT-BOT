# replit.md

## Overview

This is a full-stack AI chatbot application built with React and Express.js that implements Retrieval-Augmented Generation (RAG) using document uploads and AI-powered chat functionality. The application allows users to upload documents (PDF, DOCX, TXT), which are processed and indexed using vector embeddings, and then enables AI-powered conversations that can reference the uploaded content.

**Current Status**: ✅ Fully functional AI chatbot with RAG pipeline implemented and running successfully. All core features are working including user authentication, document upload/processing, real-time chat with WebSocket, and contextual AI responses using uploaded documents.

## Recent Changes (Latest: July 23, 2025)

- ✅ **Complete application implementation**: Built full-stack AI chatbot from scratch
- ✅ **Authentication system**: Implemented secure session-based auth with Passport.js
- ✅ **Document processing pipeline**: Created RAG system with text chunking and vector embeddings
- ✅ **Real-time chat**: Added WebSocket support for instant messaging
- ✅ **Modern UI**: Built responsive React frontend with dark/light mode
- ✅ **Vector search**: Integrated Pinecone for semantic document search
- ✅ **AI integration**: Connected GPT-4 for intelligent, context-aware responses
- ✅ **Error resolution**: Fixed all TypeScript and import issues
- ✅ **Documentation**: Created comprehensive README with setup instructions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth
- **File Processing**: Multer for uploads, LangChain for document processing
- **Real-time Communication**: WebSocket support for live chat updates

### Database Schema
The application uses four main tables:
- `users`: User accounts with authentication credentials
- `documents`: Uploaded files with processing status and metadata
- `chat_sessions`: Chat conversation containers
- `messages`: Individual chat messages with role (user/assistant) and optional sources

## Key Components

### Document Processing Pipeline
1. **File Upload**: Multer handles file uploads with type validation (PDF, DOCX, TXT)
2. **Document Processing**: LangChain loaders extract text content from various file formats
3. **Text Chunking**: RecursiveCharacterTextSplitter breaks documents into searchable chunks
4. **Vector Embeddings**: OpenAI embeddings API generates vectors for semantic search
5. **Vector Storage**: Pinecone vector database stores document chunks with metadata

### Chat System
1. **Session Management**: Users can create multiple chat sessions with persistent history
2. **Message Processing**: Real-time WebSocket communication for instant responses
3. **RAG Implementation**: Context retrieval from uploaded documents enhances AI responses
4. **AI Integration**: OpenAI GPT-4o model generates contextually aware responses

### Authentication & Authorization
- Session-based authentication using express-session
- Password hashing with Node.js crypto (scrypt)
- User isolation ensuring document and chat privacy
- Protected routes with authentication middleware

## Data Flow

1. **User Registration/Login**: Credentials processed through Passport.js local strategy
2. **Document Upload**: Files uploaded → processed by LangChain → vectorized → stored in Pinecone
3. **Chat Initiation**: User creates session → WebSocket connection established
4. **Message Exchange**: User message → vector search in Pinecone → context retrieval → OpenAI API → AI response
5. **Real-time Updates**: WebSocket broadcasts responses and status updates to connected clients

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4o model for chat completions and text-embedding-ada-002 for embeddings
- **Pinecone**: Vector database for semantic search and retrieval
- **Neon Database**: Managed PostgreSQL hosting (inferred from @neondatabase/serverless)

### Key Libraries
- **LangChain**: Document loading and text processing
- **Drizzle ORM**: Type-safe database operations
- **TanStack Query**: Efficient server state management
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework

### Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Build Process
- **Client**: Vite builds React app to `dist/public`
- **Server**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access
- `PINECONE_API_KEY`: Pinecone vector database access
- `PINECONE_INDEX_NAME`: Target Pinecone index
- `SESSION_SECRET`: Express session encryption key

### Production Considerations
- Static file serving through Express in production
- PostgreSQL database with connection pooling
- File upload storage (currently local, should consider cloud storage)
- WebSocket scaling (consider Redis adapter for multiple instances)
- Rate limiting for API endpoints
- Error handling and logging middleware

The application follows a monorepo structure with shared TypeScript schemas, enabling type safety across the full stack while maintaining clear separation of concerns between client and server code.