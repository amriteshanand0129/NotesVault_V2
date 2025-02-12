import { useEffect, useState } from "react";
import axios from "axios";

const ResourceStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    subjects: 0,
    files: 0,
    contributions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-wrap justify-between gap-6 p-6 lg:px-16 mt-10 w-[95%] mx-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-3xl shadow-md">
      {Object.entries(stats).map(([key, data]) => (
        <div key={key} className="flex flex-col items-center lg:p-4 sm:min-w-[50px] lg:min-w-[150px]">
          <span className="lg:text-4xl font-bold">{data.value || data}+</span>
          <span className="sm:text-md lg:text-lg capitalize">{data.name || key.replace("_", " ")}</span>
        </div>
      ))}
    </div>
  );
};

export default ResourceStats;
