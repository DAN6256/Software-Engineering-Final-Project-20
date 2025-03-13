
// import "./Footer.css";
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} FabTrack. All rights reserved.</p>
        <p className="footer-subtext">Your Fab Lab Booking Platform</p>
      </div>
    </footer>
  );
}

export default Footer;
