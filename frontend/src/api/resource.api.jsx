import axios from "axios";

const getSubjects = async (accessToken) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/subject_list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: "An error occurred while fetching subjects." };
  }
};

const getSubjectFiles = async (accessToken, subjectCode) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/subject_files/${subjectCode}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: "An error occurred while fetching subject files." };
  }
};

const getFileDetails = async (fileId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/file/${fileId}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: "An error occurred while fetching file details." };
  }
}

export { getSubjects, getSubjectFiles, getFileDetails };
