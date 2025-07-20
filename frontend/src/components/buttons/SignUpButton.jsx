// src/components/buttons/SignUpButton.jsx
import CustomButton from "./CustomButton";

export default function SignUpButton({ onClick }) {
  return (
    <CustomButton
      onClick={onClick}
      className="bg-blue-600 text-white hover:bg-blue-700"
    >
      Sign Up
    </CustomButton>
  );
}
