import { useTheme } from "../../../contexts/theme/useTheme";
import { updateTheme } from "../../../api/users";

const themes = [
  {
    value: "Dark",
    icon: "bi-moon",
  },
  {
    value: "System",
    icon: "bi-gear",
  },
  {
    value: "Light",
    icon: "bi-brightness-high",
  },
] as const;
type ThemeType = (typeof themes)[number]["value"];

const Theme = () => {
  const { theme, setTheme } = useTheme();

  const handleChangeTheme = async (value: ThemeType) => {
    const previousTheme = theme;
    try {
      setTheme(value);
      await updateTheme(value);
    } catch (error) {
      setTheme(previousTheme);
      console.error("Failed to update theme:", error);
    }
  };
  const currentTheme = themes.find((themeItem) => themeItem.value === theme);
  return (
    <div>
      <h3>Theme</h3>
      <div className="card-body border rounded-0">
        <div className="row align-items-start mb-4">
          <div className="col-md-4 pe-md-4">
            <div>Main Theme</div>
          </div>
          <div className="col-md-8">
            <div className="" style={{ width: "160px" }}>
              <button
                className="btn btn-outline-secondary w-100 
                d-flex rounded-0 dropdown-toggle d-flex align-items-center 
                justify-content-end "
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className={`bi ${currentTheme?.icon} pe-2`}></i>
                <div className="">{theme}</div>
                <div className="ms-auto"></div>
              </button>

              <ul className="dropdown-menu show rounded-0">
                {themes.map((themeItem) => (
                  <li key={themeItem.value}>
                    <button
                      type="button"
                      className={`dropdown-item ${theme === themeItem.value ? "active" : ""}`}
                      onClick={() => handleChangeTheme(themeItem.value)}
                    >
                      <i className={`bi ${themeItem.icon} pe-2`}></i>
                      {themeItem.value}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Theme;
