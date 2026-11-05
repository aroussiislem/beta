"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Loader2,
  User,
  Mail,
  Shield,
  Phone,
  Building,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

interface UserFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  isEditing?: boolean;
  initialData?: any;
}

export function UserForm({
  onSubmit,
  isLoading = false,
  error,
  isEditing = false,
  initialData,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "CLIENT",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    address: initialData?.address || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !formData.password) {
      alert("Le mot de passe est requis pour les nouveaux utilisateurs");
      return;
    }

    if (!isEditing && formData.password) {
      if (formData.password.length < 8) {
        alert("Le mot de passe doit contenir au moins 8 caractères");
        return;
      }
    }

    let submitData = { ...formData };
    if (isEditing && !formData.password) {
      const { password, ...dataWithoutPassword } = submitData;
      submitData = dataWithoutPassword as typeof submitData;
    }

    await onSubmit(submitData);
  };

  return (
    <Card className='border-none shadow-sm rounded-3xl bg-white overflow-hidden'>
      <CardHeader className='p-8 border-b border-slate-50'>
        <CardTitle className='text-2xl font-black text-slate-900 tracking-tight'>
          {isEditing ? "Modifier l'utilisateur" : "Nouveau compte"}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-8'>
        <form onSubmit={handleSubmit} className='space-y-10'>
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <Alert
                variant='destructive'
                className='bg-red-50 border-red-100 text-red-600 rounded-2xl'
              >
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='font-bold'>
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Basic Info Section */}
          <div className='space-y-6'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center'>
                <Shield className='h-4 w-4 text-blue-600' />
              </div>
              <h3 className='font-black text-slate-900 uppercase text-xs tracking-widest'>
                Informations de base
              </h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Name */}
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  Nom complet
                </label>
                <div className='relative'>
                  <User className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                  <Input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='John Doe'
                    disabled={isLoading}
                    className='h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium'
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  Email
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                  <Input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='john@example.com'
                    disabled={isLoading || isEditing}
                    className='h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div className='space-y-2'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                Rôle de l'utilisateur
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger className='h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='rounded-2xl shadow-xl border-slate-100'>
                  <SelectItem value='ADMIN'>Administrateur</SelectItem>
                  <SelectItem value='MANAGER'>Manager</SelectItem>
                  <SelectItem value='DEVELOPER'>Développeur</SelectItem>
                  <SelectItem value='CLIENT'>Client</SelectItem>
                  <SelectItem value='ACCOUNTANT'>Comptable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className='space-y-6'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center'>
                <Phone className='h-4 w-4 text-purple-600' />
              </div>
              <h3 className='font-black text-slate-900 uppercase text-xs tracking-widest'>
                Coordonnées
              </h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Phone */}
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  Téléphone
                </label>
                <div className='relative'>
                  <Phone className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                  <Input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='+33 6 00 00 00 00'
                    disabled={isLoading}
                    className='h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium'
                  />
                </div>
              </div>

              {/* Company (only for CLIENT role) */}
              {formData.role === "CLIENT" && (
                <div className='space-y-2'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                    Entreprise
                  </label>
                  <div className='relative'>
                    <Building className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                    <Input
                      type='text'
                      name='company'
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder='Acme Corp'
                      disabled={isLoading}
                      className='h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Address (only for CLIENT role) */}
            {formData.role === "CLIENT" && (
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  Adresse
                </label>
                <div className='relative'>
                  <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                  <Input
                    type='text'
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder='123 Avenue de Paris'
                    disabled={isLoading}
                    className='h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          {!isEditing && (
            <div className='space-y-6'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center'>
                  <Shield className='h-4 w-4 text-orange-600' />
                </div>
                <h3 className='font-black text-slate-900 uppercase text-xs tracking-widest'>
                  Sécurité
                </h3>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  Mot de passe par défaut
                </label>
                <Input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='••••••••'
                  disabled={isLoading}
                  className='h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium'
                  required
                />
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1'>
                  Minimum 8 caractères, recommandé avec chiffres et symboles.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className='pt-6 border-t border-slate-50'>
            <Button
              type='submit'
              disabled={isLoading}
              className='h-12 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {isEditing ? "Mise à jour..." : "Création..."}
                </>
              ) : isEditing ? (
                "Sauvegarder les modifications"
              ) : (
                "Créer le compte"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
