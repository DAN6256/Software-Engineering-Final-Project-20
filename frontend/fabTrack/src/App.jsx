import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ProfileView from "./ProfileView";
import "./index.css";

function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [showModal, setShowModal] = useState(null); // Track which modal is open
  const [user, setUser] = useState({
    name: "John Doe",
    major: "Computer Science",
    yearGroup: "2025",
    profilePic: null,
  });

  const handleProfileUpdate = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  return (
    <div className="app-container">
      <Navbar showProfile={showProfile} setShowProfile={setShowProfile} user={user} />
      <main className="main-content">
        {showProfile ? (
          <ProfileView user={user} onUpdateUser={handleProfileUpdate} onClose={() => setShowProfile(false)} />
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold text-dark">Welcome to FabTrack</h1>
            <p className="mt-4 text-dark">Your Fab Lab booking platform</p>

            <section>
              <h3>With FabTrack, You can:</h3>
              <ul>
                <li><h3>Borrow equipment from the Fab Lab</h3></li>
                <li><h3>Manage and track your borrowed equipment</h3></li>
              </ul>

              {/* Register & Log In - Side by Side */}
              <div className="register-login-container">
                <div>
                  <button onClick={() => setShowModal("register")} className="button">Register</button>
                  <p>Register to book a Fab Lab</p>
                </div>
                <div>
                  <button onClick={() => setShowModal("login")} className="button">Log in</button>
                  <p>Already have an account? Log in here</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Register Modal */}
      {showModal === "register" && (
        <Modal title="Register" onClose={() => setShowModal(null)}>
          <form className="form-container">
            <input type="text" placeholder="Full Name" className="input-field" required />
            <input type="email" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Password" className="input-field" required />
            <button type="submit" className="submit-button">Sign Up</button>
          </form>
        </Modal>
      )}

      {/* Login Modal */}
      {showModal === "login" && (
        <Modal title="Log In" onClose={() => setShowModal(null)}>
          <form className="form-container">
            <input type="email" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Password" className="input-field" required />
            <button type="submit" className="submit-button">Log In</button>
          </form>
        </Modal>
      )}

      <Footer />
    </div>
  );
}

// Reusable Modal Component
const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default App;
