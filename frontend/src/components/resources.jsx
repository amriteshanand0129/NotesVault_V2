import React, { useState, useEffect } from "react";
import { getSubjects } from "../api/resource.api.jsx";
import { useBreadcrumb } from "../context/breadcrumbContext.jsx";
import { userContext } from "../context/userContext.jsx";
import SecondaryNavbar from "./secondaryNavbar.jsx";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMessage } from "../context/messageContext";

const SubjectCard = ({ subjectCode, subjectName, resourceCount }) => {
  return (
    <Link to={`./${subjectCode}`}>
      <div className="grid gap-4 sm:px-2 lg:px-4 text-center">
        <div className="subject-card border-1 border-gray-400 bg-white text-gray-600 hover:border-black hover:text-black rounded-2xl shadow-md p-3 flex flex-col justify-center content-center max-w-[400px] transition-transform duration-200 hover:scale-105">
          <div>
            <h3 className="text-lg">{subjectCode}</h3>
            <h3 className="text-lg">{subjectName}</h3>
          </div>
          <p className="text-right text-sm">{resourceCount} files available</p>
        </div>
      </div>
    </Link>
  );
};

const Resources = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const { accessToken } = userContext();
  const { setBreadcrumb } = useBreadcrumb();
  const { showMessage } = useMessage();

  useEffect(() => {
    const fetchSubjects = async () => {
      const subjects = await getSubjects(accessToken);
      if(subjects.error) {
        showMessage(subjects.error, "error");
        return;
      }
      setSubjects(subjects.data);
      setFilteredSubjects(subjects.data);
    };

    fetchSubjects();
    setBreadcrumb([
      { name: "Dashboard", link: "/" },
      { name: "Resources", link: "/resources" },
    ]);
  }, [accessToken, setBreadcrumb]);

  const handleSearch = (searchTerm) => {
    const filtered = subjects.filter((subject) => {
      return subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) || subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredSubjects(filtered);
  };

  return (
    <div>
      <SecondaryNavbar searchCallback={handleSearch} message={`Subjects found: ${filteredSubjects.length}`} searchPlaceholder="Search by Subject Code/Name" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.subject_code} subjectCode={subject.subject_code} subjectName={subject.subject_name} resourceCount={subject.count} />
        ))}
      </div>
    </div>
  );
};

export default Resources;
