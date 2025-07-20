// src/components/buttons/SignInButton.jsx
import CustomButton from "./CustomButton";

export default function SignInButton({ onClick }) {
  return (
    <CustomButton
      onClick={onClick}
      className="text-blue-700 hover:text-blue-900 bg-transparent"
    >
      Sign In
    </CustomButton>
  );
}
