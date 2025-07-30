import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/types";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const UsersTabContent = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await axios.get("http://localhost:5000/api/users", {
                    withCredentials: true
                });
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

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <Users className='text-white' />
                        User Management
                    </h2>
                    <p className="text-white">View and manage users</p>
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
                            <TableHead>Email</TableHead>
                            <TableHead>Joined At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} className='hover:bg-zinc-800/50 border-b-zinc-800'>
                                <TableCell>
                                    <img src={user.imageUrl} alt={user.fullName} className='w-10 h-10 rounded-full object-cover' />
                                </TableCell>
                                <TableCell className='font-medium'>{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
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
