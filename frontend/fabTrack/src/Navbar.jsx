// "use client";
// import "./Navbar.css";


import { useState, useRef, useEffect } from "react";
import ProfileDropdown from "./ProfileDropdown";

function Navbar({setShowProfile, user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">FabTrack</div>

        {/* Profile Button */}
        <div className="navbar-profile" ref={dropdownRef}>
          <button className="profile-button" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="profile-avatar">
              {user.profilePic ? (
                <img src={user.profilePic || "/placeholder.svg"} alt="Profile" className="avatar-img" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <span>Profile</span>
          </button>

          {showDropdown && <ProfileDropdown setShowProfile={setShowProfile} setShowDropdown={setShowDropdown} />}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
