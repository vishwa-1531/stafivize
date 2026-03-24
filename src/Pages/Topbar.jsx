import React, { useMemo, useState } from "react";
import { FaBell, FaQuestionCircle } from "react-icons/fa";

const Topbar = ({
  mainTitle = "DASHBOARD",
  section = "OVERVIEW",
  notifications = [],
  helpItems = []
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const finalNotifications = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications;
    }

    return [
      { id: "empty", text: "No new notifications" }
    ];
  }, [notifications]);

  const finalHelpItems = useMemo(() => {
    if (helpItems && helpItems.length > 0) {
      return helpItems;
    }

    return [
      "No help content available for this page."
    ];
  }, [helpItems]);

 const handleBellClick = () => {
  setShowNotifications((prev) => !prev);
  setShowHelp(false);

  
  setHasUnreadNotifications(false);
};

  const handleHelpClick = () => {
    setShowHelp((prev) => !prev);
    setShowNotifications(false);
  };

  return (
    <div className="reports-topbar">
      <div className="reports-breadcrumb">
        {mainTitle} / <span>{section}</span>
      </div>

      <div className="reports-topbar-icons">
        <div className="topbar-icon-wrapper">
          <button
            className="top-icon-btn"
            type="button"
            aria-label="Notifications"
            onClick={handleBellClick}
          >
            <FaBell />
            {hasUnreadNotifications && (
  <span className="notification-dot"></span>
)}
          </button>

          {showNotifications && (
            <div className="topbar-dropdown notifications-dropdown">
              <h4>Notifications</h4>
              {finalNotifications.map((item) => (
                <p key={item.id}>{item.text}</p>
              ))}
            </div>
          )}
        </div>

        <div className="topbar-icon-wrapper">
          <button
            className="top-icon-btn"
            type="button"
            aria-label="Help"
            onClick={handleHelpClick}
          >
            <FaQuestionCircle />
          </button>

          {showHelp && (
            <div className="topbar-dropdown help-dropdown">
              <h4>Help</h4>
              {finalHelpItems.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;