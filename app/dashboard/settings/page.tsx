"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { translateRole } from "@/lib/ticket-utils";

export default function SettingsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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
      <div>
        <h1 className='text-3xl font-bold text-slate-900'>Paramètres</h1>
        <p className='text-slate-600 mt-1'>
          Gérer les paramètres de votre compte
        </p>
      </div>

      {/* Coming Soon */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardHeader>
          <CardTitle className='text-blue-900'>Bientôt disponible</CardTitle>
        </CardHeader>
        <CardContent className='text-blue-800'>
          <p>Les fonctionnalités des paramètres seront disponibles bientôt :</p>
          <ul className='list-disc list-inside space-y-1 mt-2 ml-2'>
            <li>Préférences du compte</li>
            <li>Changement de mot de passe</li>
            <li>Paramètres de notification</li>
            <li>Jetons API</li>
            <li>Intégrations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Votre compte</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-slate-500'>Nom</p>
            <p className='font-medium'>{user?.name}</p>
          </div>
          <div>
            <p className='text-sm text-slate-500'>Email</p>
            <p className='font-medium'>{user?.email}</p>
          </div>
          <div>
            <p className='text-sm text-slate-500'>Rôle</p>
            <p className='font-medium capitalize'>
              {translateRole(user?.role || "")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
