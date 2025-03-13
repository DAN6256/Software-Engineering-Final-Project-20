// import "./ProfileView.css";

import { useState, useRef } from "react";

function ProfileView({ user, onUpdateUser, onClose }) {
  const [name, setName] = useState(user.name);
  const [major, setMajor] = useState(user.major);
  const [yearGroup, setYearGroup] = useState(user.yearGroup);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({ name, major, yearGroup });
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={onClose} className="close-button">X</button>
      </div>

      {/* Avatar with clickable file input */}
      <div className="profile-avatar-large" onClick={() => fileInputRef.current.click()}>
        {user.profilePic ? (
          <img src={user.profilePic} alt="Profile" className="avatar-img" />
        ) : (
          user.name.charAt(0)
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
      />

      {/* Form fields */}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Major</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Year Group</label>
          <input
            type="text"
            value={yearGroup}
            onChange={(e) => setYearGroup(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" className="save-button">Save Changes</button>
      </form>
    </div>
  );
}

export default ProfileView;