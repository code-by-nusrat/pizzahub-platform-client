import { getUsers } from '@/lib/user';
import React from 'react';

const AdminUsersPage = async() => {
    const users =await getUsers()
    console.log(users)
    return (
        <div>
            manage
        </div>
    );
};

export default AdminUsersPage;