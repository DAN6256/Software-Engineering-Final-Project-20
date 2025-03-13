import React, { useState } from "react";
import "../css_files/App.css"; // Import new CSS file

const App = () => {
  const [showModal, setShowModal] = useState(null); // Track which modal is open

  return (
    <div className="container">
      {/* <Header /> */}
      <main>
        <h1>Welcome to FabTrack</h1>
        <p>Your Fab Lab booking platform</p>

        <section>
          <h3>With FabTrack, You can:</h3>
          <ul>
            <li><h3>Borrow an equipment from the Fab Lab</h3></li>
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

      {/* <Footer /> */}
    </div>
  );
};

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
