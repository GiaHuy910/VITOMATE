import { useState } from "react";

type Props = { onSignIn: () => void };

const baseApi = "http://localhost:3001/auth";

const SignUpForm = ({ onSignIn }: Props) => {
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
  });
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateUsername = (value: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!value) {
      return "Username is required";
    } else if (value.length < 3) {
      return "Username must be at least 3 characters";
    } else if (value.length > 30) {
      return "Username must be at most 30 characters";
    } else if (!usernameRegex.test(value)) {
      return "Username can only contain letters, numbers and underscores";
    }
    return "";
  };
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
    if (value.length > 64) {
      return "Username must be lower than 64 characters";
    }
    return "";
  };
  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ) => {
    if (!confirmPassword) {
      return "Password is required";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
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
      case "username":
        setErrors((prev) => ({ ...prev, username: validateUsername(value) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
          confirmPassword: validateConfirmPassword(
            value,
            fields.confirmPassword,
          ),
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(fields.password, value),
        }));
        break;
    }
  };

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const newErrors = {
      username: validateUsername(fields.username),
      email: validateEmail(fields.email),
      password: validatePassword(fields.password),
      confirmPassword: validateConfirmPassword(
        fields.password,
        fields.confirmPassword,
      ),
      agreeTerms: agreeTerms
        ? ""
        : "You must agree to the terms and conditions.",
    };
    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((message) => message !== "");

    if (hasError) {
      setError("All information is required !");
      return;
    }

    const signUpData = {
      username: fields.username,
      email: fields.email,
      password: fields.password,
    };

    fetch(`${baseApi}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signUpData),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(() => {
        onSignIn();
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 d-flex justify-content-center">
            <form
              onSubmit={handleSignUp}
              className="sign-form p-4 p-md-5 bg-white border rounded shadow-sm"
            >
              <h2 className="fw-bold text-center mb-4">CREATE YOUR ACCOUNT</h2>
              <div className="form-group mb-3">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={fields.username}
                  name="username"
                  onChange={handleChange}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <div className="invalid-feedback d-block">
                    {errors.username}
                  </div>
                )}
              </div>
              <div className="form-group mb-3">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={fields.email}
                  name="email"
                  onChange={handleChange}
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email}</div>
                )}

                <small id="emailHelp" className="form-text text-muted">
                  We'll never share your email with anyone else.
                </small>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={fields.password}
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
              <div className="form-group mb-3">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={fields.confirmPassword}
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="checkbox-sign"
                  checked={agreeTerms}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAgreeTerms(checked);
                    setErrors((prev) => ({
                      ...prev,
                      agreeTerms: checked
                        ? ""
                        : "You must agree to the terms and conditions.",
                    }));
                  }}
                />
                <label className="form-check-label" htmlFor="checkbox-sign">
                  I agree to the terms and conditions of{" "}
                  <span className="fw-bold">VITOMATE Subscriber Agreement</span>{" "}
                  and the Vitomate privacy policy.
                </label>
                {errors.agreeTerms && (
                  <div className="invalid-feedback d-block">
                    {errors.agreeTerms}
                  </div>
                )}
              </div>
              {/* error */}
              {error && <p className="text-danger mb-3">{error}</p>}

              <button type="submit" className="btn btn-primary w-100">
                SIGN UP
              </button>
              <span>
                Got an account?{" "}
                <button
                  type="button"
                  onClick={onSignIn}
                  className="btn btn-link p-0"
                >
                  SIGN IN
                </button>
              </span>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpForm;
