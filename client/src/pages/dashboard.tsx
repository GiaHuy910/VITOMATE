import { useLocation } from "react-router-dom";

const DashBoard = () => {
  const location = useLocation();
  const user = location.state?.user;

  return (
    <>
      <div className="flex-basic-between">
        {" "}
        <h1>DASHBOARD</h1>
        {user ? (
          <h2>Welcome, {user.username}</h2>
        ) : (
          <p>You have not sign in yet!</p>
        )}
      </div>
    </>
  );
};

export default DashBoard;
