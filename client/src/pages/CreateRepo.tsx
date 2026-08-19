import { useAuth } from "../contexts/useAuth";

const CreateRepo = () => {
  const { user, loading } = useAuth();

  return (
    <div className="flex-basic-between">
      <h1>CreateRepo</h1>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <h2>Welcome, {user.username}</h2>
      ) : (
        <p>You have not signed in yet!</p>
      )}
    </div>
  );
};

export default CreateRepo;
