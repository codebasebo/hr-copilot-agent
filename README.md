# AI Agent with LangGraph.js and MongoDB

An advanced AI agent implementation using LangGraph.js and MongoDB Atlas Vector Search for intelligent HR assistance and employee data management.

## 🌟 Features

- AI-powered conversational agent using LangGraph.js
- MongoDB Atlas Vector Search for semantic employee search
- Persistent conversation state using MongoDB checkpoints
- Employee data management with vector embeddings
- RESTful API endpoints for chat interactions
- TypeScript implementation for type safety
- Extensible tool system for agent capabilities

## 📋 Prerequisites

- Node.js >= 14
- MongoDB Atlas account
- OpenAI API key
- Anthropic API key
- npm or yarn package manager

## 🛠️ Tech Stack

- **LangGraph.js** - AI agent framework
- **MongoDB Atlas** - Database and vector search
- **Express.js** - API server
- **TypeScript** - Programming language
- **Anthropic Claude** - Language model
- **OpenAI** - Embeddings generation

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-agent-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
MONGODB_ATLAS_URI=your-mongodb-atlas-connection-string
```

4. Set up MongoDB Atlas Vector Search index:
- Create a vector index named "vector_index"
- Use the following index definition:
```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

5. Seed the database:
```bash
npx ts-node seed-database.ts
```

6. Start the server:
```bash
npx ts-node index.ts
```

## 📁 Project Structure

```
├── .env                    # Environment variables
├── index.ts               # Express server setup
├── agent.ts               # AI agent implementation
├── seed-database.ts       # Database seeding script
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## 🔌 API Endpoints

### Start New Chat
```http
POST /chat
Content-Type: application/json

{
  "message": "Your initial message"
}
```

### Continue Conversation
```http
POST /chat/:threadId
Content-Type: application/json

{
  "message": "Your follow-up message"
}
```

## 💻 Usage Example

```bash
# Start a new conversation
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Build a team to make an iOS app, and tell me the talent gaps."}' \
  http://localhost:3000/chat

# Continue conversation
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the talent gaps?"}' \
  http://localhost:3000/chat/<threadId>
```

## 🛠️ Development

### Adding New Tools

1. Create a new tool in `agent.ts`:
```typescript
const newTool = tool(
  async ({ param1, param2 }) => {
    // Tool implementation
    return result;
  },
  {
    name: "tool_name",
    description: "Tool description",
    schema: z.object({
      param1: z.string(),
      param2: z.number()
    })
  }
);
```

2. Add the tool to the tools array:
```typescript
const tools = [employeeLookupTool, newTool];
```

### Modifying Agent Behavior

Update the prompt template in `callModel` function:
```typescript
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Your updated system message here...`
  ],
  new MessagesPlaceholder("messages")
]);
```

## 🔒 Security Considerations

- Secure API keys in environment variables
- Implement rate limiting for API endpoints
- Validate user input
- Sanitize tool outputs
- Use secure MongoDB connection string
- Implement proper error handling

## ⚙️ Configuration

### Environment Variables

- `OPENAI_API_KEY`: OpenAI API key for embeddings
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude LLM
- `MONGODB_ATLAS_URI`: MongoDB Atlas connection string
- `PORT`: Server port (default: 3000)

### MongoDB Collections

- `employees`: Stores employee data and embeddings
- `checkpoints`: Stores conversation states

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [LangGraph.js](https://github.com/langchain-ai/langgraphjs)
- MongoDB Atlas Vector Search
- Anthropic Claude API
- OpenAI API

## 📧 Support

For questions and support, please open an issue in the repository or contact the maintainers.