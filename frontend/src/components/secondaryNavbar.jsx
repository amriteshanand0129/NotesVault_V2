// import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { useBreadcrumb } from "../context/breadcrumbContext.jsx";
import { Link } from "react-router-dom";

const SecondaryNavbar = ({ searchCallback }) => {
  const { breadcrumb, searchQuery, setSearchQuery } = useBreadcrumb();

  return (
    <div className="bg-gray-100 p-3 flex justify-between items-center shadow-md m-auto mb-4 mt-2 rounded-3xl lg:w-1/2 sm:w-3/4">
      <Breadcrumbs aria-label="breadcrumb">
        {breadcrumb.map((item, index) => (
          <Link key={index} to={item.link} underline="none" className={index === breadcrumb.length - 1 ? "text-black" : "text-gray"}>
            {item.name}
          </Link>
        ))}
      </Breadcrumbs>

      {/* {breadcrumb.length <= 3 && <TextField variant="outlined" className="" placeholder="Search..." value={searchQuery} onChange={(e) => searchCallback(e.target.value)} />} */}
      {/* {breadcrumb.length <= 3 && <TextField variant="outlined" size="small" placeholder="Search..." value={searchQuery} onChange={(e) => searchCallback(e.target.value)} />} */}
      {/* <div className="searchBar border-black rounded-lg"> */}
      { breadcrumb.length <= 3 && 
        <input className="border-1 border-black rounded-lg p-2 m-0" type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      }
      {/* </div> */}
    </div>
  );
};

export default SecondaryNavbar;
