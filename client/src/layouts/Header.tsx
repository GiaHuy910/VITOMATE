import { Link } from "react-router-dom";
import ButtonField from "../components/ButtonField";
const Header = () => {
  return (
    <div className="flex-basic-between" style={{ padding: "1.5rem 4rem" }}>
      <div style={{ fontSize: "40px", fontWeight: 600 }}>VITOMATE</div>
      <ButtonField>
        <Link to=""> Create a new Service </Link>
      </ButtonField>
    </div>
  );
};

export default Header;
