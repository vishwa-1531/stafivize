import React from "react";
import "../css/Topbar.css";
import{
  FaBell,
  FaQuestionCircle

} from  "react-icons/fa";

function Topbar() {
  return (
   <div className="small-topbar">
  <FaBell className="top-icon" />
  <FaQuestionCircle className="top-icon" />
</div>
  )
}

export default Topbar;

