import { StartChatButton } from "@/components/chat/StartChatButton"

// Assuming this is a basic structure for the tutor page
const TutorPage = ({ tutor }) => {
  return (
    <div>
      <h1>{tutor.name}</h1>
      <p>Email: {tutor.email}</p>
      <div className="flex gap-2">
        <StartChatButton
          userType="tutor"
          userId={tutor.id}
          userName={tutor.user.username}
          variant="default"
          size="sm"
        />
      </div>
      {/* Additional tutor details can be added here */}
    </div>
  )
}

export default TutorPage
