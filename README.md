# DocuSummarize

An AI-powered document summarizer that generates concise summaries from DOCX and TXT files using IBM Granite LLM.

## Features

- **Document Upload**: Support for DOCX and TXT files (max 10MB)
- **AI Summarization**: Powered by IBM Granite 3.3-8B Instruct model via Replicate
- **User Authentication**: Google OAuth integration with NextAuth.js
- **History Tracking**: View all previously summarized documents
- **Responsive Design**: Modern UI with shadcn/ui components
- **Database Integration**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Google provider
- **Database**: PostgreSQL with Prisma ORM
- **AI Model**: IBM Granite via Replicate API
- **UI Components**: shadcn/ui with Tailwind CSS
- **File Processing**: Mammoth.js for DOCX parsing
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (or Prisma Accelerate)
- Google OAuth credentials
- Replicate API token

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ibm-granite-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="your-database-url"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXTAUTH_SECRET="your-nextauth-secret"

   # Replicate API
   REPLICATE_API_TOKEN="your-replicate-token"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── history/               # User history API
│   │   └── summarize/             # Document processing API
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/
│   ├── auth/                      # Authentication components
│   ├── history/                   # History display
│   ├── ui/                        # Reusable UI components
│   └── upload/                    # File upload component
└── lib/
    ├── prisma.ts                  # Prisma client
    └── utils.ts                   # Utility functions
```

## API Endpoints

### `POST /api/summarize`

- Upload and summarize documents
- Supports DOCX and TXT files
- Returns AI-generated summary

### `GET /api/history`

- Retrieve user's summarization history
- Returns list of processed documents

## Environment Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Replicate API Setup

1. Sign up at [Replicate](https://replicate.com/)
2. Generate an API token
3. Add token to your environment variables

## Deployment

### Build the application

```bash
npm run build
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

## Usage

1. **Sign in** with your Google account
2. **Upload** a DOCX or TXT file (max 10MB)
3. **Wait** for AI processing (usually 10-30 seconds)
4. **View** your summary and access it anytime in history

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions:

1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include error logs and environment details
