import { useState } from "react";
import SignUpForm from "./SignUpForm";
import SignInForm from "./SignInForm";

const SignPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  return (
    <>
      {isSignUp ? (
        <SignUpForm onSignIn={() => setIsSignUp(false)} />
      ) : (
        <SignInForm onSignUp={() => setIsSignUp(true)} />
      )}
    </>
  );
};

export default SignPage;
