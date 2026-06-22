import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [newFullname, setNewFullname] = useState("");
  const [newRole, setNewRole] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNewFullname(data.fullname || "");
          setNewRole(data.role || "");
        } else {
          console.log("User not found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const formattedName = newFullname
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      await updateDoc(doc(db, "users", user.uid), {
        fullname: formattedName,
        role: newRole,
      });

      setMessage("Profile updated successfully 🎉");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile ❌");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="mx-20 bg-white mb-36 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-4">Settings</h2>

      {message && (
        <p className="text-center text-sm text-green-600 mb-4">{message}</p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            value={newFullname}
            onChange={(e) => setNewFullname(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Role</label>
          <select
            required
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select role</option>
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Founder">Founder</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Settings;
