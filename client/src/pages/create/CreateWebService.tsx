import { useAuth } from "../../contexts/useAuth";

const CreateWebService = () => {
  const { user } = useAuth();

  return (
    <div className="flex-basic-between">
      <h1>CreateWebService</h1>
    </div>
  );
};

export default CreateWebService;
