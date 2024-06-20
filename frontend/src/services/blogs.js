import axios from "axios";
const baseUrl = "/api/blogs";

let config;

const setToken = (token) => {
  config = { headers: { Authorization: `Bearer ${token}` } };
};

const getAll = async () => {
  const response = await axios.get(baseUrl, config);
  return response.data
};

const create = async (newBlog) => {
  const response = await axios.post(baseUrl, newBlog, config);
  return response.data;
};

const update = async (newInfoBlog) => {
  const response = await axios.put(
    `${baseUrl}/${newInfoBlog.id}`,
    newInfoBlog,
    config,
  );
  return response.data;
};

const remove = async (blogToDelete) => {
  const response = await axios.delete(`${baseUrl}/${blogToDelete.id}`, config);
  return response.data;
};

export default { getAll, create, update, remove, setToken };
