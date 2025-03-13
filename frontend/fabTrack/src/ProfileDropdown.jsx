
// import "./ProfileDropdown.css";

function ProfileDropdown({ setShowProfile, setShowDropdown }) {
  const handleViewProfile = () => {
    setShowProfile(true);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    alert("Logged out successfully!");
    setShowDropdown(false);
  };

  return (
    <div className="dropdown">
      <button onClick={handleViewProfile} className="dropdown-item">
        View Profile
      </button>
      <button onClick={handleLogout} className="dropdown-item">
        Log Out
      </button>
    </div>
  );
}

export default ProfileDropdown;
