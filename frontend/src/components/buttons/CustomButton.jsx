// src/components/buttons/CustomButton.jsx
export default function CustomButton({ children, className = "", onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
