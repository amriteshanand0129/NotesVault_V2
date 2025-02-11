import { useMessage } from "../context/messageContext";
import { X } from "lucide-react";

const MessageBar = () => {
  const { message, clearMessage } = useMessage();

  if (!message) return null;

  return (
    <div
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-3
        ${
          message.type === "error"
            ? "bg-red-500"
            : message.type === "success"
            ? "bg-green-500"
            : "bg-amber-400"
        }`}
      style={{ zIndex: 1000 }}
    >
      <span>{message.text}</span>
      <button onClick={() => clearMessage()} className="text-white">
        <X size={18} />
      </button>
    </div>
  );
};

export default MessageBar;
