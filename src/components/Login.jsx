import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Info, Lock, Mail, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import homepageBg from "../assets/School-bg.jpg";
import { auth } from "../firebase";
import { logActivity } from "../Utils/activityServices";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password,
      );

      await logActivity(userCredential.user.uid, "User logged in successfully");
      setMessage("Logged in successfully 🎉");

      setTimeout(() => {
        setMessage("");
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (err) {
      const errorCode = err.code || "";

      if (errorCode === "auth/user-not-found") {
        setErrors({ email: "No user found with this email" });
      } else if (
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/invalid-credential"
      ) {
        setErrors({ password: "Incorrect password" });
      } else if (errorCode === "auth/too-many-requests") {
        setErrors({
          email: "Too many failed attempts. Please try again later.",
        });
      } else {
        setErrors({ email: "Failed to log in. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-center relative flex justify-center items-center"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <div className="absolute inset-0 bg-white opacity-70" />
      {message && (
        <>
          <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-sm transition-all duration-300" />
          <div className="absolute z-20 rounded-lg border border-green-200 bg-green-100 px-6 py-4 text-center text-gray-700 shadow-lg animate-fade-in">
            <p>{message}</p>
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className="z-10 mx-5 w-full max-w-md rounded bg-white px-6 py-4 text-gray-900 shadow-2xl"
      >
        <h2 className="text-center text-xl font-bold uppercase">
          Admission Portal
        </h2>
        <div className="mb-8 mt-3 flex items-center gap-5 rounded-md border-l-4 border-l-[#ff9500] bg-[#ffaa33] px-4 py-4 shadow-md">
          <span className="text-[#663c00]">
            <Info size={50} />
          </span>
          <div>
            <h4 className="mb-1 text-2xl font-bold text-[#663c00] lg:text-lg">
              Notice:
            </h4>
            <p className="text-[12px] text-[#8e580d]">
              Enter the email address and password provided during sign-up. If
              you do not have an account, use the sign-up option below.
            </p>
          </div>
        </div>

        <div className="relative">
          <h2 className="mb-4 text-lg font-bold uppercase lg:mb-1">Log In</h2>
          <span className="absolute right-1 top-0 p-1 font-bold text-gray-950">
            <Lock />
          </span>
        </div>

        <div className="relative">
          <label className="mb-1 block">Email</label>
          <input
            onChange={handleChange}
            className="mb-2 w-full rounded border border-gray-700 px-2 py-1 text-gray-700"
            type="email"
            value={formData.email}
            name="email"
            placeholder="Enter Your Email"
          />
          <p className="absolute right-3 top-8 text-gray-500">
            <Mail />
          </p>
          {errors.email && (
            <p className="mb-2 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="relative">
          <label className="mb-1 block">Password</label>
          <input
            onChange={handleChange}
            value={formData.password}
            className="mb-7 w-full rounded border border-gray-700 px-2 py-1 text-gray-700 lg:mb-2"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Your Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && (
            <p className="mb-2 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded py-2 text-lg text-white transition duration-500 ease-in-out ${
            loading
              ? "cursor-not-allowed bg-[#0f9c37]"
              : "bg-[#0f9c37] hover:bg-[#106e1d]"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="mt-4 flex items-center justify-between gap-5">
          <p className="mt-2 text-center text-sm">Don't have an account yet?</p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="flex w-full items-center justify-between rounded-lg bg-[#17b6a4] px-2 py-2 md:max-w-40 lg:max-w-48"
          >
            <span className="text-lg font-bold text-white">Sign Up</span>
            <span className="font-bold text-white">
              <UserPlus />
            </span>
          </button>
        </div>

        <p className="mb-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-700 hover:underline"
          >
            Forgot Password?
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
