import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { useBreadcrumb } from "../context/breadcrumbContext.jsx";
import { Link } from "react-router-dom";

const SecondaryNavbar = ({ searchCallback, message, searchPlaceholder }) => {
  const { breadcrumb, searchQuery, setSearchQuery } = useBreadcrumb();

  return (
    <div>
      <div className="bg-gray-100 p-3 flex justify-between items-center shadow-md m-auto mb-3">
        <Breadcrumbs aria-label="breadcrumb">
          {breadcrumb.map((item, index) => (
            <Link key={index} to={item.link} underline="none" className={index === breadcrumb.length - 1 ? "text-black" : "text-gray"}>
              {item.name}
            </Link>
          ))}
        </Breadcrumbs>
      </div>
      <div className="px-20 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-lg mb-2 sm:mb-0">{message}</div>
        <div className="flex items-center">
          {breadcrumb.length <= 3 && (
            <>
              <input className="border-2 border-gray-400 rounded-lg p-2 w-[280px] ml-2" type="text" placeholder={searchPlaceholder} value={searchQuery} onChange={(e) => searchCallback(e.target.value)} />
              <img src="/search.png" alt="search_logo" className="size-8" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavbar;
