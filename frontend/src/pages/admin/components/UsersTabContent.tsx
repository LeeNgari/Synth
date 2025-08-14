import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";
import { Users, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const UsersTabContent = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get("/users");
                setUsers(res.data);
            } catch (err) {
                setError("Failed to fetch users.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        const originalUsers = [...users];
        // Optimistically update the UI
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));

        try {
            await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success("User role updated successfully!");
        } catch (error) {
            // Revert the UI on error
            setUsers(originalUsers);
            toast.error("Failed to update user role.");
            console.error(error);
        }
    };

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <Users className='text-white' />
                        User Management
                    </h2>
                    <p className="text-white">View and manage user roles</p>
                </div>
            </div>
            {isLoading && <p>Loading users...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <Table>
                    <TableHeader>
                        <TableRow className='hover:bg-zinc-800/50 border-b-zinc-700 text-white'>
                            <TableHead className='w-[50px]'></TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} className='hover:bg-zinc-800/50 border-b-zinc-800'>
                                <TableCell>
                                    <img src={user.imageUrl} alt={user.fullName} className='w-10 h-10 rounded-full object-cover' />
                                </TableCell>
                                <TableCell className='font-medium flex items-center gap-2'>
                                    {user.fullName}
                                    {user.role === 'admin' && <ShieldCheck className="size-4 text-green-500" />}
                                </TableCell>
                                <TableCell>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value as 'user' | 'admin')}
                                        className="bg-zinc-800 text-white border border-zinc-700 rounded-md p-2"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default UsersTabContent;