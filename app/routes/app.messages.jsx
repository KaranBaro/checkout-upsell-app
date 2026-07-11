import MessageFilters from "../components/Messages/MessageFilters";
import MessageTable from "../components/Messages/MessageTable";
import { useState } from "react";
import { useOutletContext } from "react-router";
import MessageForm from "../components/Messages/MessageForm";

export default function Messages() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const { messages, setMessages, shop } = useOutletContext();

  const persistMessages = async (nextMessages) => {
    setMessages(nextMessages);

    try {
      await fetch("/api/checkout-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, messages: nextMessages }),
      });
    } catch (error) {
      console.error("Failed to save checkout messages:", error);
    }
  };

  const handleSaveMessage = (newMessage) => {
    const nextMessages = editingMessage
      ? messages.map((message) =>
          message.id === newMessage.id ? newMessage : message,
        )
      : [...messages, newMessage];

    persistMessages(nextMessages);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMessage(null);
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        {isFormOpen && (
          <MessageForm
            onSave={handleSaveMessage}
            onClose={handleCloseForm}
            initialMessage={editingMessage}
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            Checkout Messages
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            Create and manage checkout messages
          </p>
        </div>

        <button
            onClick={() => {
              setEditingMessage(null);
              setIsFormOpen(true);
            }}
            style={{
                background: "#111827",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                cursor: "pointer",
            }}
            >
            + Create Message
        </button>
      </div>

      <MessageFilters />
      <MessageTable
        messages={messages}
        onEdit={(message) => {
          setEditingMessage(message);
          setIsFormOpen(true);
        }}
        onDelete={(messageId) => {
          persistMessages(
            messages.filter((message) => message.id !== messageId),
          );
        }}
      />
    </div>
    </div>
  );
}
