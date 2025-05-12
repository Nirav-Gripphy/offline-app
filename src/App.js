import "./App.css";
import { useEffect, useState } from "react";
import QrScanner from "./QrScanner";

// Register service worker outside of the component
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) =>
        console.log("Service Worker registered with scope:", registration.scope)
      )
      .catch((error) =>
        console.log("Service Worker registration failed:", error)
      );
  });
}

// Prevent hard refresh shortcuts (Ctrl+Shift+R, Cmd+Shift+R)
document.addEventListener("keydown", (e) => {
  // Check for Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "R") {
    e.preventDefault();
    console.log("Hard refresh prevented in offline mode");

    // Optional: Show a message to the user
    const offlineMessage =
      document.getElementById("offline-message") || createOfflineMessage();
    offlineMessage.style.display = "block";

    // Hide the message after 3 seconds
    setTimeout(() => {
      offlineMessage.style.display = "none";
    }, 3000);
  }
});

// Create a message element for offline mode notifications
function createOfflineMessage() {
  const messageDiv = document.createElement("div");
  messageDiv.id = "offline-message";
  messageDiv.style.position = "fixed";
  messageDiv.style.top = "10px";
  messageDiv.style.left = "50%";
  messageDiv.style.transform = "translateX(-50%)";
  messageDiv.style.backgroundColor = "#f8d7da";
  messageDiv.style.color = "#721c24";
  messageDiv.style.padding = "10px 20px";
  messageDiv.style.borderRadius = "5px";
  messageDiv.style.zIndex = "9999";
  messageDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  messageDiv.style.display = "none";
  messageDiv.textContent = "Hard refresh disabled in offline mode";
  document.body.appendChild(messageDiv);
  return messageDiv;
}

