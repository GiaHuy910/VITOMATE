const GitProvider = () => {
  const handleGitProvider = () => {};
  return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100">
      <div className="fs-4 fw-bold my-1">Connect to Git Provider</div>
      <div className="fs-6 my-1">
        Connect to Git provider to deploy your existing repositories
      </div>
      <div className="btn btn-dark my-2" onClick={handleGitProvider}>
        Github
      </div>
    </div>
  );
};

export default GitProvider;
