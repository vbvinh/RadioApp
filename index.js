import React, { useState } from 'react';
import SearchComponentSrape from "../Fetch/fetchScrape.js";
import SearchComponentIP from "../Fetch/fetchIP.js";
import { userData } from "../../helpers";

const Home = () => {
  const { username } = userData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`d-flex ${isSidebarOpen ? 'toggled' : ''}`} id="wrapper">
      <div className="bg-white" id="sidebar-wrapper">
        <div className="sidebar-heading text-center py-4 primary-text fs-4 fw-bold text-uppercase border-bottom">
          <i className="fa-solid fa-signal"></i> Radio app
        </div>
        <div className="list-group list-group-flush my-3">
          <a href="/home" className="list-group-item list-group-item-action bg-transparent second-text fw-bold"><i className="fas fa-tachometer-alt me-2"></i>Home</a>
          <a href="/antenna" className="list-group-item list-group-item-action bg-transparent second-text fw-bold"><i className="fas fa-tower-cell me-3"></i>Antena</a>
          <a href="/hardware" className="list-group-item list-group-item-action bg-transparent second-text fw-bold"><i className="fas fa-comment-dots me-2"></i>Hardware</a>
          <a href="/logout" className="list-group-item list-group-item-action bg-transparent text-danger fw-bold"><i className="fas fa-power-off me-2"></i>Logout</a>
        </div>
      </div>
      <div id="page-content-wrapper">
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
          <div className="d-flex align-items-center">
            <i className="fas fa-align-left primary-text fs-4 me-3" onClick={toggleSidebar} id="menu-toggle"></i>
            <h2 className="fs-2 m-0">Dashboard</h2>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle second-text fw-bold" href="/logout" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fas fa-user me-2"></i>{username}
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li><a className="dropdown-item" href="/logout">Logout</a></li>
                  <li><a className="dropdown-item" href="/user/profile">Profile</a></li>
                  <li><a className="dropdown-item" href="/user/settings">Settings</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container-fluid">
          <div className="row">
            <SearchComponentIP />
            <SearchComponentSrape />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