function App() {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });

  // State for all submissions
  const [submissions, setSubmissions] = useState([]);

  // State to control which view to show (form or details)
  const [currentView, setCurrentView] = useState("form");

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("formSubmissions");
    if (storedData) {
      setSubmissions(JSON.parse(storedData));
    }
  }, []);

  // Add offline status checking
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Save to localStorage whenever submissions change
  useEffect(() => {
    if (submissions.length > 0) {
      localStorage.setItem("formSubmissions", JSON.stringify(submissions));
    }
  }, [submissions]);

  // Helper function to ensure data is properly stored
  const saveToLocalStorage = (data) => {
    localStorage.setItem("formSubmissions", JSON.stringify(data));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.mobile.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Create new submission with unique ID
    const newSubmission = {
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleString(),
    };

    // Add to submissions array and save directly to localStorage
    const updatedSubmissions = [...submissions, newSubmission];
    setSubmissions(updatedSubmissions);
    saveToLocalStorage(updatedSubmissions);

    // Reset form
    setFormData({
      name: "",
      mobile: "",
    });

    alert("Form submitted successfully!");
  };

  const handleSubmitScan = (data) => {

    console.log("Heererererererrere", data)
    // Validate form
    if (!data.name.trim()) {
      alert("QR or Bar Code is blank");
      return;
    }

    // Create new submission with unique ID
    const newSubmission = {
      id: Date.now(),
      ...data,
      date: new Date().toLocaleString(),
    };

    // Add to submissions array and save directly to localStorage
    const updatedSubmissions = [...submissions, newSubmission];
    setSubmissions(updatedSubmissions);
    saveToLocalStorage(updatedSubmissions);

    alert("Form submitted successfully!");
  };

  // Delete a submission
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      const updatedSubmissions = submissions.filter((item) => item.id !== id);
      setSubmissions(updatedSubmissions);
      saveToLocalStorage(updatedSubmissions);
    }
  };

  // Edit a submission
  const handleEdit = (submission) => {
    setFormData({
      name: submission.name,
      mobile: submission.mobile,
    });
    setCurrentView("form");

    // Remove the edited submission
    const updatedSubmissions = submissions.filter(
      (item) => item.id !== submission.id
    );
    setSubmissions(updatedSubmissions);
    saveToLocalStorage(updatedSubmissions);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Form Management App</h1>

      {/* Online/Offline indicator */}
      <div
        className={`alert ${isOnline ? "alert-success" : "alert-danger"} mb-3`}
        role="alert"
      >
        <strong>Status:</strong> {isOnline ? "Online" : "Offline"} Mode
        {!isOnline && (
          <p className="mb-0 small">
            Hard refresh (Ctrl+Shift+R/⌘+Shift+R) is disabled in offline mode
          </p>
        )}
      </div>

      {/* View toggle buttons */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${
                currentView === "form" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCurrentView("form")}
            >
              Fill Form
            </button>
            <button
              type="button"
              className={`btn ${
                currentView === "details"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setCurrentView("details")}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Show form or details based on currentView */}
      {currentView === "form" ? (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Fill Form</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mobile" className="form-label">
                      Mobile
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">View Details</h4>
              </div>
              <div className="card-body">
                {submissions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Submission Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr key={submission.id}>
                            <td>{submission.name}</td>
                            <td>{submission.mobile}</td>
                            <td>{submission.date}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => handleEdit(submission)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(submission.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No submissions yet. Please fill the form to add data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <QrScanner handleSubmitScan={handleSubmitScan} />
    </div>

    // <div className="App">
    //   <div
    //     className="d-flex justify-content-center align-items-center gap-2"
    //     style={{
    //       height: "100px",
    //     }}
    //   >
    //     <button
    //       className="btn btn-primary"
    //       disabled={type == "list"}
    //       onClick={() => {
    //         setType("list");
    //       }}
    //     >
    //       View Details
    //     </button>
    //     <button
    //       className="btn btn-primary"
    //       disabled={type == "form"}
    //       onClick={() => {
    //         setType("form");
    //       }}
    //     >
    //       Fill Form
    //     </button>
    //   </div>

    //   {type == "list" && (
    //     <div className="mt-3 container">
    //       <table class="table">
    //         <thead>
    //           <tr>
    //             <th scope="col">#</th>
    //             <th scope="col">First</th>
    //             <th scope="col">Last</th>
    //             <th scope="col">Handle</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           <tr>
    //             <th scope="row">1</th>
    //             <td>Mark</td>
    //             <td>Otto</td>
    //             <td>@mdo</td>
    //           </tr>
    //           <tr>
    //             <th scope="row">2</th>
    //             <td>Jacob</td>
    //             <td>Thornton</td>
    //             <td>@fat</td>
    //           </tr>
    //         </tbody>
    //       </table>
    //     </div>
    //   )}

    //   {type == "form" && (
    //     <div className="mt-3 container ">
    //       <form>
    //         <div class="mb-3">
    //           <label for="exampleInputEmail1" class="form-label">
    //             Email address
    //           </label>
    //           <input
    //             type="email"
    //             class="form-control"
    //             id="exampleInputEmail1"
    //             aria-describedby="emailHelp"
    //           />
    //           <div id="emailHelp" class="form-text">
    //             We'll never share your email with anyone else.
    //           </div>
    //         </div>
    //         <div class="mb-3">
    //           <label for="exampleInputPassword1" class="form-label">
    //             Password
    //           </label>
    //           <input
    //             type="password"
    //             class="form-control"
    //             id="exampleInputPassword1"
    //           />
    //         </div>
    //         <div class="mb-3 form-check">
    //           <input
    //             type="checkbox"
    //             class="form-check-input"
    //             id="exampleCheck1"
    //           />
    //           <label class="form-check-label" for="exampleCheck1">
    //             Check me out
    //           </label>
    //         </div>
    //         <button type="submit" class="btn btn-primary">
    //           Submit
    //         </button>
    //       </form>
    //     </div>
    //   )}
    //   {/* <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header> */}
    // </div>
  );
}

export default App;
