import Picker from "emoji-picker-react";

function EmojiPicker({ onEmojiClick }) {
  return (
    <div className="absolute bottom-16 left-0 z-50">
      <Picker
        onEmojiClick={(emojiData) =>
          onEmojiClick(emojiData.emoji)
        }
        theme="dark"
      />
    </div>
  );
}

export default EmojiPicker;