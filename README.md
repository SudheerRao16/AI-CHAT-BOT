# AI Chatbot with RAG Pipeline

A full-stack AI chatbot application powered by GPT-4 with Retrieval-Augmented Generation (RAG) capabilities. Upload documents and chat with an AI that can reference your content to provide contextual, intelligent responses.

## 🚀 Features

- **GPT-4 Powered Conversations**: Advanced AI chat capabilities using OpenAI's latest model
- **RAG (Retrieval-Augmented Generation)**: Upload documents and chat about their content
- **Document Support**: PDF, DOCX, and TXT file processing
- **Real-time Chat**: WebSocket-powered instant messaging
- **User Authentication**: Secure session-based authentication
- **Modern UI**: Dark/light mode with responsive design
- **Vector Search**: Pinecone-powered semantic document search
- **Session Management**: Multiple chat sessions with persistent history

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Shadcn/ui** components with Radix UI
- **Tailwind CSS** for styling
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout
- **Passport.js** for authentication
- **WebSocket** for real-time communication
- **Multer** for file uploads

### AI & Vector Database
- **OpenAI GPT-4** for chat completions
- **OpenAI Embeddings** for document vectorization
- **Pinecone** for vector storage and search
- **LangChain** for document processing

### Database
- **PostgreSQL** with Drizzle ORM
- **Session storage** for authentication

## 🏃‍♂️ Quick Start

### Prerequisites

1. **Node.js 20+** installed
2. **API Keys** from:
   - [OpenAI](https://platform.openai.com/) for GPT-4 access
   - [Pinecone](https://www.pinecone.io/) for vector database

### Environment Setup

The following environment variables are required:

```bash
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
SESSION_SECRET=your_random_session_secret_32chars+
DATABASE_URL=your_postgresql_connection_string
PINECONE_INDEX_NAME=chatbot-knowledge-base
```

### Installation & Running

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the development server URL

## 📋 Usage Guide

### Getting Started

1. **Create an Account**: Register with username, email, and password
2. **Upload Documents**: Use the sidebar to upload PDF, DOCX, or TXT files
3. **Start Chatting**: Create a new chat session and ask questions
4. **Reference Documents**: The AI will automatically use your uploaded documents for context

### Document Upload

- **Supported formats**: PDF, DOCX, TXT
- **File size limit**: 10MB per file
- **Processing**: Documents are automatically chunked and vectorized
- **Status tracking**: Monitor processing status in the sidebar

### Chat Features

- **Multiple Sessions**: Create and manage multiple chat conversations
- **Real-time Responses**: Instant AI responses via WebSocket
- **Source Citations**: See when AI uses your documents as context
- **Session History**: All conversations are saved and searchable
- **Dark/Light Mode**: Toggle theme preference

## 🏗️ Architecture

### RAG Pipeline Flow

1. **Document Upload** → Text extraction and chunking
2. **Vectorization** → OpenAI embeddings generation
3. **Storage** → Pinecone vector database indexing
4. **Query Processing** → User question → similarity search
5. **Context Retrieval** → Relevant chunks retrieved
6. **AI Response** → GPT-4 generates contextual answer

### Database Schema

- **users**: Authentication and user management
- **documents**: File metadata and processing status
- **chat_sessions**: Conversation containers
- **messages**: Individual chat messages with sources

### Real-time Communication

- **WebSocket Server**: Real-time message exchange
- **Session Validation**: Secure user verification
- **Error Handling**: Graceful failure management

## 🔧 Development

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── services/           # AI and database services
│   ├── auth.ts             # Authentication setup
│   ├── routes.ts           # API routes
│   └── storage.ts          # Data layer
├── shared/                 # Shared types and schemas
└── README.md
```

### Key Components

- **ChatSidebar**: Document management and session list
- **ChatMessages**: Message display with source citations
- **MessageInput**: Real-time message composition
- **DocumentUpload**: Drag-and-drop file handling
- **AuthPage**: User registration and login

### API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/user` - Current user info
- `POST /api/documents/upload` - Document upload
- `GET /api/documents` - User documents list
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions` - List user sessions
- `GET /api/chat/sessions/:id/messages` - Session messages
- `WebSocket /ws` - Real-time chat communication

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Ensure all secrets are properly configured
2. **Database**: Use managed PostgreSQL service
3. **File Storage**: Consider cloud storage for uploaded documents
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Add logging and error tracking
6. **SSL**: Enable HTTPS for secure communication

### Build Process

```bash
npm run build
```

This creates:
- `dist/public/` - Frontend build
- `dist/index.js` - Backend build

## 🔐 Security Features

- **Session-based Authentication**: Secure user sessions
- **Password Hashing**: Scrypt-based password security
- **File Validation**: Type and size restrictions
- **User Isolation**: Documents and chats are user-specific
- **Input Sanitization**: Protection against malicious inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues, questions, or feature requests, please open an issue on the repository.

---

**Built with ❤️ using modern web technologies and AI**