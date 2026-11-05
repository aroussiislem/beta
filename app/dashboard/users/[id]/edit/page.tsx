"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/user-form";
import { ChevronLeft } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  company?: string;
  address?: string;
  isActive: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || !["ADMIN", "MANAGER"].includes(user?.role || ""))
    ) {
      router.push("/dashboard/users");
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchUser();
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/users/${userId}`, {
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
        setUserData(data.data);
      } else {
        setError("Impossible de charger l'utilisateur");
      }
    } catch (err) {
      setError("Une erreur est survenue lors du chargement de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(
          data.error?.message || "Échec de la mise à jour de l'utilisateur",
        );
        return;
      }

      router.push("/dashboard/users");
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated || !["ADMIN", "MANAGER"].includes(user?.role || "")) {
    return null;
  }

  if (!userData) {
    return (
      <div className='text-center p-8'>
        <p className='text-red-600 mb-4'>{error || "Utilisateur non trouvé"}</p>
        <Link href='/dashboard/users'>
          <Button variant='outline'>Retour aux utilisateurs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/dashboard/users'>
          <Button variant='outline' size='icon'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            Modifier l'utilisateur
          </h1>
          <p className='text-slate-600 mt-1'>
            {userData.name} ({userData.email})
          </p>
        </div>
      </div>

      {/* Form */}
      <UserForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
        isEditing={true}
        initialData={userData}
      />
    </div>
  );
}
