import React, { useState, useEffect } from 'react';
import api from '../../../api/apis';

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const getusers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/profile/users');
        if (response.status === 200) {
          setData(response.data.users); // Extract the users array
          setLoading(false);
        }
      } catch (error) {
        console.log("Something went wrong", error);
      }
    };
    getusers();
  }, []);

  if (loading) {
    return <div>Loading, please wait...</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      {data.map((user, index) => (
        <div key={index}>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default Users;