import { useState } from "react";

type Props = { onSignIn: () => void };
const baseApi = "http://localhost:3001/sign";

const SignUpForm = ({ onSignIn }: Props) => {
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    fetch(`${baseApi}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(fields),
    }).then((res) => {
      if (res.ok) return res.json();
      throw res;
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
                  name="username"
                  onChange={handleChange}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                />
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
                  name="password"
                  onChange={handleChange}
                  placeholder="Password"
                />
              </div>
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="checkbox-sign"
                />
                <label className="form-check-label" htmlFor="checkbox-sign">
                  I agree to the terms and conditions of{" "}
                  <span className="fw-bold">VITOMATE Subscriber Agreement</span>{" "}
                  and the Vitomate privacy policy.
                </label>
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
