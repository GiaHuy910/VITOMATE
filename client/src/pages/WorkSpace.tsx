import { useAuth } from "../contexts/auth/useAuth";

const WorkSpace = () => {
  const { user, loading } = useAuth();

  return (
    <div className="flex-basic-between">
      <h1>WORKSPACE</h1>

      {user ? (
        <h2>Welcome, {user.username}</h2>
      ) : (
        <p>You have not signed in yet!</p>
      )}
    </div>
  );
};

export default WorkSpace;
