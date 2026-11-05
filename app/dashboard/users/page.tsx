"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { translateRole } from "@/lib/ticket-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // Updated default value to 'all'
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !["ADMIN", "MANAGER"].includes(user.role)) {
      router.push("/dashboard");
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [search, roleFilter, users]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeleteLoading(id);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== id));
        setFilteredUsers(filteredUsers.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800",
      MANAGER: "bg-blue-100 text-blue-800",
      DEVELOPER: "bg-purple-100 text-purple-800",
      CLIENT: "bg-green-100 text-green-800",
      ACCOUNTANT: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Utilisateurs</h1>
          <p className='text-slate-600 mt-1'>
            Gérer les utilisateurs et leurs rôles
          </p>
        </div>
        {["ADMIN", "MANAGER"].includes(user?.role || "") && (
          <Link href='/dashboard/users/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Nouvel utilisateur
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Rechercher par nom ou email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filtrer par rôle' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tous les rôles</SelectItem>
                <SelectItem value='ADMIN'>Administrateur</SelectItem>
                <SelectItem value='MANAGER'>Manager</SelectItem>
                <SelectItem value='DEVELOPER'>Développeur</SelectItem>
                <SelectItem value='CLIENT'>Client</SelectItem>
                <SelectItem value='ACCOUNTANT'>Comptable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className='text-sm text-slate-600'>
            {filteredUsers.length === 0
              ? "Aucun utilisateur trouvé"
              : `Affichage de ${filteredUsers.length} utilisateur(s)`}
          </p>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              Chargement des utilisateurs...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='flex items-center justify-center py-8 text-slate-500'>
              Aucun utilisateur trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className='border-b'>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  {["ADMIN", "MANAGER"].includes(user?.role || "") && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className='font-medium'>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(u.role)}>
                        {translateRole(u.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.company || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "secondary"}>
                        {u.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-slate-600'>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    {["ADMIN", "MANAGER"].includes(user?.role || "") && (
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Link href={`/dashboard/users/${u.id}/edit`}>
                            <Button size='sm' variant='outline'>
                              <Edit2 className='h-4 w-4' />
                            </Button>
                          </Link>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleDelete(u.id)}
                            disabled={deleteLoading === u.id}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
