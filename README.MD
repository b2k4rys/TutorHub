# TutorHub - Online Tutoring Platform

TutorHub is a comprehensive online tutoring platform that connects students with tutors through real-time chat, homework management, and classroom organization. Built with Next.js 15 and Django REST Framework.

## 🚀 Features

### 👥 User Management
- **Multi-role Authentication**: Students, Tutors, and Teachers
- **Secure JWT Authentication**: Access and refresh token system
- **User Profiles**: Complete profile management with contact information
- **Role-based Access Control**: Different permissions for different user types

### 🏫 Classroom Management
- **Classroom Creation**: Tutors can create individual or group classrooms
- **Subject Organization**: Mathematics, English, and custom subjects
- **Student Enrollment**: Easy student management and enrollment
- **Classroom Analytics**: Track student progress and engagement

### 📝 Homework System
- **Assignment Creation**: Tutors can create and assign homework
- **File Attachments**: Support for document and media uploads
- **Due Date Management**: Automatic deadline tracking and notifications
- **Submission Tracking**: Monitor student submission status
- **Optional vs Required**: Flexible assignment types

### 💬 Real-time Chat System
- **WebSocket Communication**: Instant messaging between users
- **Secure Authentication**: Ticket-based WebSocket authentication
- **Message History**: Persistent chat history storage
- **Echo Prevention**: Advanced duplicate message detection
- **Connection Status**: Real-time connection monitoring
- **Cross-role Messaging**: Students can chat with tutors and vice versa

### 📊 Dashboard & Analytics
- **Personalized Dashboards**: Role-specific dashboard views
- **Quick Stats**: Overview of classrooms, students, and assignments
- **Recent Activity**: Latest homework and chat activity
- **Progress Tracking**: Student performance monitoring

## 🛠 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icon library

### Backend Integration
- **Django REST Framework**: Python-based API backend
- **JWT Authentication**: Secure token-based authentication
- **WebSocket Support**: Real-time communication
- **File Upload**: Media and document handling

### Real-time Features
- **WebSocket Connections**: Persistent real-time connections
- **Message Broadcasting**: Instant message delivery
- **Connection Management**: Automatic reconnection and error handling

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Django backend server running on localhost:8000
- Modern web browser with WebSocket support

### Frontend Setup
1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000)

### Backend Requirements
The frontend expects a Django REST API running on `http://localhost:8000` with the following endpoints:

#### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration  
- `GET /api/auth/me/` - Get current user profile
- `POST /api/auth/token/refresh/` - Refresh JWT token

#### Classroom Endpoints
- `GET /api/classroom/all/` - List user's classrooms
- `GET /api/classroom/{id}/` - Get classroom details
- `POST /api/classroom/register/` - Create new classroom

#### Student/Tutor Endpoints
- `GET /api/students/details/{id}/` - Get student details
- `GET /api/tutors/details/{id}/` - Get tutor details
- `GET /api/tutors/students/all/` - Get all students for tutor

#### Homework Endpoints
- `GET /api/homeworks/` - List user's homework
- `GET /api/homeworks/{id}/` - Get homework details
- `GET /api/homeworks/classroom/{id}/` - Get classroom homework
- `POST /api/homeworks/classroom/{id}/assign/` - Create homework

#### Chat Endpoints
- `POST /api/ws-ticket/` - Get WebSocket authentication ticket
- `GET /api/chat/start/{userType}/{userId}/` - Start chat conversation
- `GET /api/conversations/{id}/messages/` - Get message history

#### WebSocket Endpoints
- `ws://localhost:8000/ws/chat/{conversationId}/?ticket={ticket}` - Real-time chat

## 🎯 Key Features Explained

### Real-time Chat System
The chat system uses WebSocket connections for instant messaging:

1. **Authentication**: Uses JWT-based ticket system for WebSocket auth
2. **Echo Prevention**: Advanced algorithms prevent message duplication
3. **Connection Management**: Automatic reconnection and status monitoring
4. **Message History**: Persistent storage and retrieval of chat history
5. **Cross-role Communication**: Students and tutors can message each other

### Homework Management
Comprehensive assignment system:

1. **Creation**: Tutors create assignments with descriptions and due dates
2. **File Attachments**: Support for uploading assignment files
3. **Classroom Assignment**: Assign homework to specific classrooms
4. **Progress Tracking**: Monitor submission status and deadlines
5. **Optional Assignments**: Flexible assignment types

### Classroom Organization
Structured learning environment:

1. **Subject-based**: Organize by Mathematics, English, or custom subjects
2. **Class Types**: Individual (1-on-1) or group classes
3. **Student Management**: Easy enrollment and student tracking
4. **Analytics**: Progress monitoring and engagement metrics

## 🔐 Authentication & Security

### JWT Token System
- **Access Tokens**: Short-lived tokens for API requests
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Automatic Refresh**: Seamless token renewal process
- **Secure Storage**: LocalStorage with proper cleanup

### WebSocket Security
- **Ticket-based Auth**: Secure WebSocket authentication
- **Connection Validation**: Server-side connection verification
- **Message Validation**: Content and sender verification
- **Echo Prevention**: Advanced duplicate detection

## 🧪 Development & Testing

### Test Pages
The application includes several test pages for development:

- `/test-chat` - Chat system testing
- `/test-classroom-list` - Classroom API testing
- `/test-students-api` - Student management testing
- `/test-homework-create` - Homework creation testing

### Debug Features
- **Console Logging**: Detailed operation logs
- **Debug Panels**: Development-only information displays
- **Connection Status**: Real-time connection monitoring
- **Message Tracking**: Echo prevention debugging

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Configure API endpoints for production
2. **CORS Settings**: Ensure proper cross-origin configuration
3. **WebSocket URLs**: Update WebSocket endpoints for production
4. **Error Handling**: Implement production error reporting
5. **Performance**: Optimize bundle size and loading times

### Build Process
\`\`\`bash
npm run build
npm start
\`\`\`

## 📱 Responsive Design

TutorHub is fully responsive and works on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface for smartphones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the test pages for API connectivity issues
- Review console logs for debugging information
- Ensure Django backend is running and accessible
- Verify WebSocket connections are working properly

## 🔄 Version History

### Current Version
- Real-time chat with echo prevention
- Comprehensive homework management
- Classroom organization system
- Multi-role authentication
- Responsive design
- WebSocket-based communication

---

**TutorHub** - Connecting students and tutors through technology 🎓
