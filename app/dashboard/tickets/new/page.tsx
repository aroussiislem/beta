"use client";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, AlertCircle, Loader2 } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    complexity: "SIMPLE",
    estimatedHours: "",
    hourlyRate: "50",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      // Build request body, only include estimatedHours if it has a value
      const requestBody: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        complexity: formData.complexity,
        hourlyRate: parseFloat(formData.hourlyRate),
      };

      if (formData.estimatedHours) {
        requestBody.estimatedHours = parseFloat(formData.estimatedHours);
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Échec de la création du ticket");
        return;
      }

      router.push(`/dashboard/tickets/${data.data.id}`);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href='/dashboard/tickets'>
          <Button variant='outline' size='icon'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Créer un ticket</h1>
          <p className='text-slate-600 mt-1'>
            Créer un nouveau ticket de support
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Titre</label>
              <Input
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='Titre bref du problème'
                disabled={isSubmitting}
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Description</label>
              <Textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Description détaillée du problème'
                disabled={isSubmitting}
                required
                rows={6}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Priorité</label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => handleSelectChange("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Basse</SelectItem>
                    <SelectItem value='MEDIUM'>Moyenne</SelectItem>
                    <SelectItem value='HIGH'>Haute</SelectItem>
                    <SelectItem value='URGENT'>Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Complexité</label>
                <Select
                  value={formData.complexity}
                  onValueChange={(v) => handleSelectChange("complexity", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='SIMPLE'>Simple (1.0x)</SelectItem>
                    <SelectItem value='MEDIUM'>Moyenne (1.5x)</SelectItem>
                    <SelectItem value='COMPLEX'>Complexe (2.0x)</SelectItem>
                    <SelectItem value='VERY_COMPLEX'>
                      Très complexe (2.5x)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Heures estimées (Optionnel)
                </label>
                <Input
                  type='number'
                  step='0.5'
                  name='estimatedHours'
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  placeholder='4.5'
                  disabled={isSubmitting}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Taux horaire (€)</label>
                <Input
                  type='number'
                  step='0.01'
                  name='hourlyRate'
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className='flex gap-2'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Création...
                  </>
                ) : (
                  "Créer le ticket"
                )}
              </Button>
              <Link href='/dashboard/tickets'>
                <Button variant='outline' disabled={isSubmitting}>
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
