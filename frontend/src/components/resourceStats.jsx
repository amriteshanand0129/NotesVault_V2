import { useEffect, useState } from "react";
import axios from "axios";

const ResourceStats = () => {
  const [stats, setStats] = useState([]); // Initialize as an array

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/stats`);
        setStats(response.data); // Expecting an array of objects
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-wrap justify-between gap-6 p-6 lg:px-16 mt-10 w-[95%] mx-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-3xl shadow-md">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col items-center lg:p-4 sm:min-w-[50px] lg:min-w-[150px]">
          <span className="lg:text-4xl font-bold">{stat.value}+</span>
          <span className="sm:text-md lg:text-lg capitalize">{stat.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ResourceStats;
