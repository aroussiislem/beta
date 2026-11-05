"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit2 } from "lucide-react";
import { translateRole } from "@/lib/ticket-utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  company?: string;
  address?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = params.id as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchUser();
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      } else {
        setError("Échec du chargement de l'utilisateur");
      }
    } catch (err) {
      setError("Une erreur est survenue lors du chargement de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    return (
      <div className='text-center'>
        <p className='text-slate-600'>{error || "Utilisateur non trouvé"}</p>
        <Link href='/dashboard/users'>
          <Button className='mt-4'>Retour aux utilisateurs</Button>
        </Link>
      </div>
    );
  }

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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/users'>
            <Button variant='outline' size='icon'>
              <ChevronLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>{user.name}</h1>
            <p className='text-slate-600'>{user.email}</p>
          </div>
        </div>
        <Link href={`/dashboard/users/${user.id}/edit`}>
          <Button>
            <Edit2 className='mr-2 h-4 w-4' />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Main Info */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Basic Info */}
        <div className='md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-slate-500'>Nom</p>
                  <p className='text-lg font-medium'>{user.name}</p>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>Email</p>
                  <p className='text-lg font-medium'>{user.email}</p>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>Rôle</p>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {translateRole(user.role)}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>Statut</p>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              {user.phone && (
                <div>
                  <p className='text-sm text-slate-500'>Téléphone</p>
                  <p className='text-lg'>{user.phone}</p>
                </div>
              )}

              {user.company && (
                <div>
                  <p className='text-sm text-slate-500'>Entreprise</p>
                  <p className='text-lg'>{user.company}</p>
                </div>
              )}

              {user.address && (
                <div>
                  <p className='text-sm text-slate-500'>Adresse</p>
                  <p className='text-lg'>{user.address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-slate-500'>Créé le</p>
              <p className='text-sm font-medium'>
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500'>Dernière mise à jour</p>
              <p className='text-sm font-medium'>
                {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
