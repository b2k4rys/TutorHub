# TutorHub

A comprehensive educational platform that connects tutors and students in a modern digital learning environment. Built with Next.js 14 and React 19, TutorHub provides a complete solution for online tutoring, classroom management, and educational collaboration.

## 🚀 Features

### 🏫 Classroom Management
- **Virtual Classrooms**: Create and manage multiple classrooms with unique subjects
- **Student Enrollment**: Easy enrollment system for students to join classrooms
- **Role-Based Access**: Separate interfaces and permissions for tutors and students
- **Classroom Analytics**: Track student progress and engagement

### 📝 Homework & Assignment System
- **Assignment Creation**: Tutors can create detailed homework with descriptions, due dates, and attachments
- **File Submissions**: Students can submit work with file uploads (documents, images, etc.)
- **Grading System**: Comprehensive grading with scores and detailed feedback
- **Status Tracking**: Real-time status updates (submitted, graded, overdue)
- **Comments & Discussion**: Interactive comment system for homework clarification

### 💬 Real-Time Messaging
- **Direct Messaging**: One-on-one chat between tutors and students
- **WebSocket Integration**: Real-time message delivery and notifications
- **Chat History**: Persistent conversation history and message management
- **Multi-User Support**: Handle multiple concurrent conversations

### 👥 User Management
- **Dual User Roles**: Comprehensive support for both tutors and students
- **Authentication System**: Secure JWT-based authentication with refresh tokens
- **Profile Management**: User profiles with personal information and preferences
- **Student Roster**: Tutors can view and manage all enrolled students

### 📊 Dashboard & Analytics
- **Personalized Dashboards**: Role-specific dashboards with relevant information
- **Quick Actions**: Fast access to frequently used features
- **Progress Tracking**: Visual progress indicators and statistics
- **Activity Overview**: Recent activities and upcoming deadlines

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React hooks with localStorage persistence
- **Authentication**: JWT tokens with automatic refresh

### Backend Integration
- **API**: Django REST Framework backend
- **Database**: PostgreSQL with Django ORM
- **File Storage**: Django file handling for homework submissions
- **Real-time**: WebSocket connections for messaging
- **Authentication**: JWT token-based authentication

## 📁 Project Structure

\`\`\`
tutorhub/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Main dashboard
│   ├── classroom/                # Classroom management
│   │   └── [id]/                 # Dynamic classroom routes
│   │       └── homeworks/        # Homework management
│   ├── homeworks/                # Individual homework pages
│   │   └── [id]/                 # Dynamic homework routes
│   │       └── submit/           # Homework submission
│   ├── students/                 # Student management
│   ├── messages/                 # Chat and messaging
│   ├── signin/                   # Authentication pages
│   └── signup/
├── components/                   # Reusable UI components
│   └── ui/                       # Shadcn/ui components
├── lib/                          # Utility libraries
│   ├── api.js                    # API client and endpoints
│   └── utils.ts                  # Helper functions
└── public/                       # Static assets
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Django backend server running on `localhost:8000`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd tutorhub
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   # or
   npm install
   \`\`\`

3. **Environment Setup**
   Create a `.env.local` file:
   \`\`\`env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000/ws
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   pnpm dev
   # or
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 API Integration

The frontend integrates with a Django REST API backend. Key endpoints include:

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `GET /auth/me/` - Get user profile
- `POST /auth/token/refresh/` - Refresh JWT token

### Classrooms
- `GET /classroom/all/` - List all classrooms
- `POST /classroom/register/` - Create new classroom
- `GET /classroom/{id}/` - Get classroom details

### Homeworks
- `GET /homeworks/classroom/{id}/` - Get classroom homeworks
- `POST /homeworks/classroom/{id}/assign/` - Create homework
- `POST /homeworks/{id}/submit/` - Submit homework
- `GET /homeworks/classroom/{id}/homework/{id}/submissions/` - View submissions

### Messaging
- `GET /chats/all/` - Get all user chats
- `GET /chat/start/{userType}/{userId}/` - Start new chat
- `GET /conversations/{id}/messages/` - Get message history

## 🎨 Design System

TutorHub uses a consistent design system built with Tailwind CSS:

- **Colors**: Black and white primary palette with accent colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Reusable UI components from Radix UI
- **Layout**: Flexbox-first responsive design
- **Spacing**: Consistent spacing scale using Tailwind utilities

## 🔐 Authentication Flow

1. **User Registration/Login**: JWT tokens stored in localStorage
2. **Token Refresh**: Automatic token refresh on expiration
3. **Route Protection**: Client-side route guards for protected pages
4. **Role-Based Access**: Different UI/UX based on user role (tutor/student)

## 📱 Key User Flows

### For Tutors
1. Create classroom → Add students → Assign homework → Grade submissions
2. View student progress → Provide feedback → Communicate via chat
3. Manage multiple classrooms → Track analytics → Update profiles

### For Students
1. Join classroom → View assignments → Submit homework → Check grades
2. Communicate with tutors → Track progress → Manage deadlines
3. Access learning materials → Participate in discussions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**TutorHub** - Empowering education through technology 🎓
