import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/auth/useAuth";
import { getGithubUrl, signInUser } from "../../api/auth";

type Props = { onSignUp: () => void };

const SignInForm = ({ onSignUp }: Props) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const { setUser } = useAuth();

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email is required";
    }
    return "";
  };
  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return "Password is required";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));

    switch (name) {
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        break;
      case "password":
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
        break;
    }
  };
  const handleSignWithGithub = () => {
    window.location.href = getGithubUrl();
  };

  const handleSignIn = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const newErrors = {
      email: validateEmail(fields.email),
      password: validatePassword(fields.password),
    };
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some((message) => message !== "");
    if (hasError) {
      setError("All information is required !");
      return;
    }

    try {
      const data = await signInUser(fields.email, fields.password);
      setUser(data.user);
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed");
    }
  };

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 d-flex justify-content-center">
            <form
              onSubmit={handleSignIn}
              className="sign-form my-5 p-4 p-md-5 border rounded shadow-sm"
            >
              <h2 className="fw-bold text-center mb-4">SIGN IN</h2>
              <div className="form-group mb-3">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Password"
                />
                {errors.password && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </div>
              {error && <div className="invalid-feedback d-block">{error}</div>}
              <div>
                <button type="submit" className="btn btn-primary w-100 my-2">
                  SIGN UP
                </button>
                <span>
                  Create an account?{" "}
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="btn btn-link p-0 my-2"
                  >
                    SIGN UP
                  </button>
                </span>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary my-2"
                  onClick={handleSignWithGithub}
                >
                  Continue with GitHub
                </button>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={handleSignWithGithub}
                >
                  Continue with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
