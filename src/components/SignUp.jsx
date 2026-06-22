import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Info, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import homepageBg from "../assets/School-bg.jpg";
import { auth, db } from "../firebase";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    department: "",
    level: "",
    studentId: "",
    staffId: "",
    position: "",
    adminId: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({});

    const { fullname, email, password, confirmPassword, role } = formData;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};

    if (!fullname.trim()) newErrors.fullname = "Full name is required";
    if (!emailPattern.test(email.trim()))
      newErrors.email = "Enter a valid email";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (role === "Student") {
      if (!formData.department.trim())
        newErrors.department = "Department is required";
      if (!formData.level.trim()) newErrors.level = "Level is required";
      if (!formData.studentId.trim())
        newErrors.studentId = "Student ID is required";
    } else if (role === "Staff") {
      if (!formData.department.trim())
        newErrors.department = "Department is required";
      if (!formData.staffId.trim()) newErrors.staffId = "Staff ID is required";
      if (!formData.position.trim())
        newErrors.position = "Position is required";
    } else if (role === "Admin" && !formData.adminId.trim()) {
      newErrors.adminId = "Admin ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredentials.user;

      await setDoc(doc(db, "users", user.uid), {
        fullname: fullname.trim(),
        email: email.trim(),
        role,
        department: formData.department.trim() || null,
        level: formData.level.trim() || null,
        studentId: formData.studentId.trim() || null,
        staffId: formData.staffId.trim() || null,
        position: formData.position.trim() || null,
        adminId: formData.adminId.trim() || null,
        createdAt: new Date(),
      });

      await sendEmailVerification(user);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setErrors({
        general:
          err.message || "Something went wrong while creating your account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      {showSuccessModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <h3 className="text-xl font-semibold text-green-700">
              Signup Completed
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your account has been created successfully.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/login", { replace: true });
              }}
              className="mt-4 w-full rounded bg-[#0f9c37] px-4 py-2 font-semibold text-white hover:bg-[#106e1d]"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSignUp}
        className="mx-5 mt-5 w-full max-w-md rounded bg-white p-8 text-gray-900 shadow-2xl"
      >
        <h2 className="text-center text-xl font-bold uppercase">
          Admission Portal
        </h2>

        <div className="mb-8 mt-3 flex items-center gap-5 rounded-md border-l-4 border-l-[#ff9500] bg-[#ffaa33] px-4 py-4 shadow-md">
          <span className="text-[#663c00]">
            <Info size={50} />
          </span>
          <div>
            <h4 className="mb-3 text-2xl font-semibold lg:text-lg">Notice:</h4>
            <p className="text-[12px] text-[#8e580d]">
              Sign up with your information as shown on your certificate.
            </p>
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold uppercase">
          Create Account
        </h2>

        {errors.general && (
          <p className="mb-2 text-sm text-red-500">{errors.general}</p>
        )}

        <label className="mb-1 block">Full Name</label>
        <input
          onChange={handleChange}
          value={formData.fullname}
          name="fullname"
          className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-sm text-red-700"
          type="text"
          placeholder="Enter Full Name"
        />
        {errors.fullname && (
          <p className="mb-2 text-sm text-red-500">{errors.fullname}</p>
        )}

        <label className="mb-1 block">Email Address</label>
        <input
          value={formData.email}
          onChange={handleChange}
          name="email"
          className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
          type="email"
          placeholder="Enter Email"
        />
        {errors.email && (
          <p className="mb-2 text-sm text-red-500">{errors.email}</p>
        )}

        <label className="mb-1 block">Create Password</label>
        <input
          onChange={handleChange}
          name="password"
          value={formData.password}
          className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
          type="password"
          placeholder="Create New Password"
        />
        {errors.password && (
          <p className="mb-2 text-sm text-red-500">{errors.password}</p>
        )}

        <label className="mb-1 block">Confirm Password</label>
        <input
          onChange={handleChange}
          value={formData.confirmPassword}
          name="confirmPassword"
          className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
          type="password"
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && (
          <p className="mb-2 text-sm text-red-500">{errors.confirmPassword}</p>
        )}

        <label className="mb-1 block">Role</label>
        <select
          value={formData.role}
          name="role"
          onChange={handleChange}
          className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-gray-700"
        >
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>

        {formData.role === "Student" && (
          <>
            <label className="mb-1 block">Department</label>
            <input
              name="department"
              onChange={handleChange}
              value={formData.department}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Department"
            />
            {errors.department && (
              <p className="mb-2 text-sm text-red-500">{errors.department}</p>
            )}

            <label className="mb-1 block">Level</label>
            <input
              name="level"
              onChange={handleChange}
              value={formData.level}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Level"
            />
            {errors.level && (
              <p className="mb-2 text-sm text-red-500">{errors.level}</p>
            )}

            <label className="mb-1 block">Student ID</label>
            <input
              name="studentId"
              onChange={handleChange}
              value={formData.studentId}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Student ID"
            />
            {errors.studentId && (
              <p className="mb-2 text-sm text-red-500">{errors.studentId}</p>
            )}
          </>
        )}

        {formData.role === "Staff" && (
          <>
            <label className="mb-1 block">Department</label>
            <input
              name="department"
              onChange={handleChange}
              value={formData.department}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Department"
            />
            {errors.department && (
              <p className="mb-2 text-sm text-red-500">{errors.department}</p>
            )}

            <label className="mb-1 block">Staff ID</label>
            <input
              name="staffId"
              onChange={handleChange}
              value={formData.staffId}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Staff ID"
            />
            {errors.staffId && (
              <p className="mb-2 text-sm text-red-500">{errors.staffId}</p>
            )}

            <label className="mb-1 block">Position</label>
            <input
              name="position"
              onChange={handleChange}
              value={formData.position}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Position"
            />
            {errors.position && (
              <p className="mb-2 text-sm text-red-500">{errors.position}</p>
            )}
          </>
        )}

        {formData.role === "Admin" && (
          <>
            <label className="mb-1 block">Admin ID</label>
            <input
              name="adminId"
              onChange={handleChange}
              value={formData.adminId}
              className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-red-700"
              placeholder="Enter Admin ID"
            />
            {errors.adminId && (
              <p className="mb-2 text-sm text-red-500">{errors.adminId}</p>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-5 w-full rounded px-2 py-1 text-white transition duration-500 ease-in-out ${
            loading
              ? "cursor-not-allowed bg-[#0f9c37]"
              : "bg-[#0f9c37] font-bold hover:bg-[#106e1d]"
          }`}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="mt-4 flex items-center justify-between gap-5">
          <p className="mt-4 text-center lg:text-sm">
            Already have an account?
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex w-full items-center justify-between rounded-lg bg-[#17b6a4] px-2 py-2"
          >
            <span className="text-lg font-bold text-white">Sign In</span>
            <span className="font-bold text-white">
              <UserPlus />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
