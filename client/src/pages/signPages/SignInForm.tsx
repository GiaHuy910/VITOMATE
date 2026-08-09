import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = { onSignUp: () => void };
const baseApi = "http://localhost:3001/sign";

const SignInForm = ({ onSignUp }: Props) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
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

  const handleSignIn = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    fetch(`${baseApi}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(fields),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((data) => {
        navigate("/", { state: { user: data.user } });
      });
  };

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 d-flex justify-content-center">
            <form
              onSubmit={handleSignIn}
              className="sign-form p-4 p-md-5 bg-white border rounded shadow-sm"
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
              {/* error */}
              {error && <p className="text-danger mb-3">{error}</p>}

              <button type="submit" className="btn btn-primary w-100">
                SIGN UP
              </button>
              <span>
                Create an account?{" "}
                <button
                  type="button"
                  onClick={onSignUp}
                  className="btn btn-link p-0"
                >
                  SIGN UP
                </button>
              </span>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
