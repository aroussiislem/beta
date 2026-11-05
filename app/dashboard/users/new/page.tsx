"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/user-form";
import { ChevronLeft } from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (
    !isLoading &&
    (!isAuthenticated || !["ADMIN", "MANAGER"].includes(user?.role || ""))
  ) {
    return (
      <div className='p-8 text-center text-red-600 font-semibold'>
        Accès non autorisé
      </div>
    );
  }

  const handleSubmit = async (formData: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(
          data.error?.message || "Échec de la création de l'utilisateur",
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
            Ajouter un nouvel utilisateur
          </h1>
          <p className='text-slate-600 mt-1'>
            Créer un nouveau compte utilisateur
          </p>
        </div>
      </div>

      {/* Form */}
      <UserForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
        isEditing={false}
      />
    </div>
  );
}
